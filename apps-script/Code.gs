/**
 * ระบบติดตามผลงานวิชาการ บัณฑิตวิทยาลัย มหาวิทยาลัยมหิดล (MUGR)
 * ตัวเชื่อมฐานข้อมูล Google Sheets (Apps Script Web App)
 *
 * วิธีติดตั้ง (วางไฟล์นี้ไฟล์เดียว)
 * 1) เปิด Google Sheet > ส่วนขยาย > Apps Script > ลบโค้ดเดิมใน Code.gs แล้ววางโค้ดนี้ทั้งหมด > บันทึก
 * 2) (ไม่บังคับ) ใส่อีเมลผู้ดูแลระบบใน ADMIN_EMAILS ด้านล่าง
 * 3) เลือกฟังก์ชัน setup แล้วกด Run หนึ่งครั้ง > อนุญาตสิทธิ์ (ใช้ชีต + เชื่อมต่อบริการภายนอก)
 * 4) Deploy > New deployment > Web app · Execute as: Me · Who has access: Anyone
 * 5) เปิด URL (.../exec) แล้วเข้าสู่ระบบ (admin / admin1234 หรือสมัครด้วยอีเมลใน ADMIN_EMAILS)
 *
 * สิทธิ์การเข้าถึงข้อมูลถูกตรวจซ้ำที่ฝั่งเซิร์ฟเวอร์นี้ (ไม่เชื่อข้อมูลจากเบราว์เซอร์)
 *
 * การสมัครใช้งานด้วยอีเมล
 * - ผู้ใช้สมัครที่หน้าเข้าสู่ระบบ → สถานะ "รออนุมัติ" → Admin อนุมัติและกำหนดสิทธิ์ที่ จัดการระบบ > ผู้ใช้งาน
 * - อีเมลใน ADMIN_EMAILS (ด้านล่าง) หรือในหน้า ตั้งค่าเกณฑ์ > อีเมลผู้ดูแลระบบ จะได้สิทธิ์ Admin ทันทีเมื่อสมัคร
 */

// ใส่อีเมลผู้ดูแลระบบ เช่น ['staff1@mahidol.ac.th', 'staff2@mahidol.ac.th']
// ถ้ากำหนดไว้ setup จะไม่สร้างบัญชี admin / admin1234 — ให้สมัครด้วยอีเมลเหล่านี้แทน
var ADMIN_EMAILS = [];

var FIELDS = {
  programs: ['id', 'name', 'degree', 'level', 'chair', 'curriculumYear', 'updatedAt'],
  lecturers: ['id', 'prefix', 'position', 'nameTh', 'nameEn', 'programId', 'type', 'email', 'degree', 'scopusId', 'orcid', 'active', 'updatedAt'],
  works: ['id', 'lecturerId', 'title', 'type', 'authorRole', 'category', 'quartile', 'journal', 'issn', 'year', 'detail', 'doi', 'url', 'note',
    'status', 'reviewNote', 'reviewedBy', 'reviewedAt', 'createdBy', 'createdAt', 'updatedAt'],
  // เพิ่มคอลัมน์ใหม่ต่อท้ายเสมอ เพื่อให้ข้อมูลเดิมในชีตยังตรงคอลัมน์
  users: ['id', 'username', 'displayName', 'role', 'programId', 'lecturerId', 'passwordHash', 'updatedAt',
    'email', 'status', 'requestedRole', 'requestedProgramId', 'requestNote', 'createdAt', 'approvedBy', 'approvedAt'],
  externals: ['id', 'prefix', 'position', 'nameTh', 'nameEn', 'affiliation', 'degreeLevel', 'degreeName', 'role', 'programId', 'examLevel', 'standard',
    'scopusId', 'orcid', 'researchExp', 'pubs', 'checkNote', 'checkResult', 'checkedBy', 'checkedAt', 'createdBy', 'createdAt', 'updatedAt'],
};
var JSON_FIELDS = { pubs: true };
var BOOL_FIELDS = { active: true, researchExp: true };
var SHEET_NAMES = { programs: 'Programs', lecturers: 'Lecturers', works: 'Works', users: 'Users', externals: 'Externals' };
var SESSION_SECONDS = 6 * 60 * 60;

