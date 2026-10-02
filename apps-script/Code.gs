/**
 * ระบบติดตามผลงานวิชาการ บัณฑิตวิทยาลัย มหาวิทยาลัยมหิดล (MUGR)
 * ตัวเชื่อมฐานข้อมูล Google Sheets (Apps Script Web App)
 *
 * วิธีติดตั้ง
 * 1) สร้าง Google Sheet ใหม่ > ส่วนขยาย > Apps Script > วางโค้ดนี้แทนที่ Code.gs
 * 2) เลือกฟังก์ชัน setup แล้วกด Run หนึ่งครั้ง (อนุญาตสิทธิ์) — จะสร้างชีตและบัญชี admin / admin1234
 * 3) Deploy > New deployment > Web app · Execute as: Me · Who has access: Anyone
 * 4) คัดลอก URL (.../exec) ไปใส่ในระบบที่ จัดการระบบ > การเชื่อมต่อ
 * 5) เข้าสู่ระบบด้วย admin แล้วเปลี่ยนรหัสผ่านทันที
 *
 * สิทธิ์การเข้าถึงข้อมูลถูกตรวจซ้ำที่ฝั่งเซิร์ฟเวอร์นี้ (ไม่เชื่อข้อมูลจากเบราว์เซอร์)
 */

var FIELDS = {
  programs: ['id', 'name', 'degree', 'level', 'chair', 'curriculumYear', 'updatedAt'],
  lecturers: ['id', 'prefix', 'position', 'nameTh', 'nameEn', 'programId', 'type', 'email', 'degree', 'scopusId', 'orcid', 'active', 'updatedAt'],
  works: ['id', 'lecturerId', 'title', 'type', 'authorRole', 'category', 'quartile', 'journal', 'issn', 'year', 'detail', 'doi', 'url', 'note',
    'status', 'reviewNote', 'reviewedBy', 'reviewedAt', 'createdBy', 'createdAt', 'updatedAt'],
  users: ['id', 'username', 'displayName', 'role', 'programId', 'lecturerId', 'passwordHash', 'updatedAt'],
  externals: ['id', 'prefix', 'position', 'nameTh', 'nameEn', 'affiliation', 'degreeLevel', 'degreeName', 'role', 'programId', 'examLevel', 'standard',
    'scopusId', 'orcid', 'researchExp', 'pubs', 'checkNote', 'checkResult', 'checkedBy', 'checkedAt', 'createdBy', 'createdAt', 'updatedAt'],
};
var JSON_FIELDS = { pubs: true };
var BOOL_FIELDS = { active: true, researchExp: true };
var SHEET_NAMES = { programs: 'Programs', lecturers: 'Lecturers', works: 'Works', users: 'Users', externals: 'Externals' };
var SESSION_SECONDS = 6 * 60 * 60;