// ---------------- setup ----------------
function setup() {
  // ทดสอบโหลดหน้าเว็บ (ทำให้ Google ขอสิทธิ์เชื่อมต่อบริการภายนอกตั้งแต่ตอนนี้)
  try { loadUi(true); } catch (e) { Logger.log('โหลดหน้าเว็บไม่สำเร็จ: ' + e.message); }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(FIELDS).forEach(function (entity) {
    var sh = ss.getSheetByName(SHEET_NAMES[entity]) || ss.insertSheet(SHEET_NAMES[entity]);
    sh.getRange(1, 1, 1, FIELDS[entity].length).setValues([FIELDS[entity]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  if (!ss.getSheetByName('Settings')) ss.insertSheet('Settings').getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  if (!ADMIN_EMAILS.length && !readAll('users').some(function (u) { return u.role === 'admin'; })) {
    writeRecord('users', { id: 'u_admin', username: 'admin', displayName: 'ผู้ดูแลระบบ', role: 'admin', passwordHash: sha256('admin:admin1234'), updatedAt: new Date().toISOString() });
  }
}

// ---------------- HTTP ----------------
// เปิดหน้าเว็บของระบบ (ไฟล์ index.html ในโปรเจกต์ Apps Script) — ?ping=1 ใช้ทดสอบว่าเว็บแอปทำงาน
// ---------------- หน้าเว็บ ----------------
// หน้าเว็บทั้งหมดอยู่ในไฟล์ dist/mugr-app.html บน GitHub — วางแค่ Code.gs ไฟล์เดียวก็ใช้งานได้
// เมื่อระบบถูกปรับปรุงบน GitHub หน้าเว็บจะอัปเดตเองภายใน ~6 ชั่วโมง (หรือเปิด URL ต่อท้าย ?refresh=1 เพื่อโหลดใหม่ทันที)
var UI_URLS = [
  'https://raw.githubusercontent.com/radtiyat-sudo/adjunct-professor-checker/claude/academic-work-tracking-system-mk0oiy/dist/mugr-app.html',
];
var UI_CACHE_SECONDS = 6 * 60 * 60;
var UI_CHUNK = 25000; // CacheService เก็บได้ไม่เกิน 100KB ต่อคีย์

// ?ping=1 ใช้ทดสอบว่าเว็บแอปทำงาน · ?refresh=1 โหลดหน้าเว็บจาก GitHub ใหม่
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.ping) return json({ ok: true, service: 'mugr-academic-tracker', time: new Date().toISOString() });
  var html;
  try {
    html = loadUi(!!p.refresh);
  } catch (err) {
    // สำรอง: ถ้าโหลดจาก GitHub ไม่ได้ และมีไฟล์ HTML แบบแยกไฟล์ (index, css, app1…) ในโปรเจกต์ ให้ใช้ไฟล์เหล่านั้น
    try {
      return HtmlService.createTemplateFromFile('index').evaluate()
        .setTitle('ระบบติดตามผลงานวิชาการ | บัณฑิตวิทยาลัย มหาวิทยาลัยมหิดล (MUGR)')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } catch (x) {
      return HtmlService.createHtmlOutput('<div style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px">' +
        '<h2>โหลดหน้าเว็บไม่สำเร็จ</h2><p>' + String(err && err.message || err).replace(/</g, '&lt;') + '</p>' +
        '<p>ตรวจว่ารันฟังก์ชัน setup และกดอนุญาตสิทธิ์ "เชื่อมต่อบริการภายนอก" แล้ว จากนั้น Deploy เป็น New version และเปิดลิงก์อีกครั้ง</p></div>');
    }
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle('ระบบติดตามผลงานวิชาการ | บัณฑิตวิทยาลัย มหาวิทยาลัยมหิดล (MUGR)')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function loadUi(refresh) {
  var cache = CacheService.getScriptCache();
  if (!refresh) {
    var n = Number(cache.get('ui_n') || 0);
    if (n) {
      var keys = [];
      for (var i = 0; i < n; i++) keys.push('ui_' + i);
      var got = cache.getAll(keys), parts = [];
      for (var j = 0; j < n; j++) { if (got['ui_' + j] == null) { parts = null; break; } parts.push(got['ui_' + j]); }
      if (parts) return parts.join('');
    }
  }
  var lastErr;
  for (var u = 0; u < UI_URLS.length; u++) {
    try {
      var res = UrlFetchApp.fetch(UI_URLS[u] + '?v=' + Date.now(), { muteHttpExceptions: true });
      var text = res.getResponseCode() === 200 ? res.getContentText('UTF-8') : '';
      if (text.indexOf('</html>') < 0) throw new Error('ดาวน์โหลดหน้าเว็บไม่สำเร็จ (' + res.getResponseCode() + ')');
      var put = {}, count = Math.ceil(text.length / UI_CHUNK);
      for (var k = 0; k < count; k++) put['ui_' + k] = text.slice(k * UI_CHUNK, (k + 1) * UI_CHUNK);
      put.ui_n = String(count);
      try { cache.putAll(put, UI_CACHE_SECONDS); } catch (x) {}
      return text;
    } catch (err) { lastErr = err; }
  }
  throw lastErr || new Error('ไม่มีแหล่งหน้าเว็บ');
}

// (ทางเลือก) รวมไฟล์ย่อยแบบเดิม (index, css, criteria, app1…) ถ้ายังมีไฟล์เหล่านั้นในโปรเจกต์
var APP_PARTS = 9; // จำนวนไฟล์ app1…appN ของแบบแยกไฟล์ (ทางเลือก)
function include(name) {
  try {
    return HtmlService.createHtmlOutputFromFile(name).getContent();
  } catch (err) {
    throw new Error('ไม่พบไฟล์ HTML ชื่อ "' + name + '" ในโปรเจกต์ Apps Script');
  }
}

// เรียกจากหน้าเว็บที่เปิดผ่าน Apps Script (google.script.run.api)
function api(body) {
  return handle(JSON.parse(body || '{}'));
}

// เรียกจากหน้าเว็บที่โฮสต์ภายนอก เช่น GitHub Pages (fetch POST)
function doPost(e) {
  return json(handle(JSON.parse((e && e.postData && e.postData.contents) || '{}')));
}

function handle(req) {
  var lock = LockService.getScriptLock();
  try {
    if (req.action === 'login') return login(req);
    if (req.action === 'lookup') return lookup(req);
    if (req.action === 'register') { lock.waitLock(20000); return register(req); }
    if (req.action === 'programs') return { ok: true, programs: readAll('programs').map(function (p) { return { id: p.id, name: p.name, level: p.level }; }) };
    var user = auth(req.token);
    lock.waitLock(20000);
    switch (req.action) {
      case 'load': return { ok: true, user: publicUser(user), data: loadData(user) };
      case 'upsert': return { ok: true, record: upsert(user, req.entity, req.record) };
      case 'remove': removeRecord(user, req.entity, req.id); return { ok: true };
      case 'replaceAll': replaceAll(user, req.data); return { ok: true };
      case 'logout': CacheService.getScriptCache().remove('t_' + req.token); return { ok: true };
      case 'openalex': return { ok: true, data: openalex(req.path) };
      case 'journalsClassify': return { ok: true, map: journalsClassify(req.issns || []) };
      case 'journalsStats': return { ok: true, stats: journalsStats() };
      case 'journalsImport':
        if (user.role !== 'admin') throw new Error('เฉพาะผู้ดูแลระบบ');
        return { ok: true, count: journalsImport(req.category, req.rows || [], !!req.replace) };
      default: throw new Error('ไม่รู้จักคำสั่ง ' + req.action);
    }
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
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
  if (!u || u.passwordHash !== req.passwordHash) throw new Error('อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง');
  var blocked = blockReason(u);
  if (blocked) throw new Error(blocked);
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('t_' + token, u.id, SESSION_SECONDS);
  return { ok: true, token: token, user: publicUser(u), data: loadData(u) };
}

function auth(token) {
  var id = token && CacheService.getScriptCache().get('t_' + token);
  if (!id) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  var u = readAll('users').filter(function (x) { return x.id === id; })[0];
  if (!u) throw new Error('ไม่พบผู้ใช้');
  if (blockReason(u)) throw new Error(blockReason(u));
  return u;
}

function blockReason(u) {
  if (u.status === 'pending') return 'บัญชีนี้อยู่ระหว่างรอผู้ดูแลระบบอนุมัติ กรุณาลองใหม่ภายหลัง';
  if (u.status === 'rejected') return 'คำขอสมัครใช้งานไม่ได้รับอนุมัติ กรุณาติดต่อผู้ดูแลระบบ';
  if (u.status === 'disabled') return 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
  return '';
}

function isAdminEmail(email) {
  var list = ADMIN_EMAILS.concat(readSettings().adminEmails || []).map(function (x) { return String(x).trim().toLowerCase(); });
  return list.indexOf(email) >= 0;
}

// แปลงอีเมลเป็นชื่อผู้ใช้ (รหัสผ่านถูก hash คู่กับชื่อผู้ใช้)
function lookup(req) {
  var id = String(req.username || '').toLowerCase();
  var u = readAll('users').filter(function (x) { return x.username === id || (x.email && x.email === id); })[0];
  return { ok: true, username: u ? u.username : id };
}

// สมัครใช้งานด้วยอีเมล (ไม่ต้องเข้าสู่ระบบ)
function register(req) {
  var email = String(req.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('กรุณากรอกอีเมลให้ถูกต้อง');
  if (!req.displayName || !String(req.displayName).trim()) throw new Error('กรุณากรอกชื่อ - นามสกุล');
  if (!/^[0-9a-f]{64}$/.test(String(req.passwordHash || ''))) throw new Error('ข้อมูลรหัสผ่านไม่ถูกต้อง');
  var users = readAll('users');
  if (users.some(function (u) { return u.username === email || u.email === email; })) throw new Error('อีเมลนี้ถูกใช้สมัครแล้ว หากลืมรหัสผ่านกรุณาติดต่อผู้ดูแลระบบ');
  var admin = isAdminEmail(email);
  var roles = ['lecturer', 'chair', 'executive', 'admin'];
  var now = new Date().toISOString();
  writeRecord('users', {
    id: 'u_' + Utilities.getUuid().slice(0, 12), username: email, email: email, displayName: String(req.displayName).trim().slice(0, 120),
    passwordHash: req.passwordHash, role: admin ? 'admin' : '', status: admin ? 'active' : 'pending',
    requestedRole: roles.indexOf(req.requestedRole) >= 0 ? req.requestedRole : 'lecturer',
    requestedProgramId: String(req.requestedProgramId || ''), requestNote: String(req.requestNote || '').slice(0, 300),
    createdAt: now, updatedAt: now, approvedBy: admin ? 'อัตโนมัติ (ADMIN_EMAILS)' : '', approvedAt: admin ? now : '',
  });
  return { ok: true, status: admin ? 'active' : 'pending' };
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

var HEADER_OK = {};
function sheetOf(entity) {
  if (!FIELDS[entity]) throw new Error('ไม่รู้จักข้อมูลประเภท ' + entity);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES[entity]);
  if (!sh) throw new Error('ไม่พบชีต ' + SHEET_NAMES[entity] + ' — กรุณารันฟังก์ชัน setup');
  // อัปเดตหัวตารางอัตโนมัติเมื่อมีคอลัมน์ใหม่ (คอลัมน์ใหม่อยู่ท้ายเสมอ ข้อมูลเดิมไม่เลื่อน)
  if (!HEADER_OK[entity]) {
    var want = FIELDS[entity];
    var head = sh.getRange(1, 1, 1, want.length).getValues()[0];
    if (head.join('|') !== want.join('|')) sh.getRange(1, 1, 1, want.length).setValues([want]);
    HEADER_OK[entity] = true;
  }
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

// ---------------- ค้นผลงานออนไลน์ (OpenAlex) ----------------
function openalex(path) {
  path = String(path || '');
  if (!/^\/(authors|works)\?[\w\-.:=&%,*|]+$/.test(path)) throw new Error('คำค้นไม่ถูกต้อง');
  var res = UrlFetchApp.fetch('https://api.openalex.org' + path, { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
  if (res.getResponseCode() !== 200) throw new Error('ฐานข้อมูลออนไลน์ตอบกลับผิดพลาด (' + res.getResponseCode() + ')');
  return JSON.parse(res.getContentText());
}

// ---------------- ฐานรายชื่อวารสาร (ชีต Journals: issn | category | title) ----------------
var JOURNAL_PRI = { tci2: 1, tci1: 2, scopus: 3 };
function journalsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Journals');
  if (!sh) { sh = ss.insertSheet('Journals'); sh.getRange(1, 1, 1, 3).setValues([['issn', 'category', 'title']]); }
  return sh;
}
function journalsMap() {
  var values = journalsSheet().getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) if (values[i][0]) map[values[i][0]] = { category: values[i][1], title: values[i][2] };
  return map;
}
function journalsClassify(issns) {
  var map = journalsMap(), out = {};
  issns.slice(0, 5000).forEach(function (i) { if (map[i]) out[i] = map[i].category; });
  return out;
}
function journalsStats() {
  var map = journalsMap(), stats = {};
  Object.keys(map).forEach(function (k) { var c = map[k].category; stats[c] = (stats[c] || 0) + 1; });
  return stats;
}
function journalsImport(category, rows, replace) {
  if (!JOURNAL_PRI[category]) throw new Error('กลุ่มวารสารไม่ถูกต้อง');
  var map = journalsMap();
  if (replace) Object.keys(map).forEach(function (k) { if (map[k].category === category) delete map[k]; });
  rows.forEach(function (r) {
    var issn = String(r.issn || '');
    if (!/^\d{4}-\d{3}[\dX]$/.test(issn)) return;
    if (!map[issn] || JOURNAL_PRI[category] > JOURNAL_PRI[map[issn].category]) map[issn] = { category: category, title: String(r.title || '').slice(0, 200) };
  });
  var sh = journalsSheet();
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).clearContent();
  var out = Object.keys(map).map(function (k) { return [k, map[k].category, map[k].title]; });
  if (out.length) sh.getRange(2, 1, out.length, 3).setValues(out);
  return rows.length;
}

// ---------------- permissions ----------------
function lecturerProgram(lecturerId) { var l = byId('lecturers', lecturerId); return l ? l.programId : null; }

function assertCan(user, entity, rec, existing) {
  var r = user.role;
  if (r === 'admin') return;
  var deny = function () { throw new Error('ไม่มีสิทธิ์ดำเนินการนี้'); };
  // โหมดผู้ดูแลระบบจัดการคนเดียว (ค่าเริ่มต้น): บทบาทอื่นแก้ไขข้อมูลไม่ได้
  if (readSettings().adminOnlyEdit !== false) throw new Error('เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขข้อมูลได้');
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