// ---------------- setup ----------------
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(FIELDS).forEach(function (entity) {
    var sh = ss.getSheetByName(SHEET_NAMES[entity]) || ss.insertSheet(SHEET_NAMES[entity]);
    sh.getRange(1, 1, 1, FIELDS[entity].length).setValues([FIELDS[entity]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  if (!ss.getSheetByName('Settings')) ss.insertSheet('Settings').getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  if (!readAll('users').some(function (u) { return u.role === 'admin'; })) {
    writeRecord('users', { id: 'u_admin', username: 'admin', displayName: 'ผู้ดูแลระบบ', role: 'admin', passwordHash: sha256('admin:admin1234'), updatedAt: new Date().toISOString() });
  }
}

// ---------------- HTTP ----------------
function doGet() {
  return json({ ok: true, service: 'mugr-academic-tracker', time: new Date().toISOString() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    if (req.action === 'login') return json(login(req));
    var user = auth(req.token);
    lock.waitLock(20000);
    switch (req.action) {
      case 'load': return json({ ok: true, user: publicUser(user), data: loadData(user) });
      case 'upsert': return json({ ok: true, record: upsert(user, req.entity, req.record) });
      case 'remove': removeRecord(user, req.entity, req.id); return json({ ok: true });
      case 'replaceAll': replaceAll(user, req.data); return json({ ok: true });
      case 'logout': CacheService.getScriptCache().remove('t_' + req.token); return json({ ok: true });
      default: throw new Error('ไม่รู้จักคำสั่ง ' + req.action);
    }
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------- auth ----------------
function login(req) {
  var username = String(req.username || '').toLowerCase();
  var u = readAll('users').filter(function (x) { return x.username === username; })[0];
  if (!u || u.passwordHash !== req.passwordHash) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('t_' + token, u.id, SESSION_SECONDS);
  return { ok: true, token: token, user: publicUser(u), data: loadData(u) };
}

function auth(token) {
  var id = token && CacheService.getScriptCache().get('t_' + token);
  if (!id) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  var u = readAll('users').filter(function (x) { return x.id === id; })[0];
  if (!u) throw new Error('ไม่พบผู้ใช้');
  return u;
}

function publicUser(u) {
  var c = {}; Object.keys(u).forEach(function (k) { if (k !== 'passwordHash') c[k] = u[k]; }); return c;
}

function sha256(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

// ---------------- data ----------------
function loadData(user) {
  var data = {};
  Object.keys(FIELDS).forEach(function (k) { data[k] = readAll(k); });
  // ผู้ใช้ที่ไม่ใช่ admin เห็นเฉพาะบัญชีตนเอง และไม่ส่งรหัสผ่านออกไป
  data.users = (user.role === 'admin' ? data.users : data.users.filter(function (u) { return u.id === user.id; })).map(publicUser);
  if (user.role === 'lecturer') data.externals = [];
  data.settings = readSettings();
  return data;
}

function sheetOf(entity) {
  if (!FIELDS[entity]) throw new Error('ไม่รู้จักข้อมูลประเภท ' + entity);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES[entity]);
  if (!sh) throw new Error('ไม่พบชีต ' + SHEET_NAMES[entity] + ' — กรุณารันฟังก์ชัน setup');
  return sh;
}

function readAll(entity) {
  var sh = sheetOf(entity);
  var values = sh.getDataRange().getValues();
  var head = values.shift() || [];
  return values.filter(function (r) { return r[0] !== ''; }).map(function (r) {
    var o = {};
    head.forEach(function (h, i) {
      var v = r[i];
      if (v instanceof Date) v = v.toISOString();
      if (JSON_FIELDS[h]) { try { v = v ? JSON.parse(v) : []; } catch (e) { v = []; } }
      if (BOOL_FIELDS[h]) v = v === true || v === 'TRUE' || v === 'true';
      o[h] = v;
    });
    return o;
  });
}

function rowOf(entity, rec) {
  return FIELDS[entity].map(function (f) {
    var v = rec[f];
    if (JSON_FIELDS[f]) return JSON.stringify(v || []);
    if (v === undefined || v === null) return '';
    return v;
  });
}

function writeRecord(entity, rec) {
  var sh = sheetOf(entity);
  var ids = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().map(function (r) { return r[0]; });
  var idx = ids.indexOf(rec.id);
  var row = rowOf(entity, rec);
  if (idx > 0) sh.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
  return rec;
}

function deleteRecord(entity, id) {
  var sh = sheetOf(entity);
  var ids = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().map(function (r) { return r[0]; });
  var idx = ids.indexOf(id);
  if (idx > 0) sh.deleteRow(idx + 1);
}

function readSettings() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sh) return {};
  var v = sh.getDataRange().getValues().filter(function (r) { return r[0] === 'settings'; })[0];
  try { return v ? JSON.parse(v[1]) : {}; } catch (e) { return {}; }
}

function writeSettings(s) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) if (values[i][0] === 'settings') { sh.getRange(i + 1, 2).setValue(JSON.stringify(s)); return; }
  sh.appendRow(['settings', JSON.stringify(s)]);
}

function byId(entity, id) { return readAll(entity).filter(function (x) { return x.id === id; })[0]; }

// ---------------- permissions ----------------
function lecturerProgram(lecturerId) { var l = byId('lecturers', lecturerId); return l ? l.programId : null; }

function assertCan(user, entity, rec, existing) {
  var r = user.role;
  if (r === 'admin') return;
  var deny = function () { throw new Error('ไม่มีสิทธิ์ดำเนินการนี้'); };
  if (r === 'executive') deny();
  if (entity === 'users' || entity === 'programs' || entity === 'settings') deny();
  if (entity === 'externals') { if (r !== 'chair') deny(); return; }
  if (entity === 'lecturers') {
    if (r === 'chair') { if (rec.programId !== user.programId || (existing && existing.programId !== user.programId)) deny(); return; }
    if (r === 'lecturer') { if (!existing || rec.id !== user.lecturerId) deny(); rec.programId = existing.programId; rec.type = existing.type; rec.active = existing.active; return; }
  }
  if (entity === 'works') {
    if (r === 'chair') {
      if (lecturerProgram(rec.lecturerId) !== user.programId || (existing && lecturerProgram(existing.lecturerId) !== user.programId)) deny();
      return;
    }
    if (r === 'lecturer') {
      if (rec.lecturerId !== user.lecturerId || (existing && (existing.lecturerId !== user.lecturerId || existing.status === 'verified'))) deny();
      // อาจารย์รับรองผลงานตนเองไม่ได้ — ผลงานใหม่/แก้ไขจะกลับเป็น "รอตรวจสอบ"
      rec.status = 'pending';
      ['reviewedBy', 'reviewedAt'].forEach(function (k) { rec[k] = existing ? existing[k] : ''; });
      rec.reviewNote = existing ? existing.reviewNote : '';
      return;
    }
  }
  deny();
}

function upsert(user, entity, rec) {
  if (!rec || !rec.id) throw new Error('ข้อมูลไม่ครบ');
  rec.updatedAt = new Date().toISOString();
  if (entity === 'settings') { assertCan(user, 'settings', rec); writeSettings(rec); return rec; }
  var existing = byId(entity, rec.id);
  assertCan(user, entity, rec, existing);
  if (entity === 'users') {
    if (!rec.passwordHash && existing) rec.passwordHash = existing.passwordHash;
    if (!existing && readAll('users').some(function (u) { return u.username === rec.username; })) throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
  }
  writeRecord(entity, rec);
  return entity === 'users' ? publicUser(rec) : rec;
}

function removeRecord(user, entity, id) {
  var existing = byId(entity, id);
  if (!existing) return;
  assertCan(user, entity, existing, existing);
  if (entity === 'users' && id === user.id) throw new Error('ไม่สามารถลบบัญชีของตนเองได้');
  deleteRecord(entity, id);
}

function replaceAll(user, data) {
  if (user.role !== 'admin') throw new Error('เฉพาะผู้ดูแลระบบ');
  var currentUsers = readAll('users');
  Object.keys(FIELDS).forEach(function (entity) {
    var sh = sheetOf(entity);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    var list = (data[entity] || []).map(function (rec) {
      // คงรหัสผ่านเดิมไว้ หากไฟล์สำรองไม่มี passwordHash
      if (entity === 'users' && !rec.passwordHash) {
        var old = currentUsers.filter(function (u) { return u.username === rec.username; })[0];
        rec.passwordHash = old ? old.passwordHash : '';
      }
      return rowOf(entity, rec);
    });
    if (list.length) sh.getRange(2, 1, list.length, FIELDS[entity].length).setValues(list);
  });
  if (data.settings) writeSettings(data.settings);
}
