/* ระบบติดตามผลงานวิชาการ — วิทยาลัยสงฆ์นครพนม
 * Single-page app (vanilla JS). เก็บข้อมูลใน localStorage หรือเชื่อมต่อ Google Sheets ผ่าน Apps Script (apps-script/Code.gs)
 */
(function () {
  'use strict';
  const C = window.CRITERIA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ================= Icons =================
  const ICONS = {
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
    users: 'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    layers: 'M12 3 2 8l10 5 10-5-10-5zM2 16l10 5 10-5M2 12l10 5 10-5',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    printer: 'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
    moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    auto: 'M3 4h18v12H3zM8 20h8M12 16v4',
    menu: 'M3 6h18M3 12h18M3 18h18',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    plus: 'M12 5v14M5 12h14',
    edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
    x: 'M18 6 6 18M6 6l12 12',
    alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    cap: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    checkc: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
    xc: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6',
    check: 'M20 6 9 17l-5-5',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
    help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
    hourglass: 'M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    scale: 'M12 3v18M7 21h10M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z',
    pie: 'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z',
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ''}"/></svg>`;
  const ic = (name) => `<span data-icon="${name}">${svg(name)}</span>`;
  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach((el) => { if (!el.firstElementChild) el.innerHTML = svg(el.dataset.icon); });
  }

  // ================= Utils =================
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const nowBE = () => new Date().getFullYear() + 543;
  const toBE = (y) => { const n = parseInt(y, 10); if (!n) return ''; return n < 2400 ? n + 543 : n; };
  const fmt = (n, d = 2) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtInt = (n) => Number(n || 0).toLocaleString('th-TH');
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const byId = (list, id) => list.find((x) => x.id === id);
  const chip = (text, tone, dot) => `<span class="chip tone-${tone}${dot ? ' dot' : ''}">${esc(text)}</span>`;
  const initials = (name) => { const s = String(name || '?').replace(/^(พระมหา|พระครู|พระ|ดร\.|ผศ\.|รศ\.|ศ\.|นาย|นางสาว|นาง)\s*/g, '').trim(); return s.charAt(0) || '?'; };
  const catOf = (id) => C.CATEGORIES.find((c) => c.id === id) || C.CATEGORIES[C.CATEGORIES.length - 1];
  const typeOf = (id) => C.WORK_TYPES.find((t) => t.id === id) || C.WORK_TYPES[C.WORK_TYPES.length - 1];
  const lecTypeOf = (id) => C.LECTURER_TYPES.find((t) => t.id === id) || C.LECTURER_TYPES[1];
  const opt = (value, label, selected) => `<option value="${esc(value)}"${String(selected) === String(value) ? ' selected' : ''}>${esc(label)}</option>`;

  async function hashPw(username, password) {
    const text = String(username).toLowerCase() + ':' + password;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0; // fallback (ไม่ปลอดภัยเท่า SHA-256)
    return 'djb2_' + (h >>> 0).toString(16);
  }

  // ================= Store =================
  const KEY = 'npc.data';
  const SESSION = 'npc.session';
  const ENTITIES = ['programs', 'lecturers', 'works', 'users', 'externals'];

  function defaultSettings() {
    const weights = {};
    C.CATEGORIES.forEach((c) => { weights[c.id] = c.weight; if (c.quartile) C.QUARTILES.forEach((q) => { weights[c.id + ':' + q] = c.weight; }); });
    return {
      id: 'settings',
      collegeName: 'วิทยาลัยสงฆ์นครพนม',
      university: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
      refYear: nowBE(),
      windowYears: 5,
      weights,
      targets: { bachelor: C.LEVELS.bachelor.target, master: C.LEVELS.master.target, phd: C.LEVELS.phd.target },
      requirements: JSON.parse(JSON.stringify(C.DEFAULT_REQUIREMENTS)),
      apiUrl: '',
    };
  }

  const S = { data: null, user: null, token: null, remote: false };

  function normalize(d) {
    d = d || {};
    ENTITIES.forEach((k) => { if (!Array.isArray(d[k])) d[k] = []; });
    const def = defaultSettings();
    const s = Object.assign({}, def, d.settings || {});
    s.weights = Object.assign({}, def.weights, s.weights || {});
    s.targets = Object.assign({}, def.targets, s.targets || {});
    s.requirements = Object.assign({}, def.requirements, s.requirements || {});
    d.settings = s;
    return d;
  }

  function loadLocal() {
    try { const raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) { console.warn(e); }
    return null;
  }
  function saveLocal() {
    if (S.remote) return;
    try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { toast('บันทึกไม่สำเร็จ: พื้นที่จัดเก็บเต็มหรือถูกบล็อก', 'error'); }
  }
  const apiUrl = () => { try { return localStorage.getItem('npc.api') || ''; } catch (e) { return ''; } };

  async function api(action, payload) {
    const res = await fetch(apiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // หลีกเลี่ยง CORS preflight ของ Apps Script
      body: JSON.stringify(Object.assign({ action, token: S.token }, payload || {})),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
    return json;
  }

  // CRUD — อัปเดตข้อมูลในหน่วยความจำ แล้วบันทึกลงเครื่องหรือส่งไปยัง Google Sheets
  async function upsert(entity, rec) {
    rec.updatedAt = new Date().toISOString();
    if (S.remote) {
      const r = await api('upsert', { entity, record: rec });
      rec = r.record || rec;
    }
    if (entity === 'settings') { S.data.settings = normalize({ settings: rec }).settings; }
    else {
      const list = S.data[entity];
      const i = list.findIndex((x) => x.id === rec.id);
      if (i >= 0) list[i] = rec; else list.push(rec);
    }
    saveLocal();
    return rec;
  }
  async function remove(entity, id) {
    if (S.remote) await api('remove', { entity, id });
    S.data[entity] = S.data[entity].filter((x) => x.id !== id);
    saveLocal();
  }
  async function replaceAll(data) {
    data = normalize(data);
    if (S.remote) await api('replaceAll', { data });
    S.data = data;
    saveLocal();
  }

  // ================= Permissions =================
  const role = () => (S.user ? S.user.role : '');
  const isAdmin = () => role() === 'admin';
  const myLecturer = () => (S.user && S.user.lecturerId ? byId(S.data.lecturers, S.user.lecturerId) : null);

  function scopeLecturers() {
    const all = S.data.lecturers;
    if (role() === 'admin' || role() === 'executive') return all;
    if (role() === 'chair') return all.filter((l) => l.programId === S.user.programId);
    if (role() === 'lecturer') return all.filter((l) => l.id === S.user.lecturerId);
    return [];
  }
  function scopePrograms() {
    if (role() === 'chair') return S.data.programs.filter((p) => p.id === S.user.programId);
    if (role() === 'lecturer') { const l = myLecturer(); return S.data.programs.filter((p) => l && p.id === l.programId); }
    return S.data.programs;
  }
  function scopeWorks() {
    const ids = new Set(scopeLecturers().map((l) => l.id));
    return S.data.works.filter((w) => ids.has(w.lecturerId));
  }
  function canEditLecturer(l) {
    if (isAdmin()) return true;
    if (role() === 'chair') return !l || l.programId === S.user.programId;
    if (role() === 'lecturer') return !!l && l.id === S.user.lecturerId;
    return false;
  }
  const canAddLecturer = () => isAdmin() || role() === 'chair';
  function canEditWork(w) {
    if (isAdmin()) return true;
    const l = w && byId(S.data.lecturers, w.lecturerId);
    if (role() === 'chair') return !w || (l && l.programId === S.user.programId);
    if (role() === 'lecturer') return !w || (w.lecturerId === S.user.lecturerId && w.status !== 'verified');
    return false;
  }
  const canSeeExternals = () => ['admin', 'chair', 'executive'].includes(role());
  const canEditExternal = () => isAdmin() || role() === 'chair';
  const canAddWork = () => ['admin', 'chair', 'lecturer'].includes(role()) && (role() !== 'lecturer' || !!S.user.lecturerId);
  function canVerify(w) {
    if (isAdmin()) return true;
    if (role() !== 'chair') return false;
    const l = w && byId(S.data.lecturers, w.lecturerId);
    return !w || (l && l.programId === S.user.programId);
  }

  // ================= Calculations =================
  const st = () => S.data.settings;
  const windowStart = () => st().refYear - (st().windowYears - 1);
  const inWindow = (w) => { const y = toBE(w.year); return y >= windowStart() && y <= st().refYear; };
  const isExpiring = (w) => toBE(w.year) === windowStart();
  const isExpired = (w) => toBE(w.year) < windowStart();
  function weightOf(w) {
    const c = catOf(w.category);
    const W = st().weights;
    if (c.quartile && w.quartile && W[c.id + ':' + w.quartile] != null) return Number(W[c.id + ':' + w.quartile]);
    return Number(W[c.id] != null ? W[c.id] : c.weight);
  }
  const isCountable = (w) => w.status === 'verified' && inWindow(w) && weightOf(w) > 0;
  const worksOf = (lecId) => S.data.works.filter((w) => w.lecturerId === lecId);

  function requirementFor(l) {
    const R = st().requirements;
    if (l.type === 'adjunct') return Object.assign({ key: 'adjunct' }, R.adjunct);
    const p = byId(S.data.programs, l.programId);
    const lv = (p && p.level) || 'bachelor';
    return Object.assign({ key: lv }, R[lv]);
  }

  function evalLecturer(l) {
    const req = requirementFor(l);
    const all = worksOf(l.id);
    const eligible = (w) => inWindow(w) && weightOf(w) > 0 && (!req.kpaOnly || !!catOf(w.category).kpa);
    const counted = all.filter((w) => w.status === 'verified' && eligible(w));
    const pending = all.filter((w) => w.status === 'pending' && eligible(w));
    const research = (list) => list.filter((w) => typeOf(w.type).research).length;
    const meets = (list) => list.length >= req.minWorks && research(list) >= (req.minResearch || 0);
    let status = 'fail';
    if (meets(counted)) status = 'pass';
    else if (meets(counted.concat(pending))) status = 'pending';
    const inWin = all.filter(inWindow);
    return {
      req, all, counted, pending, status,
      research: research(counted),
      weight: counted.reduce((s, w) => s + weightOf(w), 0),
      noWorks: inWin.length === 0,
      expiring: counted.filter(isExpiring),
    };
  }
  const STATUS_META = {
    pass: { label: 'ผ่านเกณฑ์', tone: 'success', icon: 'checkc' },
    pending: { label: 'รอรับรองผลงาน', tone: 'warning', icon: 'hourglass' },
    fail: { label: 'ยังไม่ผ่านเกณฑ์', tone: 'danger', icon: 'xc' },
  };

  // ตัวบ่งชี้ผลงานวิชาการของอาจารย์ผู้รับผิดชอบหลักสูตร (ร้อยละผลรวมถ่วงน้ำหนัก แปลงเป็นคะแนนเต็ม 5)
  function evalProgram(p, mode) {
    mode = mode || 'year';
    const lecs = S.data.lecturers.filter((l) => l.programId === p.id && l.active !== false);
    const responsible = lecs.filter((l) => l.type === 'responsible');
    const ids = new Set(responsible.map((l) => l.id));
    const works = S.data.works.filter((w) => ids.has(w.lecturerId) && w.status === 'verified' && weightOf(w) > 0 &&
      (mode === 'year' ? toBE(w.year) === st().refYear : inWindow(w)));
    const sum = works.reduce((s, w) => s + weightOf(w), 0);
    const n = responsible.length;
    const pct = n ? (sum / n) * 100 : 0;
    const target = Number(st().targets[p.level || 'bachelor']) || 20;
    const score = Math.min(5, (pct / target) * 5);
    const evals = lecs.map((l) => ({ l, e: evalLecturer(l) }));
    return { lecs, responsible, works, sum, n, pct, target, score, evals, passCount: evals.filter((x) => x.e.status === 'pass').length };
  }
  function scoreBand(s) {
    if (s >= 4.01) return { label: 'ดีมาก', tone: 'success' };
    if (s >= 3.01) return { label: 'ดี', tone: 'info' };
    if (s >= 2.01) return { label: 'ปานกลาง', tone: 'warning' };
    return { label: 'ต้องปรับปรุง', tone: 'danger' };
  }

  function buildAlerts() {
    const lecs = scopeLecturers().filter((l) => l.active !== false);
    const noWorks = [], failing = [], expiring = [];
    lecs.forEach((l) => {
      const e = evalLecturer(l);
      if (e.noWorks) noWorks.push(l);
      else if (e.status === 'fail') failing.push({ l, e });
      if (e.expiring.length) expiring.push({ l, e });
    });
    const pending = scopeWorks().filter((w) => w.status === 'pending');
    const rejected = scopeWorks().filter((w) => w.status === 'rejected');
    const expired = scopeWorks().filter(isExpired);
    return { noWorks, failing, expiring, pending, rejected, expired };
  }

  // ================= UI primitives =================
  function toast(msg, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  const modal = $('#modal');
  function openModal({ title, body, submitLabel, danger, onSubmit, wide, footExtra }) {
    modal.style.width = wide ? 'min(920px, calc(100vw - 32px))' : '';
    modal.innerHTML = `
      <form class="modal-form" novalidate>
        <div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="ปิด">${ic('x')}</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">${footExtra || ''}<button type="button" class="btn ghost" data-close>ยกเลิก</button>${onSubmit ? `<button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${esc(submitLabel || 'บันทึก')}</button>` : ''}</div>
      </form>`;
    const form = $('form', modal);
    $$('[data-close]', modal).forEach((b) => b.addEventListener('click', () => modal.close()));
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!onSubmit) return modal.close();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        const keep = await onSubmit(Object.fromEntries(new FormData(form).entries()), form);
        if (keep !== false) modal.close();
      } catch (e) { toast(e.message || String(e), 'error'); }
      finally { btn.disabled = false; }
    });
    modal.showModal();
    const first = $('input:not([type=hidden]),select,textarea', modal);
    if (first) first.focus();
    return form;
  }
  function confirmBox(title, message, label = 'ยืนยัน') {
    return new Promise((resolve) => {
      let ok = false;
      openModal({ title, body: `<p style="margin:0">${message}</p>`, submitLabel: label, danger: true, onSubmit: () => { ok = true; } });
      modal.addEventListener('close', () => resolve(ok), { once: true });
    });
  }

  function emptyState(icon, title, text, action) {
    return `<div class="empty"><div class="empty-ico tone-primary">${ic(icon)}</div><h3>${esc(title)}</h3><p>${text}</p>${action || ''}</div>`;
  }

  function donut(items, centerLabel) {
    const total = items.reduce((s, i) => s + i.value, 0);
    const r = 15.915, cx = 21, cy = 21;
    let offset = 25, segs = '';
    items.filter((i) => i.value > 0).forEach((i) => {
      const pct = (i.value / total) * 100;
      segs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${i.color}" stroke-width="6" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${offset}"><title>${esc(i.label)}: ${i.value}</title></circle>`;
      offset -= pct;
    });
    const legend = items.filter((i) => i.value > 0).map((i) => `<div class="legend-row"><span class="legend-sw" style="background:${i.color}"></span><span>${esc(i.label)}</span><span class="v">${fmtInt(i.value)}</span></div>`).join('');
    return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="${esc(centerLabel)}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--neutral-soft)" stroke-width="6"/>${segs}
      <text x="21" y="20.5" text-anchor="middle" font-size="7" font-weight="700" fill="var(--text)">${fmtInt(total)}</text>
      <text x="21" y="26.5" text-anchor="middle" font-size="3" fill="var(--muted)">${esc(centerLabel)}</text></svg>
      <div class="legend">${legend || '<span class="muted">ยังไม่มีข้อมูล</span>'}</div></div>`;
  }

  function lecturerName(l, withPos) {
    if (!l) return '—';
    const pos = withPos && l.position ? l.position + ' ' : '';
    return pos + (l.prefix ? l.prefix : '') + (l.nameTh || l.nameEn || '');
  }
  const programName = (id) => { const p = byId(S.data.programs, id); return p ? p.name : '—'; };

  // ================= Navigation =================
  const ROUTES = {
    dashboard: { title: 'แดชบอร์ด', icon: 'grid', render: renderDashboard },
    works: { title: 'ผลงานวิชาการ', icon: 'doc', render: renderWorks },
    lecturers: { title: 'อาจารย์ประจำหลักสูตร', icon: 'users', render: renderLecturers },
    lecturer: { title: 'ข้อมูลอาจารย์', render: renderLecturer, hidden: true },
    externals: { title: 'ตรวจคุณสมบัติบุคคลภายนอก', icon: 'search', render: renderExternals, allow: canSeeExternals },
    external: { title: 'ผู้ทรงคุณวุฒิภายนอก', render: renderExternal, hidden: true, allow: canSeeExternals },
    programs: { title: 'หลักสูตร', icon: 'layers', render: renderPrograms },
    verify: { title: 'ตรวจรับรองผลงาน', icon: 'shield', render: renderVerify, allow: () => isAdmin() || role() === 'chair' },
    assessment: { title: 'ประเมินคุณภาพหลักสูตร', icon: 'chart', render: renderAssessment, allow: () => role() !== 'lecturer' },
    reports: { title: 'รายงาน', icon: 'printer', render: renderReports },
    report: { title: 'รายงาน', render: renderReport, hidden: true },
    guide: { title: 'คู่มือ & เกณฑ์ ก.พ.อ.', icon: 'book', render: renderGuide },
    admin: { title: 'จัดการระบบ', icon: 'gear', render: renderAdmin, allow: isAdmin },
  };

  function buildNav() {
    const pending = buildAlerts().pending.length;
    const groups = [
      ['ภาพรวม', ['dashboard']],
      ['ข้อมูล', ['works', 'lecturers', 'externals', 'programs']],
      ['ประเมิน', ['verify', 'assessment', 'reports']],
      ['ช่วยเหลือ', ['guide', 'admin']],
    ];
    $('#nav').innerHTML = groups.map(([g, keys]) => {
      const links = keys.filter((k) => !ROUTES[k].allow || ROUTES[k].allow()).map((k) => {
        const count = k === 'verify' && pending ? `<span class="count">${pending}</span>` : '';
        return `<a href="#/${k}" data-route="${k}">${ic(ROUTES[k].icon)}${esc(ROUTES[k].title)}${count}</a>`;
      }).join('');
      return links ? `<div class="nav-sep">${g}</div>${links}` : '';
    }).join('');
  }

  function parseRoute() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/');
    return { name: parts[0], args: parts.slice(1).map(decodeURIComponent) };
  }

  const view = { tabs: {}, filters: {} };

  function render() {
    if (!S.user) return;
    const { name, args } = parseRoute();
    let r = ROUTES[name];
    if (!r || (r.allow && !r.allow())) { location.hash = '#/dashboard'; return; }
    buildNav();
    const navKey = { lecturer: 'lecturers', report: 'reports', external: 'externals' }[name] || name;
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === navKey));
    $('#pageTitle').textContent = r.title;
    document.title = r.title + ' | ' + st().collegeName;
    const main = $('#main');
    main.innerHTML = r.render(...args);
    hydrateIcons(main);
    closeSidebar();
  }

  // ================= Pages: Dashboard =================
  function statCard(label, value, icon, tone, foot) {
    return `<div class="card stat"><div class="stat-top"><span>${esc(label)}</span><span class="stat-ico tone-${tone}">${ic(icon)}</span></div>
      <div class="stat-num" style="color:var(--${tone === 'primary' ? 'text' : tone})">${value}</div><div class="stat-foot">${foot}</div></div>`;
  }

  function renderDashboard() {
    const lecs = scopeLecturers().filter((l) => l.active !== false);
    const progs = scopePrograms();
    const works = scopeWorks();
    const counted = works.filter(isCountable);
    const A = buildAlerts();
    const s = st();
    const welcome = S.user.displayName || S.user.username;
    const demo = S.data.settings.demo ? `<div class="alert tone-accent mb">${ic('info')}<div><b>กำลังแสดงข้อมูลตัวอย่าง</b>ผู้ดูแลระบบสามารถล้างข้อมูลตัวอย่างได้ที่ จัดการระบบ &gt; ข้อมูล</div></div>` : '';

    // ข้อมูลกราฟ
    const inWin = works.filter((w) => inWindow(w) && w.status !== 'rejected');
    const byCat = C.CATEGORIES.map((c) => ({ label: c.short, color: c.color, value: inWin.filter((w) => w.category === c.id).length }));
    const progBars = progs.map((p) => {
      const e = evalProgram(p, 'window');
      const avg = e.n ? e.sum / e.n : 0;
      return { p, e, avg };
    });
    const maxAvg = Math.max(1, ...progBars.map((b) => b.avg));

    const alertBlocks = [];
    if (A.noWorks.length) alertBlocks.push(`<div class="alert tone-danger">${ic('xc')}<div><b>อาจารย์ไม่มีผลงานใน ${s.windowYears} ปีย้อนหลัง (${A.noWorks.length} ท่าน)</b>${A.noWorks.slice(0, 6).map((l) => `<a href="#/lecturer/${l.id}">${esc(lecturerName(l))}</a>`).join(', ')}${A.noWorks.length > 6 ? ' และอื่น ๆ' : ''}</div></div>`);
    if (A.expiring.length) alertBlocks.push(`<div class="alert tone-warning">${ic('clock')}<div><b>ผลงานใกล้หมดอายุ ${s.windowYears} ปี (ตีพิมพ์ปี ${windowStart()} — จะไม่นับในปี ${s.refYear + 1})</b>${A.expiring.slice(0, 6).map(({ l, e }) => `<a href="#/lecturer/${l.id}">${esc(lecturerName(l))}</a> (${e.expiring.length} เรื่อง)`).join(', ')}</div></div>`);
    if (A.failing.length) alertBlocks.push(`<div class="alert tone-danger">${ic('alert')}<div><b>อาจารย์ที่ผลงานยังไม่ถึงเกณฑ์ขั้นต่ำ (${A.failing.length} ท่าน)</b>${A.failing.slice(0, 6).map(({ l, e }) => `<a href="#/lecturer/${l.id}">${esc(lecturerName(l))}</a> (${e.counted.length}/${e.req.minWorks})`).join(', ')}</div></div>`);
    if (A.pending.length && (isAdmin() || role() === 'chair')) alertBlocks.push(`<div class="alert tone-info">${ic('hourglass')}<div><b>ผลงานรอตรวจรับรอง ${A.pending.length} รายการ</b><a href="#/verify">ไปที่หน้าตรวจรับรองผลงาน →</a></div></div>`);
    if (A.rejected.length) alertBlocks.push(`<div class="alert tone-danger">${ic('edit')}<div><b>ผลงานถูกส่งกลับแก้ไข ${A.rejected.length} รายการ</b><a href="#/works?status=rejected" data-action="filter-works" data-status="rejected">ดูรายการ →</a></div></div>`);
    if (A.expired.length) alertBlocks.push(`<div class="alert tone-neutral">${ic('info')}<div><b>ผลงานเกิน ${s.windowYears} ปี ${A.expired.length} รายการ</b>ไม่ถูกนำมาคิดคะแนนในปีประเมิน ${s.refYear} (ยังเก็บไว้เป็นประวัติ)</div></div>`);

    const myBlock = role() === 'lecturer' && myLecturer() ? lecturerVerdictCard(myLecturer()) : '';

    return `
      <section class="hero">
        <div>
          <span class="chip">${ic('cap')} ${esc(s.collegeName)} · ปีประเมิน ${s.refYear}</span>
          <h1 style="margin-top:10px">ยินดีต้อนรับ, ${esc(welcome)}</h1>
          <p>กำกับ ติดตาม และประเมินผลงานวิชาการอาจารย์ประจำหลักสูตร รอบ ${s.windowYears} ปีย้อนหลัง (${windowStart()}–${s.refYear}) ตามประกาศ ก.พ.อ. พ.ศ. 2562</p>
        </div>
        <div class="btn-row">
          ${canAddWork() ? `<button class="btn primary" data-action="add-work">${ic('plus')}เพิ่มผลงานวิชาการ</button>` : ''}
          ${canAddLecturer() ? `<button class="btn ghost" data-action="add-lecturer">${ic('user')}เพิ่มอาจารย์</button>` : ''}
          ${canEditExternal() ? `<button class="btn ghost" data-action="add-external">${ic('search')}ตรวจบุคคลภายนอก</button>` : ''}
          ${role() !== 'lecturer' ? `<a class="btn ghost" href="#/reports">${ic('printer')}ออกรายงาน</a>` : ''}
        </div>
      </section>
      ${demo}
      <div class="grid stats">
        ${statCard('หลักสูตร', fmtInt(progs.length), 'layers', 'primary', `${chip('เปิดสอน', 'primary')} ข้อมูลในระบบ`)}
        ${statCard('อาจารย์', fmtInt(lecs.length), 'users', 'info', `${chip(lecs.filter((l) => evalLecturer(l).status === 'pass').length + ' ผ่านเกณฑ์', 'success')} จากทั้งหมด`)}
        ${statCard(`ผลงานที่นับได้ (${s.windowYears} ปี)`, fmtInt(counted.length), 'checkc', 'success', `${chip('รับรองแล้ว', 'success')} นำไปประเมินได้`)}
        ${statCard('ผลงานรอตรวจสอบ', fmtInt(A.pending.length), 'hourglass', 'warning', `${chip('รอดำเนินการ', 'warning')} ต้องตรวจรับรอง`)}
      </div>
      ${myBlock}
      <div class="card mb">
        <div class="card-head"><h2>${ic('alert')} การแจ้งเตือนอัจฉริยะ</h2><span class="muted small">อัปเดตตามข้อมูลล่าสุด</span></div>
        <div class="card-body">${alertBlocks.length ? `<div class="alert-list">${alertBlocks.join('')}</div>` : `<div class="alert tone-success">${ic('checkc')}<div><b>ไม่มีรายการที่ต้องดำเนินการ</b>อาจารย์ทุกท่านมีผลงานตามเกณฑ์</div></div>`}</div>
      </div>
      <div class="grid two">
        <div class="card">
          <div class="card-head"><h2>${ic('pie')} สัดส่วนผลงานแยกตามฐานข้อมูล</h2><span class="muted small">${windowStart()}–${s.refYear}</span></div>
          <div class="card-body">${inWin.length ? donut(byCat, 'ผลงาน') : emptyState('pie', 'ยังไม่มีผลงาน', 'เพิ่มผลงานวิชาการเพื่อดูสัดส่วน')}</div>
        </div>
        <div class="card">
          <div class="card-head"><h2>${ic('chart')} ค่าน้ำหนักผลงานเฉลี่ยต่ออาจารย์ผู้รับผิดชอบ รายหลักสูตร</h2></div>
          <div class="card-body">${progBars.length ? `<div class="bars">${progBars.map((b) => `
            <div class="bar-row"><a class="bar-label" href="#/assessment" title="${esc(b.p.name)}">${esc(b.p.name)}</a>
              <div class="bar-track"><div class="bar-fill" style="width:${(b.avg / maxAvg) * 100}%;background:var(--primary)"></div></div>
              <div class="bar-val">${fmt(b.avg)}</div></div>`).join('')}</div>
              <p class="muted small mt">ผลรวมค่าน้ำหนักผลงานที่รับรองแล้วในรอบ ${s.windowYears} ปี ÷ จำนวนอาจารย์ผู้รับผิดชอบหลักสูตร</p>`
            : emptyState('layers', 'ยังไม่มีหลักสูตร', 'เพิ่มหลักสูตรที่เมนู หลักสูตร')}</div>
        </div>
      </div>`;
  }

  function lecturerVerdictCard(l) {
    const e = evalLecturer(l);
    const m = STATUS_META[e.status];
    const pct = Math.min(100, (e.counted.length / Math.max(1, e.req.minWorks)) * 100);
    const reqText = `ผลงาน ≥ ${e.req.minWorks} เรื่องใน ${st().windowYears} ปี${e.req.minResearch ? ` (เป็นงานวิจัย ≥ ${e.req.minResearch})` : ''}${e.req.kpaOnly ? ' · เฉพาะวารสารตามประกาศ ก.พ.อ.' : ''}`;
    return `<div class="card mb"><div class="verdict tone-${m.tone}">
      <div class="verdict-ico">${ic(m.icon)}</div>
      <div style="flex:1;min-width:0">
        <h3>${m.label}</h3>
        <p>${esc(reqText)} — นับได้ ${e.counted.length} เรื่อง (วิจัย ${e.research})${e.pending.length ? ` · รอรับรอง ${e.pending.length}` : ''}</p>
        <div class="progress mt" style="background:rgba(255,255,255,.45)"><div style="width:${pct}%;background:currentColor"></div></div>
      </div></div></div>`;
  }

  // ================= Pages: Works =================
  function workFilters() {
    const f = view.filters.works || (view.filters.works = { q: '', status: '', cat: '', program: '', period: '' });
    return f;
  }

  function renderWorks() {
    const f = workFilters();
    let list = scopeWorks().slice();
    const q = f.q.trim().toLowerCase();
    if (q) list = list.filter((w) => [w.title, w.journal, lecturerName(byId(S.data.lecturers, w.lecturerId)), w.issn].join(' ').toLowerCase().includes(q));
    if (f.status) list = list.filter((w) => w.status === f.status);
    if (f.cat) list = list.filter((w) => w.category === f.cat);
    if (f.program) list = list.filter((w) => { const l = byId(S.data.lecturers, w.lecturerId); return l && l.programId === f.program; });
    if (f.period === 'in') list = list.filter(inWindow);
    if (f.period === 'expiring') list = list.filter((w) => inWindow(w) && isExpiring(w));
    if (f.period === 'expired') list = list.filter(isExpired);
    list.sort((a, b) => toBE(b.year) - toBE(a.year) || String(b.updatedAt).localeCompare(String(a.updatedAt)));

    const rows = list.map((w) => {
      const l = byId(S.data.lecturers, w.lecturerId);
      const c = catOf(w.category);
      const s = C.STATUSES[w.status] || C.STATUSES.pending;
      const yearChip = isExpired(w) ? chip('เกิน ' + st().windowYears + ' ปี', 'neutral') : isExpiring(w) ? chip('ใกล้หมดอายุ', 'warning') : '';
      return `<tr>
        <td><div class="cell-title">${esc(w.title)}</div><div class="cell-sub">${esc(w.journal || typeOf(w.type).label)}${w.quartile ? ' · ' + esc(w.quartile) : ''}</div>
          ${w.status === 'rejected' && w.reviewNote ? `<div class="cell-sub" style="color:var(--danger)">เหตุผล: ${esc(w.reviewNote)}</div>` : ''}</td>
        <td><a href="#/lecturer/${l ? l.id : ''}">${esc(lecturerName(l))}</a><div class="cell-sub">${esc(l ? programName(l.programId) : '')}</div></td>
        <td class="nowrap">${esc(toBE(w.year))} ${yearChip}</td>
        <td><span class="chip" style="background:${c.color}22;color:${c.color}">${esc(c.short)}</span></td>
        <td class="num">${isCountable(w) ? fmt(weightOf(w)) : `<span class="muted">${fmt(0)}</span>`}</td>
        <td>${chip(s.label, s.tone, true)}</td>
        <td class="actions">
          ${canVerify(w) && w.status === 'pending' ? `<button class="btn sm" data-action="verify-work" data-id="${w.id}" title="ตรวจรับรอง">${ic('shield')}</button>` : ''}
          ${canEditWork(w) ? `<button class="btn sm" data-action="edit-work" data-id="${w.id}" title="แก้ไข">${ic('edit')}</button><button class="btn sm danger" data-action="delete-work" data-id="${w.id}" title="ลบ">${ic('trash')}</button>` : `<button class="btn sm" data-action="view-work" data-id="${w.id}" title="ดูรายละเอียด">${ic('info')}</button>`}
        </td></tr>`;
    }).join('');

    return `
      <div class="page-head"><div><h1>ผลงานวิชาการ</h1><p>บันทึก แก้ไข และติดตามสถานะผลงาน · ช่วงนับผลงาน ${windowStart()}–${st().refYear}</p></div>
        <div class="btn-row"><button class="btn" data-action="export-csv">${ic('download')}ส่งออก CSV</button>${canAddWork() ? `<button class="btn primary" data-action="add-work">${ic('plus')}เพิ่มผลงาน</button>` : ''}</div></div>
      <div class="card">
        <div class="toolbar">
          <input class="input grow" type="search" placeholder="ค้นหาชื่อผลงาน วารสาร หรือชื่ออาจารย์…" value="${esc(f.q)}" data-filter="works.q">
          <select class="input" data-filter="works.status"><option value="">ทุกสถานะ</option>${Object.entries(C.STATUSES).map(([k, v]) => opt(k, v.label, f.status)).join('')}</select>
          <select class="input" data-filter="works.cat"><option value="">ทุกฐานข้อมูล</option>${C.CATEGORIES.map((c) => opt(c.id, c.short, f.cat)).join('')}</select>
          ${scopePrograms().length > 1 ? `<select class="input" data-filter="works.program"><option value="">ทุกหลักสูตร</option>${scopePrograms().map((p) => opt(p.id, p.name, f.program)).join('')}</select>` : ''}
          <select class="input" data-filter="works.period"><option value="">ทุกปี</option>${opt('in', `ใน ${st().windowYears} ปี`, f.period)}${opt('expiring', 'ใกล้หมดอายุ', f.period)}${opt('expired', `เกิน ${st().windowYears} ปี`, f.period)}</select>
        </div>
        ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>ผลงาน</th><th>อาจารย์</th><th>ปี (พ.ศ.)</th><th>ฐานข้อมูล</th><th class="num">ค่าน้ำหนัก</th><th>สถานะ</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
          <div class="toolbar" style="border-top:1px solid var(--border);border-bottom:0"><span class="muted small">แสดง ${fmtInt(list.length)} รายการ · ค่าน้ำหนักแสดงเฉพาะผลงานที่รับรองแล้วและอยู่ในช่วง ${st().windowYears} ปี</span></div>`
          : emptyState('doc', 'ไม่พบผลงาน', 'ลองเปลี่ยนตัวกรอง หรือเพิ่มผลงานใหม่', canAddWork() ? `<button class="btn primary" data-action="add-work">${ic('plus')}เพิ่มผลงาน</button>` : '')}
      </div>`;
  }

  function workForm(w, presetLecturer) {
    w = w || {};
    const lecs = scopeLecturers().filter((l) => l.active !== false || l.id === w.lecturerId);
    const lecId = w.lecturerId || presetLecturer || (role() === 'lecturer' ? S.user.lecturerId : '');
    const c = catOf(w.category || 'tci1');
    return `
      <div class="form-grid">
        <label class="field full"><span>อาจารย์เจ้าของผลงาน <em>*</em></span>
          <select name="lecturerId" required ${role() === 'lecturer' ? 'disabled' : ''}><option value="">— เลือกอาจารย์ —</option>${lecs.map((l) => opt(l.id, lecturerName(l) + ' · ' + programName(l.programId), lecId)).join('')}</select>
          ${role() === 'lecturer' ? `<input type="hidden" name="lecturerId" value="${esc(lecId)}">` : ''}</label>
        <label class="field full"><span>ชื่อผลงาน <em>*</em></span><textarea name="title" required rows="2">${esc(w.title)}</textarea></label>
        <label class="field"><span>ประเภทผลงาน</span><select name="type">${C.WORK_TYPES.map((t) => opt(t.id, t.label, w.type || 'research')).join('')}</select></label>
        <label class="field"><span>บทบาทผู้แต่ง</span><select name="authorRole">${C.AUTHOR_ROLES.map((a) => opt(a.id, a.label, w.authorRole || 'first')).join('')}</select></label>
        <label class="field full"><span>แหล่งเผยแพร่ / ฐานข้อมูล <em>*</em></span>
          <select name="category" required data-live="work">${C.CATEGORIES.map((x) => opt(x.id, `${x.label} — ${fmt(st().weights[x.id] != null ? st().weights[x.id] : x.weight)}`, c.id)).join('')}</select></label>
        <label class="field" data-show="quartile"><span>Quartile (SJR / JCR)</span><select name="quartile" data-live="work"><option value="">ไม่ระบุ</option>${C.QUARTILES.map((q) => opt(q, q, w.quartile)).join('')}</select></label>
        <label class="field"><span>ปีที่ตีพิมพ์ (พ.ศ. หรือ ค.ศ.) <em>*</em></span><input name="year" required inputmode="numeric" pattern="\\d{4}" value="${esc(w.year || st().refYear)}" data-live="work"></label>
        <label class="field" data-show="journal"><span>ชื่อวารสาร / การประชุม</span><input name="journal" value="${esc(w.journal)}"></label>
        <label class="field" data-show="journal"><span>ISSN / e-ISSN</span><input name="issn" value="${esc(w.issn)}" placeholder="เช่น 1234-5678"></label>
        <label class="field"><span>ปีที่/ฉบับที่/หน้า</span><input name="detail" value="${esc(w.detail)}" placeholder="เช่น ปีที่ 9 ฉบับที่ 2 หน้า 1-15"></label>
        <label class="field"><span>DOI</span><input name="doi" value="${esc(w.doi)}" placeholder="10.xxxx/xxxxx"></label>
        <label class="field full"><span>ลิงก์หลักฐาน (หน้าบทความ / หน้าฐานข้อมูล)</span><input name="url" type="url" value="${esc(w.url)}" placeholder="https://"></label>
        <label class="field full"><span>หมายเหตุ</span><textarea name="note" rows="2">${esc(w.note)}</textarea></label>
      </div>
      <div class="mt" id="workHint"></div>`;
  }

  function updateWorkHint(form) {
    const cat = catOf(form.category.value);
    const showQ = !!cat.quartile;
    $$('[data-show="quartile"]', form).forEach((el) => { el.hidden = !showQ; });
    $$('[data-show="journal"]', form).forEach((el) => { el.hidden = !(cat.journal || /^proc/.test(cat.id)); });
    const w = { category: cat.id, quartile: showQ ? form.quartile.value : '', year: form.year.value };
    const y = toBE(w.year);
    const weight = weightOf(w);
    const parts = [];
    const kpa = cat.kpa === 'intl' ? chip('วารสารระดับนานาชาติตามประกาศ ก.พ.อ.', 'success') : cat.kpa === 'nat' ? chip('วารสารระดับชาติตามประกาศ ก.พ.อ.', 'info') : cat.journal ? chip('ไม่ใช่วารสารตามประกาศ ก.พ.อ. 2562', 'neutral') : '';
    parts.push(`<div class="alert tone-${weight > 0 ? 'primary' : 'danger'}">${ic(weight > 0 ? 'info' : 'xc')}<div><b>ค่าน้ำหนักผลงาน ${fmt(weight)}</b>${weight > 0 ? 'ผลงานนี้นำไปคิดคะแนนได้เมื่อได้รับการรับรอง' : 'ประเภทนี้ไม่ถูกนำมาคิดคะแนน'} ${kpa}</div></div>`);
    if (y && y < windowStart()) parts.push(`<div class="alert tone-warning">${ic('alert')}<div><b>ผลงานเกิน ${st().windowYears} ปี</b>ปี ${y} อยู่นอกช่วง ${windowStart()}–${st().refYear} จะไม่ถูกนำมาคิดคะแนนในปีประเมินนี้ (บันทึกเป็นประวัติได้)</div></div>`);
    else if (y === windowStart()) parts.push(`<div class="alert tone-warning">${ic('clock')}<div><b>ผลงานใกล้หมดอายุ</b>จะนับได้ถึงปีประเมิน ${st().refYear} เท่านั้น</div></div>`);
    else if (y > st().refYear) parts.push(`<div class="alert tone-info">${ic('info')}<div><b>ปีที่ตีพิมพ์มากกว่าปีประเมิน</b>จะเริ่มนับเมื่อปรับปีประเมินเป็น ${y}</div></div>`);
    if (String(form.year.value).trim() && parseInt(form.year.value, 10) < 2400) parts.push(`<div class="muted small">แปลง ค.ศ. ${esc(form.year.value)} เป็น พ.ศ. ${y}</div>`);
    $('#workHint', form).innerHTML = parts.join('');
    hydrateIcons($('#workHint', form));
  }

  function openWorkForm(w, presetLecturer) {
    const editing = !!w;
    const form = openModal({
      title: editing ? 'แก้ไขผลงานวิชาการ' : 'เพิ่มผลงานวิชาการ', wide: true, body: workForm(w, presetLecturer),
      onSubmit: async (v) => {
        const rec = Object.assign({}, w || { id: uid('w'), status: 'pending', createdAt: new Date().toISOString(), createdBy: S.user.username });
        ['lecturerId', 'title', 'type', 'authorRole', 'category', 'journal', 'issn', 'detail', 'doi', 'url', 'note'].forEach((k) => { rec[k] = (v[k] || '').trim(); });
        rec.quartile = catOf(rec.category).quartile ? v.quartile || '' : '';
        rec.year = toBE(v.year);
        if (!canEditWork(rec)) throw new Error('ไม่มีสิทธิ์บันทึกผลงานของอาจารย์ท่านนี้');
        // อาจารย์แก้ไขผลงานที่ถูกส่งกลับ → ส่งตรวจใหม่
        if (editing && role() === 'lecturer' && rec.status === 'rejected') rec.status = 'pending';
        await upsert('works', rec);
        toast(editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มผลงานแล้ว — สถานะ: รอตรวจสอบ');
        render();
      },
    });
    form.addEventListener('input', (e) => { if (e.target.dataset.live) updateWorkHint(form); });
    form.addEventListener('change', (e) => { if (e.target.dataset.live) updateWorkHint(form); });
    updateWorkHint(form);
  }

  function workDetailHtml(w) {
    const l = byId(S.data.lecturers, w.lecturerId);
    const c = catOf(w.category);
    const s = C.STATUSES[w.status] || C.STATUSES.pending;
    return `<dl class="kv">
      <dt>ชื่อผลงาน</dt><dd>${esc(w.title)}</dd>
      <dt>อาจารย์</dt><dd>${esc(lecturerName(l, true))}</dd>
      <dt>ประเภท</dt><dd>${esc(typeOf(w.type).label)} · ${esc((C.AUTHOR_ROLES.find((a) => a.id === w.authorRole) || {}).label || '')}</dd>
      <dt>แหล่งเผยแพร่</dt><dd>${esc(c.label)}${w.quartile ? ' (' + esc(w.quartile) + ')' : ''}</dd>
      <dt>วารสาร</dt><dd>${esc(w.journal || '—')} ${w.issn ? '<span class="muted">ISSN ' + esc(w.issn) + '</span>' : ''}</dd>
      <dt>ปีที่ตีพิมพ์</dt><dd>${esc(toBE(w.year))} ${esc(w.detail || '')}</dd>
      <dt>ค่าน้ำหนัก</dt><dd>${fmt(weightOf(w))} ${inWindow(w) ? '' : chip('นอกช่วง ' + st().windowYears + ' ปี', 'neutral')}</dd>
      <dt>สถานะ</dt><dd>${chip(s.label, s.tone, true)} ${w.reviewedBy ? `<span class="muted small">โดย ${esc(w.reviewedBy)} · ${fmtDate(w.reviewedAt)}</span>` : ''}</dd>
      ${w.reviewNote ? `<dt>ความเห็นผู้ตรวจ</dt><dd>${esc(w.reviewNote)}</dd>` : ''}
      ${w.note ? `<dt>หมายเหตุ</dt><dd>${esc(w.note)}</dd>` : ''}
    </dl>
    <div class="divider"></div>
    <div class="small muted" style="margin-bottom:8px">ตรวจสอบแหล่งเผยแพร่</div>
    <div class="btn-row">${C.workLinks(w).map((x) => `<a class="btn sm" href="${esc(x.url)}" target="_blank" rel="noopener">${ic('external')}${esc(x.label)}</a>`).join('')}</div>`;
  }

  function openVerify(w) {
    const l = byId(S.data.lecturers, w.lecturerId);
    const form = openModal({
      title: 'ตรวจรับรองผลงาน', wide: true,
      body: `${workDetailHtml(w)}
        <div class="divider"></div>
        <div class="small muted" style="margin-bottom:8px">ค้นหาชื่อผู้แต่งในฐานข้อมูล</div>
        <div class="btn-row">${l ? C.searchLinks(l).slice(0, 6).map((x) => `<a class="btn sm" href="${esc(x.url)}" target="_blank" rel="noopener">${ic('search')}${esc(x.label)}</a>`).join('') : ''}</div>
        <div class="divider"></div>
        <div class="form-grid">
          <label class="field"><span>ยืนยันแหล่งเผยแพร่</span><select name="category">${C.CATEGORIES.map((x) => opt(x.id, x.label, w.category)).join('')}</select></label>
          <label class="field"><span>Quartile</span><select name="quartile"><option value="">ไม่ระบุ</option>${C.QUARTILES.map((q) => opt(q, q, w.quartile)).join('')}</select></label>
          <label class="field full"><span>ความเห็นผู้ตรวจ <small>(จำเป็นเมื่อส่งกลับแก้ไข)</small></span><textarea name="reviewNote" rows="2">${esc(w.reviewNote)}</textarea></label>
        </div>
        <input type="hidden" name="decision" value="verified">`,
      submitLabel: 'รับรองผลงาน',
      footExtra: `<button type="button" class="btn danger" data-reject style="margin-right:auto">${ic('xc')}ส่งกลับแก้ไข</button>`,
      onSubmit: async (v) => {
        if (v.decision === 'rejected' && !String(v.reviewNote || '').trim()) { toast('กรุณาระบุเหตุผลที่ส่งกลับแก้ไข', 'error'); return false; }
        const rec = Object.assign({}, w, {
          category: v.category, quartile: catOf(v.category).quartile ? v.quartile : '',
          status: v.decision, reviewNote: (v.reviewNote || '').trim(), reviewedBy: S.user.displayName || S.user.username, reviewedAt: new Date().toISOString(),
        });
        await upsert('works', rec);
        toast(v.decision === 'verified' ? 'รับรองผลงานแล้ว' : 'ส่งกลับให้อาจารย์แก้ไขแล้ว');
        render();
      },
    });
    hydrateIcons(form);
    $('[data-reject]', form).addEventListener('click', () => { form.decision.value = 'rejected'; form.requestSubmit(); });
  }

  // ================= Pages: Lecturers =================
  function renderLecturers() {
    const f = view.filters.lecturers || (view.filters.lecturers = { q: '', program: '', status: '' });
    let list = scopeLecturers().map((l) => ({ l, e: evalLecturer(l) }));
    const q = f.q.trim().toLowerCase();
    if (q) list = list.filter(({ l }) => [l.prefix, l.nameTh, l.nameEn, l.email].join(' ').toLowerCase().includes(q));
    if (f.program) list = list.filter(({ l }) => l.programId === f.program);
    if (f.status) list = list.filter(({ l, e }) => (f.status === 'inactive' ? l.active === false : e.status === f.status && l.active !== false));
    list.sort((a, b) => programName(a.l.programId).localeCompare(programName(b.l.programId), 'th') || lecturerName(a.l).localeCompare(lecturerName(b.l), 'th'));
    const rows = list.map(({ l, e }) => {
      const m = STATUS_META[e.status];
      return `<tr class="row-link" data-href="#/lecturer/${l.id}">
        <td><div class="person-cell"><div class="avatar sm">${esc(initials(l.nameTh))}</div><div><div class="cell-title">${esc(lecturerName(l, true))}</div><div class="cell-sub">${esc(l.nameEn || '')}</div></div></div></td>
        <td>${esc(programName(l.programId))}<div class="cell-sub">${esc(lecTypeOf(l.type).label)}</div></td>
        <td class="num">${e.counted.length}/${e.req.minWorks}${e.pending.length ? `<div class="cell-sub">รอ ${e.pending.length}</div>` : ''}</td>
        <td class="num">${fmt(e.weight)}</td>
        <td>${l.active === false ? chip('ไม่ปฏิบัติงาน', 'neutral') : chip(m.label, m.tone, true)}${e.expiring.length ? ' ' + chip('ใกล้หมดอายุ ' + e.expiring.length, 'warning') : ''}</td>
        <td class="actions">${canEditLecturer(l) ? `<button class="btn sm" data-action="edit-lecturer" data-id="${l.id}" title="แก้ไข">${ic('edit')}</button>` : ''}${isAdmin() || (role() === 'chair' && canEditLecturer(l)) ? `<button class="btn sm danger" data-action="delete-lecturer" data-id="${l.id}" title="ลบ">${ic('trash')}</button>` : ''}</td>
      </tr>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>อาจารย์ประจำหลักสูตร</h1><p>สถานะคุณสมบัติด้านผลงานวิชาการ ${st().windowYears} ปีย้อนหลัง</p></div>
        ${canAddLecturer() ? `<button class="btn primary" data-action="add-lecturer">${ic('plus')}เพิ่มอาจารย์</button>` : ''}</div>
      <div class="card">
        <div class="toolbar">
          <input class="input grow" type="search" placeholder="ค้นหาชื่ออาจารย์…" value="${esc(f.q)}" data-filter="lecturers.q">
          ${scopePrograms().length > 1 ? `<select class="input" data-filter="lecturers.program"><option value="">ทุกหลักสูตร</option>${scopePrograms().map((p) => opt(p.id, p.name, f.program)).join('')}</select>` : ''}
          <select class="input" data-filter="lecturers.status"><option value="">ทุกสถานะ</option>${Object.entries(STATUS_META).map(([k, v]) => opt(k, v.label, f.status)).join('')}${opt('inactive', 'ไม่ปฏิบัติงาน', f.status)}</select>
        </div>
        ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>ชื่อ - สกุล</th><th>หลักสูตร / ประเภท</th><th class="num">ผลงานนับได้/เกณฑ์</th><th class="num">ค่าน้ำหนัก</th><th>สถานะ</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
          : emptyState('users', 'ไม่พบข้อมูลอาจารย์', 'เพิ่มอาจารย์และกำหนดหลักสูตรเพื่อเริ่มติดตามผลงาน', canAddLecturer() ? `<button class="btn primary" data-action="add-lecturer">${ic('plus')}เพิ่มอาจารย์</button>` : '')}
      </div>`;
  }

  function openLecturerForm(l) {
    const editing = !!l;
    l = l || { type: 'responsible', active: true, programId: role() === 'chair' ? S.user.programId : '' };
    const selfOnly = role() === 'lecturer';
    const progs = role() === 'chair' ? scopePrograms() : S.data.programs;
    openModal({
      title: editing ? 'แก้ไขข้อมูลอาจารย์' : 'เพิ่มอาจารย์', wide: true,
      body: `<div class="form-grid">
        <label class="field"><span>คำนำหน้า / สมณศักดิ์</span><input name="prefix" value="${esc(l.prefix)}" placeholder="เช่น พระมหา, พระครู, ดร., นาย" list="prefixList">
          <datalist id="prefixList"><option>พระ</option><option>พระมหา</option><option>พระครู</option><option>ดร.</option><option>พระมหา ดร.</option><option>นาย</option><option>นาง</option><option>นางสาว</option></datalist></label>
        <label class="field"><span>ตำแหน่งทางวิชาการ</span><select name="position">${C.ACADEMIC_POSITIONS.map((p) => opt(p, p || '— ไม่มี —', l.position || '')).join('')}</select></label>
        <label class="field"><span>ชื่อ - ฉายา/นามสกุล (ไทย) <em>*</em></span><input name="nameTh" required value="${esc(l.nameTh)}"></label>
        <label class="field"><span>ชื่อภาษาอังกฤษ <small>(ใช้ค้นหาใน Scopus/WoS)</small></span><input name="nameEn" value="${esc(l.nameEn)}" placeholder="Firstname Lastname"></label>
        <label class="field"><span>หลักสูตร <em>*</em></span><select name="programId" required ${selfOnly ? 'disabled' : ''}><option value="">— เลือกหลักสูตร —</option>${progs.map((p) => opt(p.id, p.name, l.programId)).join('')}</select></label>
        <label class="field"><span>ประเภทอาจารย์</span><select name="type" ${selfOnly ? 'disabled' : ''}>${C.LECTURER_TYPES.map((t) => opt(t.id, t.label, l.type)).join('')}</select></label>
        <label class="field"><span>อีเมล</span><input name="email" type="email" value="${esc(l.email)}"></label>
        <label class="field"><span>วุฒิการศึกษาสูงสุด</span><input name="degree" value="${esc(l.degree)}" placeholder="เช่น ปร.ด. (พระพุทธศาสนา)"></label>
        <label class="field"><span>Scopus Author ID</span><input name="scopusId" value="${esc(l.scopusId)}" inputmode="numeric"></label>
        <label class="field"><span>ORCID</span><input name="orcid" value="${esc(l.orcid)}" placeholder="0000-0000-0000-0000"></label>
        ${selfOnly ? '' : `<label class="check full"><input type="checkbox" name="active" ${l.active !== false ? 'checked' : ''}> ปฏิบัติงานอยู่</label>`}
      </div>`,
      onSubmit: async (v) => {
        const rec = Object.assign({}, l, { id: l.id || uid('l') });
        ['prefix', 'position', 'nameTh', 'nameEn', 'email', 'degree', 'scopusId', 'orcid'].forEach((k) => { rec[k] = (v[k] || '').trim(); });
        if (!selfOnly) { rec.programId = v.programId; rec.type = v.type; rec.active = v.active === 'on'; }
        if (!canEditLecturer(rec)) throw new Error('ไม่มีสิทธิ์จัดการอาจารย์ในหลักสูตรนี้');
        await upsert('lecturers', rec);
        toast(editing ? 'บันทึกข้อมูลอาจารย์แล้ว' : 'เพิ่มอาจารย์แล้ว');
        if (!editing) location.hash = '#/lecturer/' + rec.id; else render();
      },
    });
  }

  function renderLecturer(id) {
    const l = byId(S.data.lecturers, id);
    if (!l || !scopeLecturers().includes(l)) return emptyState('user', 'ไม่พบข้อมูลอาจารย์', 'อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง', '<a class="btn" href="#/lecturers">กลับ</a>');
    const e = evalLecturer(l);
    const works = e.all.slice().sort((a, b) => toBE(b.year) - toBE(a.year));
    const links = C.searchLinks(l);
    const years = [];
    for (let y = windowStart(); y <= st().refYear; y++) years.push(y);
    const timeline = years.map((y) => {
      const ws = works.filter((w) => toBE(w.year) === y && w.status !== 'rejected');
      return `<div class="bar-row"><span class="bar-label">${y}${y === windowStart() ? ' ' + chip('ปีสุดท้ายที่นับ', 'warning') : ''}</span>
        <div class="bar-track">${ws.map((w) => `<div class="bar-fill" title="${esc(w.title)}" style="width:${100 / Math.max(3, ws.length)}%;background:${w.status === 'verified' ? catOf(w.category).color : 'var(--warning)'};border-right:2px solid var(--surface)"></div>`).join('')}</div>
        <span class="bar-val">${ws.length} เรื่อง</span></div>`;
    }).join('');
    const rows = works.map((w) => {
      const s = C.STATUSES[w.status] || C.STATUSES.pending;
      return `<tr><td><div class="cell-title">${esc(w.title)}</div><div class="cell-sub">${esc(w.journal || typeOf(w.type).label)} ${w.quartile ? '· ' + esc(w.quartile) : ''}</div></td>
        <td class="nowrap">${toBE(w.year)} ${isExpired(w) ? chip('เกิน ' + st().windowYears + ' ปี', 'neutral') : isExpiring(w) ? chip('ใกล้หมดอายุ', 'warning') : ''}</td>
        <td>${esc(catOf(w.category).short)}</td><td class="num">${isCountable(w) ? fmt(weightOf(w)) : '<span class="muted">0.00</span>'}</td><td>${chip(s.label, s.tone, true)}</td>
        <td class="actions">${canVerify(w) && w.status === 'pending' ? `<button class="btn sm" data-action="verify-work" data-id="${w.id}">${ic('shield')}</button>` : ''}${canEditWork(w) ? `<button class="btn sm" data-action="edit-work" data-id="${w.id}">${ic('edit')}</button>` : `<button class="btn sm" data-action="view-work" data-id="${w.id}">${ic('info')}</button>`}</td></tr>`;
    }).join('');
    return `
      <div class="page-head no-print"><a href="#/lecturers" class="btn ghost sm">← กลับ</a>
        <div class="btn-row">${canEditLecturer(l) ? `<button class="btn" data-action="edit-lecturer" data-id="${l.id}">${ic('edit')}แก้ไขข้อมูล</button>` : ''}<a class="btn" href="#/report/lecturer/${l.id}">${ic('printer')}รายงานรายบุคคล</a>${canEditWork({ lecturerId: l.id }) ? `<button class="btn primary" data-action="add-work" data-lecturer="${l.id}">${ic('plus')}เพิ่มผลงาน</button>` : ''}</div></div>
      <div class="grid side">
        <div class="stack">
          <div class="card card-pad"><div class="profile-head"><div class="avatar">${esc(initials(l.nameTh))}</div><div>
            <h1 style="font-size:21px">${esc(lecturerName(l, true))}</h1>
            <div class="muted">${esc(l.nameEn || '')}</div>
            <div class="tag-list mt" style="margin-top:6px">${chip(lecTypeOf(l.type).label, 'primary')}${chip(programName(l.programId), 'neutral')}${l.active === false ? chip('ไม่ปฏิบัติงาน', 'danger') : ''}</div></div></div></div>
          ${lecturerVerdictCard(l)}
          <div class="card"><div class="card-head"><h2>${ic('doc')} ผลงานวิชาการ (${works.length})</h2></div>
            ${works.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>ผลงาน</th><th>ปี</th><th>ฐาน</th><th class="num">น้ำหนัก</th><th>สถานะ</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
              : emptyState('doc', 'ยังไม่มีผลงาน', 'ค้นหาชื่อในฐานข้อมูลทางด้านขวา แล้วบันทึกผลงานที่พบ')}
          </div>
          <div class="card"><div class="card-head"><h2>${ic('clock')} ผลงานรายปี (${windowStart()}–${st().refYear})</h2></div><div class="card-body"><div class="bars">${timeline}</div></div></div>
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><h3>${ic('search')} ค้นหาชื่อในฐานข้อมูล</h3></div>
            <div class="card-body"><p class="muted small" style="margin-top:0">เปิดค้นชื่อผู้แต่งในแต่ละฐาน แล้วตรวจผลงานตามเกณฑ์ ก.พ.อ. 2562 ${l.nameEn ? '' : '<br><b style="color:var(--warning)">ควรเพิ่มชื่อภาษาอังกฤษเพื่อค้น Scopus/WoS</b>'}</p>
            <div class="stack" style="gap:8px">${links.map((x) => `<a class="db-link" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="db-badge tone-primary">${esc(x.k)}</span><span style="min-width:0"><span class="t">${esc(x.label)}</span><span class="h" style="display:block">${esc(x.hint)}</span></span><span style="margin-left:auto" class="muted">${ic('external')}</span></a>`).join('')}</div></div></div>
          <div class="card card-pad"><dl class="kv">
            <dt>วุฒิการศึกษา</dt><dd>${esc(l.degree || '—')}</dd><dt>อีเมล</dt><dd>${esc(l.email || '—')}</dd>
            <dt>Scopus ID</dt><dd>${esc(l.scopusId || '—')}</dd><dt>ORCID</dt><dd>${esc(l.orcid || '—')}</dd>
            <dt>ค่าน้ำหนักรวม</dt><dd>${fmt(e.weight)}</dd></dl></div>
        </div>
      </div>`;
  }

  // ================= Pages: Programs =================
  function renderPrograms() {
    const progs = scopePrograms();
    const rows = progs.map((p) => {
      const e = evalProgram(p, 'window');
      return `<tr><td><div class="cell-title">${esc(p.name)}</div><div class="cell-sub">${esc(p.degree || '')}</div></td>
        <td>${esc((C.LEVELS[p.level] || C.LEVELS.bachelor).label)}</td>
        <td class="num">${e.responsible.length}</td><td class="num">${e.lecs.length}</td>
        <td class="num">${e.passCount}/${e.lecs.length}</td>
        <td>${esc(p.chair || chairNameOf(p.id) || '—')}</td>
        <td class="actions">${isAdmin() ? `<button class="btn sm" data-action="edit-program" data-id="${p.id}">${ic('edit')}</button><button class="btn sm danger" data-action="delete-program" data-id="${p.id}">${ic('trash')}</button>` : ''}<a class="btn sm" href="#/report/program/${p.id}" title="รายงาน">${ic('printer')}</a></td></tr>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>หลักสูตร</h1><p>หลักสูตรที่เปิดสอนและอาจารย์ในหลักสูตร</p></div>${isAdmin() ? `<button class="btn primary" data-action="add-program">${ic('plus')}เพิ่มหลักสูตร</button>` : ''}</div>
      <div class="card">${progs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>หลักสูตร</th><th>ระดับ</th><th class="num">ผู้รับผิดชอบ</th><th class="num">อาจารย์ทั้งหมด</th><th class="num">ผ่านเกณฑ์</th><th>ประธานหลักสูตร</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : emptyState('layers', 'ยังไม่มีหลักสูตร', 'เริ่มต้นด้วยการเพิ่มหลักสูตรที่เปิดสอน', isAdmin() ? `<button class="btn primary" data-action="add-program">${ic('plus')}เพิ่มหลักสูตร</button>` : '')}</div>`;
  }
  function chairNameOf(programId) {
    const u = S.data.users.find((x) => x.role === 'chair' && x.programId === programId);
    return u ? u.displayName : '';
  }
  function openProgramForm(p) {
    const editing = !!p;
    p = p || { level: 'bachelor' };
    openModal({
      title: editing ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตร',
      body: `<div class="form-grid">
        <label class="field full"><span>ชื่อหลักสูตร / สาขาวิชา <em>*</em></span><input name="name" required value="${esc(p.name)}" placeholder="เช่น พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา"></label>
        <label class="field"><span>ชื่อปริญญา (ย่อ)</span><input name="degree" value="${esc(p.degree)}" placeholder="เช่น พธ.บ."></label>
        <label class="field"><span>ระดับ</span><select name="level">${Object.entries(C.LEVELS).map(([k, v]) => opt(k, v.label, p.level)).join('')}</select></label>
        <label class="field"><span>ประธานหลักสูตร</span><input name="chair" value="${esc(p.chair)}"></label>
        <label class="field"><span>ปี พ.ศ. หลักสูตร (ปรับปรุง)</span><input name="curriculumYear" value="${esc(p.curriculumYear)}" inputmode="numeric"></label>
      </div>`,
      onSubmit: async (v) => {
        const rec = Object.assign({}, p, { id: p.id || uid('p') }, { name: v.name.trim(), degree: v.degree.trim(), level: v.level, chair: v.chair.trim(), curriculumYear: v.curriculumYear.trim() });
        await upsert('programs', rec);
        toast('บันทึกหลักสูตรแล้ว');
        render();
      },
    });
  }

  // ================= Pages: Verify =================
  function renderVerify() {
    const tab = view.tabs.verify || 'pending';
    const works = scopeWorks().filter((w) => canVerify(w));
    const pending = works.filter((w) => w.status === 'pending').sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const history = works.filter((w) => w.status !== 'pending' && w.reviewedAt).sort((a, b) => String(b.reviewedAt).localeCompare(String(a.reviewedAt))).slice(0, 50);
    const list = tab === 'pending' ? pending : history;
    const items = list.map((w) => {
      const l = byId(S.data.lecturers, w.lecturerId);
      const c = catOf(w.category);
      const s = C.STATUSES[w.status];
      return `<div class="result-item">
        <span class="db-badge" style="background:${c.color}22;color:${c.color}">${esc(c.short.slice(0, 6))}</span>
        <div class="grow"><div class="cell-title">${esc(w.title)}</div>
          <div class="meta">${esc(lecturerName(l))} · ${esc(programName(l && l.programId))} · ปี ${toBE(w.year)} · ${esc(w.journal || c.label)}${w.quartile ? ' · ' + esc(w.quartile) : ''}</div>
          <div class="meta">${tab === 'pending' ? `ส่งเมื่อ ${fmtDate(w.createdAt)} โดย ${esc(w.createdBy || '—')}` : `${chip(s.label, s.tone, true)} ${esc(w.reviewedBy || '')} · ${fmtDate(w.reviewedAt)}${w.reviewNote ? ' · ' + esc(w.reviewNote) : ''}`}
            ${isExpired(w) ? chip('เกิน ' + st().windowYears + ' ปี', 'neutral') : ''}</div></div>
        <button class="btn sm ${tab === 'pending' ? 'primary' : ''}" data-action="verify-work" data-id="${w.id}">${ic('shield')}${tab === 'pending' ? 'ตรวจ' : 'ทบทวน'}</button></div>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>ตรวจรับรองผลงาน</h1><p>ขั้นตอน: อาจารย์บันทึก → ผู้ตรวจค้นในฐานข้อมูล → รับรอง/ส่งกลับแก้ไข → นับคะแนน</p></div></div>
      <div class="tabs" role="tablist"><button class="${tab === 'pending' ? 'active' : ''}" data-action="tab" data-tab="verify" data-value="pending">รอตรวจสอบ (${pending.length})</button><button class="${tab === 'history' ? 'active' : ''}" data-action="tab" data-tab="verify" data-value="history">ประวัติการตรวจ</button></div>
      <div class="card card-pad">${list.length ? `<div class="stack" style="gap:8px">${items}</div>` : emptyState('checkc', tab === 'pending' ? 'ไม่มีผลงานรอตรวจ' : 'ยังไม่มีประวัติการตรวจ', tab === 'pending' ? 'ผลงานทั้งหมดได้รับการตรวจแล้ว' : '')}</div>`;
  }

  // ================= Pages: Assessment =================
  function renderAssessment() {
    const mode = view.tabs.assessMode || 'year';
    const progs = scopePrograms();
    const rows = progs.map((p) => {
      const e = evalProgram(p, mode);
      const b = scoreBand(e.score);
      return `<tr>
        <td><div class="cell-title">${esc(p.name)}</div><div class="cell-sub">${esc((C.LEVELS[p.level] || C.LEVELS.bachelor).label)} · เป้าหมายร้อยละ ${e.target}</div></td>
        <td class="num">${e.n}</td><td class="num">${e.works.length}</td><td class="num">${fmt(e.sum)}</td><td class="num">${fmt(e.pct)}</td>
        <td class="num"><b style="font-size:17px">${fmt(e.score)}</b></td><td>${chip(b.label, b.tone)}</td>
        <td class="num">${e.passCount}/${e.lecs.length}</td>
        <td class="actions"><a class="btn sm" href="#/report/program/${p.id}">${ic('printer')}รายงาน</a></td></tr>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>ประเมินคุณภาพหลักสูตร</h1><p>ตัวบ่งชี้ผลงานวิชาการของอาจารย์ผู้รับผิดชอบหลักสูตร · ปีประเมิน ${st().refYear}</p></div>
        <div class="btn-row"><a class="btn" href="#/report/college">${ic('printer')}รายงานภาพรวมวิทยาลัย</a></div></div>
      <div class="tabs"><button class="${mode === 'year' ? 'active' : ''}" data-action="tab" data-tab="assessMode" data-value="year">ผลงานปี ${st().refYear} (ตามคู่มือ QA)</button><button class="${mode === 'window' ? 'active' : ''}" data-action="tab" data-tab="assessMode" data-value="window">ผลงานสะสม ${st().windowYears} ปี (${windowStart()}–${st().refYear})</button></div>
      <div class="card mb">${progs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>หลักสูตร</th><th class="num">อ.ผู้รับผิดชอบ</th><th class="num">จำนวนผลงาน</th><th class="num">ผลรวมถ่วงน้ำหนัก</th><th class="num">ร้อยละ</th><th class="num">คะแนน (5)</th><th>ระดับ</th><th class="num">อ.ผ่านเกณฑ์</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState('chart', 'ยังไม่มีหลักสูตร', '')}</div>
      <div class="card card-pad"><h3 style="font-size:15px;margin-bottom:8px">${ic('info')} วิธีคำนวณ</h3>
        <ol class="small muted" style="margin:0;padding-left:20px">
          <li>ร้อยละผลรวมถ่วงน้ำหนัก = (ผลรวมค่าน้ำหนักผลงานที่รับรองแล้วของอาจารย์ผู้รับผิดชอบหลักสูตร ÷ จำนวนอาจารย์ผู้รับผิดชอบหลักสูตร) × 100</li>
          <li>แปลงเป็นคะแนน: คะแนน = (ร้อยละ ÷ ร้อยละเป้าหมาย) × 5 (สูงสุด 5) — เป้าหมาย ป.ตรี ${st().targets.bachelor} · ป.โท ${st().targets.master} · ป.เอก ${st().targets.phd}</li>
          <li>ค่าน้ำหนักแต่ละประเภทดูได้ที่ <a href="#/guide">คู่มือ & เกณฑ์</a> (ปรับได้โดยผู้ดูแลระบบ)</li></ol></div>`;
  }

  // ================= Pages: Reports =================
  function renderReports() {
    const progs = scopePrograms();
    const lecs = scopeLecturers();
    return `
      <div class="page-head"><div><h1>รายงาน</h1><p>เลือกรายงาน แล้วกด "พิมพ์ / บันทึก PDF" (เลือกปลายทางเป็น Save as PDF)</p></div></div>
      <div class="grid two">
        ${role() !== 'lecturer' ? `<div class="card"><div class="card-head"><h2>${ic('layers')} รายงานผลการประเมินรายหลักสูตร</h2></div><div class="card-body"><div class="stack" style="gap:8px">
          ${progs.map((p) => `<a class="db-link" href="#/report/program/${p.id}"><span class="db-badge tone-primary">${ic('layers')}</span><span><span class="t">${esc(p.name)}</span><span class="h" style="display:block">${esc((C.LEVELS[p.level] || C.LEVELS.bachelor).label)}</span></span></a>`).join('') || '<span class="muted">ยังไม่มีหลักสูตร</span>'}</div></div></div>` : ''}
        <div class="card"><div class="card-head"><h2>${ic('user')} รายงานผลงานรายบุคคล</h2></div><div class="card-body">
          <label class="field"><span>เลือกอาจารย์</span><select class="input" id="reportLecturer">${lecs.map((l) => opt(l.id, lecturerName(l) + ' · ' + programName(l.programId))).join('')}</select></label>
          <button class="btn primary mt" data-action="open-lecturer-report" ${lecs.length ? '' : 'disabled'}>${ic('printer')}เปิดรายงาน</button></div></div>
        ${role() === 'admin' || role() === 'executive' ? `<div class="card"><div class="card-head"><h2>${ic('chart')} รายงานภาพรวมวิทยาลัย</h2></div><div class="card-body"><p class="muted" style="margin-top:0">สรุปคะแนนทุกหลักสูตร สถานะอาจารย์ และสัดส่วนผลงาน</p><a class="btn primary" href="#/report/college">${ic('printer')}เปิดรายงาน</a></div></div>` : ''}
        <div class="card"><div class="card-head"><h2>${ic('download')} ส่งออกข้อมูล</h2></div><div class="card-body"><p class="muted" style="margin-top:0">ไฟล์ CSV เปิดด้วย Excel / Google Sheets ได้ (รองรับภาษาไทย)</p><button class="btn" data-action="export-csv">${ic('download')}ผลงานทั้งหมด (CSV)</button></div></div>
      </div>`;
  }

  function reportHeader(title, sub, noWindow) {
    const s = st();
    const period = noWindow ? 'นับผลงานทั้งหมด' : `ปีประเมิน ${s.refYear} · รอบผลงาน ${windowStart()}–${s.refYear}`;
    return `<div class="report-head"><div class="muted small">${esc(s.university)}</div><h2>${esc(s.collegeName)}</h2><h2 style="margin-top:4px">${esc(title)}</h2>
      <div class="muted small">${esc(sub || '')} · ${period} · พิมพ์เมื่อ ${fmtDate(new Date().toISOString())}</div></div>`;
  }
  const reportBar = (back) => `<div class="page-head no-print"><a href="${back}" class="btn ghost sm">← กลับ</a><button class="btn primary" data-action="print">${ic('printer')}พิมพ์ / บันทึก PDF</button></div>`;
  const signBlock = (a, b) => `<div class="sign-row"><div>ลงชื่อ ................................................<br>(${esc(a)})</div><div>ลงชื่อ ................................................<br>(${esc(b)})</div></div>`;

  function worksTable(works, showLecturer) {
    if (!works.length) return '<p class="muted">ไม่มีผลงาน</p>';
    return `<div class="table-wrap"><table class="table"><thead><tr><th>#</th>${showLecturer ? '<th>อาจารย์</th>' : ''}<th>ผลงาน</th><th>ปี</th><th>แหล่งเผยแพร่</th><th>สถานะ</th><th class="num">ค่าน้ำหนัก</th></tr></thead><tbody>
      ${works.map((w, i) => `<tr><td>${i + 1}</td>${showLecturer ? `<td>${esc(lecturerName(byId(S.data.lecturers, w.lecturerId)))}</td>` : ''}<td>${esc(w.title)}<div class="cell-sub">${esc(w.journal || '')} ${esc(w.detail || '')}</div></td><td>${toBE(w.year)}</td><td>${esc(catOf(w.category).short)}${w.quartile ? ' ' + esc(w.quartile) : ''}</td><td>${esc((C.STATUSES[w.status] || {}).label || '')}</td><td class="num">${isCountable(w) ? fmt(weightOf(w)) : '0.00'}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function renderReport(kind, id) {
    if (kind === 'program') {
      const p = byId(scopePrograms(), id);
      if (!p) return emptyState('layers', 'ไม่พบหลักสูตร', '', '<a class="btn" href="#/reports">กลับ</a>');
      const ey = evalProgram(p, 'year');
      const ew = evalProgram(p, 'window');
      const lecRows = ey.evals.map(({ l, e }, i) => `<tr><td>${i + 1}</td><td>${esc(lecturerName(l, true))}</td><td>${esc(lecTypeOf(l.type).label)}</td><td class="num">${e.counted.length}/${e.req.minWorks}</td><td class="num">${fmt(e.weight)}</td><td>${STATUS_META[e.status].label}</td></tr>`).join('');
      const responsibleIds = new Set(ew.responsible.map((l) => l.id));
      const works = S.data.works.filter((w) => responsibleIds.has(w.lecturerId) && inWindow(w)).sort((a, b) => toBE(b.year) - toBE(a.year));
      return `${reportBar('#/assessment')}<div class="card card-pad">
        ${reportHeader('รายงานผลงานวิชาการของอาจารย์ประจำหลักสูตร', p.name)}
        <div class="grid stats" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat card"><span class="muted small">อ.ผู้รับผิดชอบหลักสูตร</span><span class="stat-num">${ey.n}</span></div>
          <div class="stat card"><span class="muted small">ผลรวมถ่วงน้ำหนัก (ปี ${st().refYear})</span><span class="stat-num">${fmt(ey.sum)}</span></div>
          <div class="stat card"><span class="muted small">ร้อยละ (เป้าหมาย ${ey.target})</span><span class="stat-num">${fmt(ey.pct)}</span></div>
          <div class="stat card"><span class="muted small">คะแนนตัวบ่งชี้ (เต็ม 5)</span><span class="stat-num" style="color:var(--primary)">${fmt(ey.score)}</span></div></div>
        <p class="small muted">ผลงานสะสม ${st().windowYears} ปี: ผลรวมถ่วงน้ำหนัก ${fmt(ew.sum)} · ร้อยละ ${fmt(ew.pct)} · คะแนน ${fmt(ew.score)}</p>
        <h3 class="mt" style="font-size:16px">1. คุณสมบัติด้านผลงานของอาจารย์ในหลักสูตร</h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>ชื่อ - สกุล</th><th>ประเภท</th><th class="num">ผลงาน/เกณฑ์</th><th class="num">ค่าน้ำหนัก</th><th>ผล</th></tr></thead><tbody>${lecRows}</tbody></table></div>
        <h3 class="mt" style="font-size:16px">2. รายการผลงานของอาจารย์ผู้รับผิดชอบหลักสูตร (${windowStart()}–${st().refYear})</h3>
        ${worksTable(works, true)}
        ${signBlock(p.chair || chairNameOf(p.id) || 'ประธานหลักสูตร', 'ผู้อำนวยการ / ผู้บริหาร')}</div>`;
    }
    if (kind === 'lecturer') {
      const l = byId(scopeLecturers(), id);
      if (!l) return emptyState('user', 'ไม่พบข้อมูลอาจารย์', '', '<a class="btn" href="#/reports">กลับ</a>');
      const e = evalLecturer(l);
      const works = e.all.slice().sort((a, b) => toBE(b.year) - toBE(a.year));
      return `${reportBar('#/lecturer/' + l.id)}<div class="card card-pad">
        ${reportHeader('แบบรายงานผลงานวิชาการรายบุคคล', lecturerName(l, true))}
        <dl class="kv"><dt>ชื่อ - สกุล</dt><dd>${esc(lecturerName(l, true))} ${l.nameEn ? '(' + esc(l.nameEn) + ')' : ''}</dd><dt>หลักสูตร</dt><dd>${esc(programName(l.programId))}</dd>
          <dt>ประเภท</dt><dd>${esc(lecTypeOf(l.type).label)}</dd><dt>เกณฑ์</dt><dd>ผลงาน ≥ ${e.req.minWorks} เรื่องใน ${st().windowYears} ปี${e.req.minResearch ? ` (วิจัย ≥ ${e.req.minResearch})` : ''}</dd>
          <dt>ผลการตรวจสอบ</dt><dd><b>${STATUS_META[e.status].label}</b> — นับได้ ${e.counted.length} เรื่อง · ค่าน้ำหนักรวม ${fmt(e.weight)}</dd></dl>
        <h3 class="mt" style="font-size:16px">รายการผลงาน</h3>${worksTable(works)}
        ${signBlock(lecturerName(l, true), 'ผู้ตรวจสอบ')}</div>`;
    }
    if (kind === 'external') return renderExternalReport(id);
    if (kind === 'college') {
      const progs = scopePrograms();
      const rows = progs.map((p, i) => { const e = evalProgram(p, 'year'); const w = evalProgram(p, 'window'); return `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${esc((C.LEVELS[p.level] || C.LEVELS.bachelor).label)}</td><td class="num">${e.n}</td><td class="num">${fmt(e.sum)}</td><td class="num">${fmt(e.pct)}</td><td class="num"><b>${fmt(e.score)}</b></td><td class="num">${fmt(w.score)}</td><td class="num">${e.passCount}/${e.lecs.length}</td></tr>`; }).join('');
      const avg = progs.length ? progs.reduce((s, p) => s + evalProgram(p, 'year').score, 0) / progs.length : 0;
      const ws = S.data.works.filter((w) => inWindow(w) && w.status === 'verified');
      const byCat = C.CATEGORIES.map((c) => ({ label: c.short, color: c.color, value: ws.filter((w) => w.category === c.id).length }));
      return `${reportBar('#/reports')}<div class="card card-pad">
        ${reportHeader('รายงานสรุปผลงานวิชาการระดับวิทยาลัย', 'ทุกหลักสูตร')}
        <div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>หลักสูตร</th><th>ระดับ</th><th class="num">อ.ผู้รับผิดชอบ</th><th class="num">ผลรวมถ่วงน้ำหนัก</th><th class="num">ร้อยละ</th><th class="num">คะแนนปี ${st().refYear}</th><th class="num">คะแนนสะสม ${st().windowYears} ปี</th><th class="num">อ.ผ่านเกณฑ์</th></tr></thead><tbody>${rows}</tbody>
        <tfoot><tr><td colspan="6" class="num"><b>คะแนนเฉลี่ยระดับวิทยาลัย</b></td><td class="num"><b>${fmt(avg)}</b></td><td colspan="2"></td></tr></tfoot></table></div>
        <h3 class="mt" style="font-size:16px">สัดส่วนผลงานที่รับรองแล้ว (${windowStart()}–${st().refYear})</h3><div class="mt">${donut(byCat, 'ผลงาน')}</div>
        ${signBlock('ผู้รับผิดชอบงานประกันคุณภาพ', 'ผู้อำนวยการวิทยาลัย')}</div>`;
    }
    return emptyState('printer', 'ไม่พบรายงาน', '', '<a class="btn" href="#/reports">กลับ</a>');
  }

  // ================= Pages: External experts (ตรวจคุณสมบัติบุคคลภายนอก) =================
  const EXAM_LEVELS = { master: 'ปริญญาโท', phd: 'ปริญญาเอก' };
  const DEGREE_LEVELS = { phd: 'ปริญญาเอกหรือเทียบเท่า', master: 'ปริญญาโท', bachelor: 'ปริญญาตรี' };

  function pubCounts(list) {
    return {
      intl: list.filter((p) => catOf(p.category).kpa === 'intl').length,
      nat: list.filter((p) => catOf(p.category).kpa === 'nat').length,
      other: list.filter((p) => !catOf(p.category).kpa).length,
      total: list.length,
    };
  }

  // ประเมินคุณสมบัติตามเกณฑ์ปีที่กำหนด (2548/2558/2565) และระดับการสอบ (โท/เอก)
  function evalExternal(x, stdKey, level) {
    stdKey = stdKey || x.standard || '2565';
    level = level || x.examLevel || 'master';
    const std = C.EXTERNAL_STANDARDS[stdKey];
    const rule = std[level];
    const highPos = ['รองศาสตราจารย์', 'ศาสตราจารย์'].includes(x.position);
    const degreeOk = x.degreeLevel === 'phd' || (stdKey === '2548' && x.degreeLevel === 'master' && highPos);
    const pubs = x.pubs || [];
    const ver = pubCounts(pubs.filter((p) => p.verified));
    const all = pubCounts(pubs);
    const meets = (c) => {
      if (rule.rule === 'research') return !!x.researchExp || c.total > 0;
      if (rule.rule === 'intl') return c.intl >= rule.intl;
      if (rule.rule === 'natOrIntl') return c.intl >= rule.intl || c.nat + c.intl >= rule.nat;
      return c.intl + c.nat >= rule.min;
    };
    const progress = (c) => {
      if (rule.rule === 'research') return x.researchExp || c.total ? 'มีประสบการณ์ทำวิจัย' : 'ยังไม่พบหลักฐานการทำวิจัย';
      if (rule.rule === 'intl') return `นานาชาติ ${c.intl}/${rule.intl}`;
      if (rule.rule === 'natOrIntl') return `ชาติ+นานาชาติ ${c.nat + c.intl}/${rule.nat} หรือ นานาชาติ ${c.intl}/${rule.intl}`;
      return `ฐานที่ยอมรับ ${c.intl + c.nat}/${rule.min}`;
    };
    const worksOk = meets(ver);
    const worksPending = !worksOk && meets(all);
    const status = degreeOk && worksOk ? 'pass' : degreeOk && worksPending ? 'pending' : 'fail';
    return { std, rule, degreeOk, worksOk, worksPending, status, ver, all, progress: progress(ver), stdKey, level };
  }

  function scopeExternals() {
    const all = S.data.externals;
    if (role() === 'chair') return all.filter((x) => !x.programId || x.programId === S.user.programId);
    return canSeeExternals() ? all : [];
  }

  function renderExternals() {
    const f = view.filters.externals || (view.filters.externals = { q: '', status: '' });
    let list = scopeExternals().map((x) => ({ x, e: evalExternal(x) }));
    const q = f.q.trim().toLowerCase();
    if (q) list = list.filter(({ x }) => [x.prefix, x.nameTh, x.nameEn, x.affiliation].join(' ').toLowerCase().includes(q));
    if (f.status) list = list.filter(({ e }) => e.status === f.status);
    list.sort((a, b) => String(b.x.updatedAt).localeCompare(String(a.x.updatedAt)));
    const rows = list.map(({ x, e }) => {
      const m = STATUS_META[e.status];
      return `<tr class="row-link" data-href="#/external/${x.id}">
        <td><div class="person-cell"><div class="avatar sm">${esc(initials(x.nameTh))}</div><div><div class="cell-title">${esc(lecturerName(x, true))}</div><div class="cell-sub">${esc(x.affiliation || x.nameEn || '')}</div></div></div></td>
        <td>${esc(x.role || '—')}<div class="cell-sub">${x.programId ? esc(programName(x.programId)) : ''}</div></td>
        <td>${esc(EXAM_LEVELS[x.examLevel] || '—')}<div class="cell-sub">${esc(e.std.label)}</div></td>
        <td class="num">${e.ver.intl}/${e.ver.nat}</td>
        <td>${chip(m.label === 'ผ่านเกณฑ์' ? 'ผ่านคุณสมบัติ' : m.label === 'รอรับรองผลงาน' ? 'รอยืนยันผลงาน' : 'ไม่ผ่านคุณสมบัติ', m.tone, true)}</td>
        <td class="cell-sub">${x.checkedAt ? fmtDate(x.checkedAt) + '<br>' + esc(x.checkedBy || '') : '—'}</td>
      </tr>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>ตรวจคุณสมบัติบุคคลภายนอก</h1><p>ผู้ทรงคุณวุฒิภายนอก / กรรมการสอบวิทยานิพนธ์ — ค้นชื่อในฐานข้อมูลและตรวจตามเกณฑ์ 2548 · 2558 · 2565 (อ้างอิงประกาศ ก.พ.อ. 2562)</p></div>
        ${canEditExternal() ? `<button class="btn primary" data-action="add-external">${ic('plus')}ตรวจบุคคลใหม่</button>` : ''}</div>
      <div class="card">
        <div class="toolbar">
          <input class="input grow" type="search" placeholder="ค้นหาชื่อ หรือหน่วยงาน…" value="${esc(f.q)}" data-filter="externals.q">
          <select class="input" data-filter="externals.status"><option value="">ทุกผลการตรวจ</option>${opt('pass', 'ผ่านคุณสมบัติ', f.status)}${opt('pending', 'รอยืนยันผลงาน', f.status)}${opt('fail', 'ไม่ผ่านคุณสมบัติ', f.status)}</select>
        </div>
        ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>ชื่อ - สกุล / หน่วยงาน</th><th>บทบาทที่เชิญ</th><th>ระดับ / เกณฑ์</th><th class="num">นานาชาติ/ชาติ</th><th>ผลการตรวจ</th><th>ตรวจเมื่อ</th></tr></thead><tbody>${rows}</tbody></table></div>`
          : emptyState('search', 'ยังไม่มีรายชื่อบุคคลภายนอก', 'เพิ่มรายชื่อผู้ทรงคุณวุฒิที่จะเชิญ แล้วค้นหาผลงานในฐานข้อมูลเพื่อตรวจคุณสมบัติ', canEditExternal() ? `<button class="btn primary" data-action="add-external">${ic('plus')}ตรวจบุคคลใหม่</button>` : '')}
      </div>`;
  }

  function openExternalForm(x) {
    const editing = !!x;
    x = x || { examLevel: 'master', standard: '2565', degreeLevel: 'phd', role: C.EXTERNAL_ROLES[0], programId: role() === 'chair' ? S.user.programId : '', pubs: [] };
    const progs = role() === 'chair' ? scopePrograms() : S.data.programs;
    openModal({
      title: editing ? 'แก้ไขข้อมูลบุคคลภายนอก' : 'ตรวจคุณสมบัติบุคคลภายนอก', wide: true,
      body: `<div class="form-grid">
        <label class="field"><span>คำนำหน้า / สมณศักดิ์</span><input name="prefix" value="${esc(x.prefix)}" placeholder="เช่น พระมหา, ดร., นาย"></label>
        <label class="field"><span>ตำแหน่งทางวิชาการ</span><select name="position">${C.ACADEMIC_POSITIONS.map((p) => opt(p, p || '— ไม่มี —', x.position || '')).join('')}</select></label>
        <label class="field"><span>ชื่อ - สกุล (ไทย) <em>*</em></span><input name="nameTh" required value="${esc(x.nameTh)}"></label>
        <label class="field"><span>ชื่อภาษาอังกฤษ <small>(ใช้ค้น Scopus/WoS)</small></span><input name="nameEn" value="${esc(x.nameEn)}" placeholder="Firstname Lastname"></label>
        <label class="field full"><span>หน่วยงาน / สถาบันต้นสังกัด</span><input name="affiliation" value="${esc(x.affiliation)}"></label>
        <label class="field"><span>วุฒิการศึกษาสูงสุด <em>*</em></span><select name="degreeLevel">${Object.entries(DEGREE_LEVELS).map(([k, v]) => opt(k, v, x.degreeLevel)).join('')}</select></label>
        <label class="field"><span>ชื่อปริญญา / สาขา</span><input name="degreeName" value="${esc(x.degreeName)}" placeholder="เช่น Ph.D. (Buddhist Studies)"></label>
        <label class="field"><span>บทบาทที่เชิญ</span><select name="role">${C.EXTERNAL_ROLES.map((r) => opt(r, r, x.role)).join('')}</select></label>
        <label class="field"><span>หลักสูตรที่เชิญ</span><select name="programId"><option value="">— ไม่ระบุ —</option>${progs.map((p) => opt(p.id, p.name, x.programId)).join('')}</select></label>
        <label class="field"><span>ระดับการสอบ / หลักสูตร</span><select name="examLevel">${Object.entries(EXAM_LEVELS).map(([k, v]) => opt(k, v, x.examLevel)).join('')}</select></label>
        <label class="field"><span>เกณฑ์มาตรฐานที่หลักสูตรใช้</span><select name="standard">${Object.entries(C.EXTERNAL_STANDARDS).map(([k, v]) => opt(k, v.label, x.standard)).join('')}</select></label>
        <label class="field"><span>Scopus Author ID</span><input name="scopusId" value="${esc(x.scopusId)}" inputmode="numeric"></label>
        <label class="field"><span>ORCID</span><input name="orcid" value="${esc(x.orcid)}"></label>
        <label class="check full"><input type="checkbox" name="researchExp" ${x.researchExp ? 'checked' : ''}> มีประสบการณ์ทำวิจัยที่ไม่ใช่ส่วนหนึ่งของการศึกษาเพื่อรับปริญญา (ใช้กับเกณฑ์ 2548)</label>
      </div>`,
      onSubmit: async (v) => {
        const rec = Object.assign({ pubs: [] }, x, { id: x.id || uid('x') });
        ['prefix', 'position', 'nameTh', 'nameEn', 'affiliation', 'degreeLevel', 'degreeName', 'role', 'programId', 'examLevel', 'standard', 'scopusId', 'orcid'].forEach((k) => { rec[k] = (v[k] || '').trim(); });
        rec.researchExp = v.researchExp === 'on';
        if (!editing) { rec.createdAt = new Date().toISOString(); rec.createdBy = S.user.displayName; }
        await upsert('externals', rec);
        toast(editing ? 'บันทึกแล้ว' : 'เพิ่มรายชื่อแล้ว — ค้นหาผลงานในฐานข้อมูลต่อได้เลย');
        if (!editing) location.hash = '#/external/' + rec.id; else render();
      },
    });
  }

  function openPubForm(x, pub) {
    const editing = !!pub;
    pub = pub || { category: 'scopus', verified: true };
    const form = openModal({
      title: editing ? 'แก้ไขผลงาน' : 'บันทึกผลงานที่พบในฐานข้อมูล', wide: true,
      body: `<div class="form-grid">
        <label class="field full"><span>ชื่อผลงาน <em>*</em></span><textarea name="title" rows="2" required>${esc(pub.title)}</textarea></label>
        <label class="field full"><span>ฐานข้อมูลที่พบ <em>*</em></span><select name="category" data-live="pub">${C.CATEGORIES.filter((c) => c.journal || /^proc/.test(c.id)).map((c) => opt(c.id, c.label, pub.category)).join('')}</select></label>
        <label class="field"><span>ชื่อวารสาร</span><input name="journal" value="${esc(pub.journal)}"></label>
        <label class="field"><span>ISSN</span><input name="issn" value="${esc(pub.issn)}"></label>
        <label class="field"><span>ปีที่ตีพิมพ์ (พ.ศ./ค.ศ.)</span><input name="year" inputmode="numeric" value="${esc(pub.year)}"></label>
        <label class="field"><span>Quartile</span><select name="quartile"><option value="">ไม่ระบุ</option>${C.QUARTILES.map((q) => opt(q, q, pub.quartile)).join('')}</select></label>
        <label class="field full"><span>ลิงก์หลักฐาน / DOI</span><input name="url" value="${esc(pub.url)}" placeholder="https:// หรือ 10.xxxx/…"></label>
        <label class="check full"><input type="checkbox" name="verified" ${pub.verified ? 'checked' : ''}> ยืนยันแล้ว — ตรวจพบในฐานข้อมูลจริง และวารสารอยู่ในฐานในปีที่ตีพิมพ์</label>
      </div><div class="mt" id="pubHint"></div>`,
      onSubmit: async (v) => {
        const p = Object.assign({}, pub, { id: pub.id || uid('pub'), title: v.title.trim(), category: v.category, journal: v.journal.trim(), issn: v.issn.trim(),
          year: v.year ? toBE(v.year) : '', quartile: v.quartile, url: v.url.trim(), verified: v.verified === 'on' });
        const rec = Object.assign({}, x, { pubs: (x.pubs || []).filter((y) => y.id !== p.id).concat(p) });
        await upsert('externals', rec);
        toast('บันทึกผลงานแล้ว');
        render();
      },
    });
    const hint = () => {
      const c = catOf(form.category.value);
      $('#pubHint', form).innerHTML = c.kpa === 'intl' ? `<div class="alert tone-success">${ic('checkc')}<div><b>นับเป็นผลงานระดับนานาชาติ</b>ฐานข้อมูลตามประกาศ ก.พ.อ. 2562</div></div>`
        : c.kpa === 'nat' ? `<div class="alert tone-info">${ic('checkc')}<div><b>นับเป็นผลงานระดับชาติ</b>TCI กลุ่ม 1–2 ตามประกาศ ก.พ.อ. 2562</div></div>`
        : `<div class="alert tone-danger">${ic('xc')}<div><b>ไม่นับเป็นผลงานในฐานข้อมูลที่ยอมรับ</b>นับได้เฉพาะ "ประสบการณ์ทำวิจัย" ตามเกณฑ์ 2548</div></div>`;
      hydrateIcons($('#pubHint', form));
    };
    form.category.addEventListener('change', hint); hint();
  }

  function externalMatrix(x) {
    const level = x.examLevel || 'master';
    const keys = Object.keys(C.EXTERNAL_STANDARDS);
    const evs = keys.map((k) => evalExternal(x, k, level));
    const cell = (ok, pending, text) => `<td><div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--${ok ? 'success' : pending ? 'warning' : 'danger'});flex:none">${ic(ok ? 'checkc' : pending ? 'hourglass' : 'xc')}</span><span>${text}</span></div></td>`;
    return `<div class="table-wrap"><table class="table"><thead><tr><th>คุณสมบัติ (${esc(EXAM_LEVELS[level])})</th>${keys.map((k) => `<th${k === (x.standard || '2565') ? ' style="color:var(--primary)"' : ''}>${esc(C.EXTERNAL_STANDARDS[k].label)}${k === (x.standard || '2565') ? ' ★' : ''}</th>`).join('')}</tr></thead><tbody>
      <tr><td class="cell-title">คุณวุฒิ</td>${evs.map((e) => cell(e.degreeOk, false, `${esc(e.std.degree)}`)).join('')}</tr>
      <tr><td class="cell-title">ผลงานทางวิชาการ</td>${evs.map((e) => cell(e.worksOk, e.worksPending, `${esc(e.rule.text)}<div class="cell-sub">${esc(e.progress)}</div>`)).join('')}</tr>
      <tr><td class="cell-title">สรุป</td>${evs.map((e) => `<td>${chip(e.status === 'pass' ? 'ผ่าน' : e.status === 'pending' ? 'รอยืนยันผลงาน' : 'ไม่ผ่าน', STATUS_META[e.status].tone, true)}</td>`).join('')}</tr>
      </tbody></table></div>`;
  }

  function renderExternal(id) {
    const x = byId(scopeExternals(), id);
    if (!x) return emptyState('user', 'ไม่พบข้อมูล', 'อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง', '<a class="btn" href="#/externals">กลับ</a>');
    const e = evalExternal(x);
    const m = STATUS_META[e.status];
    const edit = canEditExternal();
    const pubs = (x.pubs || []).slice().sort((a, b) => (toBE(b.year) || 0) - (toBE(a.year) || 0));
    const rows = pubs.map((p, i) => {
      const c = catOf(p.category);
      return `<tr><td>${i + 1}</td><td><div class="cell-title">${esc(p.title)}</div><div class="cell-sub">${esc(p.journal || '')}${p.issn ? ' · ISSN ' + esc(p.issn) : ''}${p.url ? ` · <a href="${esc(/^10\./.test(p.url) ? 'https://doi.org/' + p.url : p.url)}" target="_blank" rel="noopener">หลักฐาน</a>` : ''}</div></td>
        <td class="nowrap">${esc(p.year || '—')}</td>
        <td><span class="chip" style="background:${c.color}22;color:${c.color}">${esc(c.short)}${p.quartile ? ' ' + esc(p.quartile) : ''}</span><div class="cell-sub">${c.kpa === 'intl' ? 'นานาชาติ' : c.kpa === 'nat' ? 'ชาติ' : 'ไม่นับ'}</div></td>
        <td>${edit ? `<label class="check"><input type="checkbox" data-action="toggle-pub" data-x="${x.id}" data-id="${p.id}" ${p.verified ? 'checked' : ''}>${p.verified ? 'ยืนยันแล้ว' : 'รอยืนยัน'}</label>` : chip(p.verified ? 'ยืนยันแล้ว' : 'รอยืนยัน', p.verified ? 'success' : 'warning')}</td>
        <td class="actions">${edit ? `<button class="btn sm" data-action="edit-pub" data-x="${x.id}" data-id="${p.id}">${ic('edit')}</button><button class="btn sm danger" data-action="delete-pub" data-x="${x.id}" data-id="${p.id}">${ic('trash')}</button>` : ''}</td></tr>`;
    }).join('');
    const links = C.searchLinks(x);
    return `
      <div class="page-head no-print"><a href="#/externals" class="btn ghost sm">← กลับ</a>
        <div class="btn-row">${edit ? `<button class="btn" data-action="edit-external" data-id="${x.id}">${ic('edit')}แก้ไขข้อมูล</button><button class="btn danger" data-action="delete-external" data-id="${x.id}">${ic('trash')}</button>` : ''}<a class="btn" href="#/report/external/${x.id}">${ic('printer')}พิมพ์แบบตรวจสอบ</a></div></div>
      <div class="grid side">
        <div class="stack">
          <div class="card card-pad"><div class="profile-head"><div class="avatar">${esc(initials(x.nameTh))}</div><div>
            <h1 style="font-size:21px">${esc(lecturerName(x, true))}</h1><div class="muted">${esc(x.nameEn || '')}${x.affiliation ? ' · ' + esc(x.affiliation) : ''}</div>
            <div class="tag-list" style="margin-top:6px">${chip(x.role || 'ผู้ทรงคุณวุฒิภายนอก', 'primary')}${chip('สอบ' + (EXAM_LEVELS[x.examLevel] || ''), 'neutral')}${chip(e.std.label, 'accent')}${x.programId ? chip(programName(x.programId), 'neutral') : ''}</div></div></div></div>
          <div class="card"><div class="verdict tone-${m.tone}"><div class="verdict-ico">${ic(m.icon)}</div><div>
            <h3>${e.status === 'pass' ? 'ผ่านคุณสมบัติ' : e.status === 'pending' ? 'คุณวุฒิผ่าน — รอยืนยันผลงาน' : 'ไม่ผ่านคุณสมบัติ'} ตาม${esc(e.std.label)} (${esc(EXAM_LEVELS[e.level])})</h3>
            <p>คุณวุฒิ: ${e.degreeOk ? 'ผ่าน' : 'ไม่ผ่าน'} (${esc(DEGREE_LEVELS[x.degreeLevel] || '—')}${x.position ? ', ' + esc(x.position) : ''}) · ผลงาน: ${esc(e.progress)}</p></div></div></div>
          <div class="card"><div class="card-head"><h2>${ic('scale')} ผลการตรวจเทียบเกณฑ์ทุกปี</h2><span class="muted small">★ เกณฑ์ที่หลักสูตรใช้</span></div>${externalMatrix(x)}</div>
          <div class="card"><div class="card-head"><h2>${ic('doc')} ผลงานที่ตรวจพบ (${pubs.length}) — นานาชาติ ${e.ver.intl} · ชาติ ${e.ver.nat} · ไม่นับ ${e.ver.other}</h2>${edit ? `<button class="btn primary sm" data-action="add-pub" data-x="${x.id}">${ic('plus')}บันทึกผลงาน</button>` : ''}</div>
            ${pubs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>ผลงาน</th><th>ปี</th><th>ฐานข้อมูล</th><th>การยืนยัน</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
              : emptyState('search', 'ยังไม่ได้บันทึกผลงาน', 'ใช้ลิงก์ "ค้นหาชื่อในฐานข้อมูล" ด้านขวา แล้วบันทึกผลงานที่พบทีละรายการ')}</div>
          ${edit ? `<div class="card"><div class="card-head"><h2>${ic('shield')} บันทึกผลการตรวจ</h2>${x.checkedAt ? `<span class="muted small">ล่าสุด ${fmtDate(x.checkedAt)} โดย ${esc(x.checkedBy)}</span>` : ''}</div>
            <form class="card-body stack" id="externalCheckForm" data-id="${x.id}" style="gap:10px"><label class="field"><span>ความเห็นผู้ตรวจ</span><textarea name="checkNote" rows="2">${esc(x.checkNote)}</textarea></label>
            <div><button class="btn primary" type="submit">${ic('check')}บันทึกผลการตรวจ (${e.status === 'pass' ? 'ผ่าน' : e.status === 'pending' ? 'รอยืนยัน' : 'ไม่ผ่าน'})</button></div></form></div>` : ''}
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><h3>${ic('search')} ค้นหาชื่อในฐานข้อมูล</h3></div><div class="card-body">
            <p class="muted small" style="margin-top:0">ค้นชื่อผู้แต่ง → ตรวจว่าวารสารอยู่ในฐานตามประกาศ ก.พ.อ. 2562 → บันทึกผลงาน${x.nameEn ? '' : '<br><b style="color:var(--warning)">ควรเพิ่มชื่อภาษาอังกฤษเพื่อค้น Scopus/WoS</b>'}</p>
            <div class="stack" style="gap:8px">${links.map((l) => `<a class="db-link" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="db-badge tone-primary">${esc(l.k)}</span><span style="min-width:0"><span class="t">${esc(l.label)}</span><span class="h" style="display:block">${esc(l.hint)}</span></span><span style="margin-left:auto" class="muted">${ic('external')}</span></a>`).join('')}</div></div></div>
          <div class="card card-pad"><dl class="kv"><dt>วุฒิการศึกษา</dt><dd>${esc(DEGREE_LEVELS[x.degreeLevel] || '—')}${x.degreeName ? '<br>' + esc(x.degreeName) : ''}</dd><dt>ตำแหน่ง</dt><dd>${esc(x.position || '—')}</dd>
            <dt>ประสบการณ์วิจัย</dt><dd>${x.researchExp ? 'มี' : '—'}</dd><dt>Scopus ID</dt><dd>${esc(x.scopusId || '—')}</dd><dt>ORCID</dt><dd>${esc(x.orcid || '—')}</dd></dl></div>
        </div>
      </div>`;
  }

  function renderExternalReport(id) {
    const x = byId(scopeExternals(), id);
    if (!x) return emptyState('user', 'ไม่พบข้อมูล', '', '<a class="btn" href="#/externals">กลับ</a>');
    const e = evalExternal(x);
    const pubs = (x.pubs || []).slice().sort((a, b) => (toBE(b.year) || 0) - (toBE(a.year) || 0));
    return `${reportBar('#/external/' + x.id)}<div class="card card-pad">
      ${reportHeader('แบบตรวจสอบคุณสมบัติผู้ทรงคุณวุฒิภายนอก', lecturerName(x, true), true)}
      <dl class="kv"><dt>ชื่อ - สกุล</dt><dd>${esc(lecturerName(x, true))}${x.nameEn ? ' (' + esc(x.nameEn) + ')' : ''}</dd><dt>หน่วยงาน</dt><dd>${esc(x.affiliation || '—')}</dd>
        <dt>บทบาทที่เชิญ</dt><dd>${esc(x.role || '—')}${x.programId ? ' · ' + esc(programName(x.programId)) : ''} · ระดับ${esc(EXAM_LEVELS[x.examLevel] || '')}</dd>
        <dt>วุฒิการศึกษา</dt><dd>${esc(DEGREE_LEVELS[x.degreeLevel] || '—')} ${esc(x.degreeName || '')}</dd>
        <dt>ผลการตรวจ</dt><dd><b>${e.status === 'pass' ? 'ผ่านคุณสมบัติ' : e.status === 'pending' ? 'รอยืนยันผลงาน' : 'ไม่ผ่านคุณสมบัติ'}</b> ตาม${esc(e.std.label)} — ${esc(e.progress)}</dd>
        ${x.checkNote ? `<dt>ความเห็นผู้ตรวจ</dt><dd>${esc(x.checkNote)}</dd>` : ''}</dl>
      <h3 class="mt" style="font-size:16px">ผลการตรวจเทียบเกณฑ์</h3>${externalMatrix(x)}
      <h3 class="mt" style="font-size:16px">รายการผลงานที่ตรวจพบในฐานข้อมูล</h3>
      ${pubs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>ผลงาน</th><th>ปี</th><th>ฐานข้อมูล</th><th>ระดับ</th><th>ยืนยัน</th></tr></thead><tbody>${pubs.map((p, i) => { const c = catOf(p.category); return `<tr><td>${i + 1}</td><td>${esc(p.title)}<div class="cell-sub">${esc(p.journal || '')}</div></td><td>${esc(p.year || '')}</td><td>${esc(c.short)} ${esc(p.quartile || '')}</td><td>${c.kpa === 'intl' ? 'นานาชาติ' : c.kpa === 'nat' ? 'ชาติ' : 'ไม่นับ'}</td><td>${p.verified ? '✓' : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">ไม่มีผลงาน</p>'}
      ${signBlock(x.checkedBy || 'ผู้ตรวจสอบ', 'ประธานหลักสูตร / ผู้อำนวยการ')}</div>`;
  }

  function guideExternal() {
    const keys = Object.keys(C.EXTERNAL_STANDARDS);
    const table = (level) => `<div class="card mb"><div class="card-head"><h2>${ic('users')} คุณสมบัติผู้ทรงคุณวุฒิภายนอก — ${EXAM_LEVELS[level]}</h2></div><div class="table-wrap"><table class="table">
      <thead><tr><th>คุณสมบัติ</th>${keys.map((k) => `<th>${esc(C.EXTERNAL_STANDARDS[k].label)}</th>`).join('')}</tr></thead><tbody>
      <tr><td class="cell-title">คุณวุฒิ</td>${keys.map((k) => `<td>${esc(C.EXTERNAL_STANDARDS[k].degree)}</td>`).join('')}</tr>
      <tr><td class="cell-title">ผลงานทางวิชาการ</td>${keys.map((k) => `<td>${esc(C.EXTERNAL_STANDARDS[k][level].text)}</td>`).join('')}</tr></tbody></table></div></div>`;
    return `${table('phd')}${table('master')}
      <div class="card card-pad small muted">การนับในระบบ: <b>ระดับนานาชาติ</b> = Scopus, WoS (SCIE/SSCI/AHCI), PubMed, ERIC, MathSciNet, JSTOR, Project MUSE · <b>ระดับชาติ</b> = TCI กลุ่ม 1–2 · <b>ฐานข้อมูลที่ยอมรับ</b> = ระดับชาติ + นานาชาติ ตามประกาศ ก.พ.อ. พ.ศ. 2562 (<a href="${esc(C.KPA_2562.source)}" target="_blank" rel="noopener">ดูประกาศ</a>) · นับเฉพาะผลงานที่ผู้ตรวจ "ยืนยันแล้ว"</div>`;
  }

  // ================= Pages: Guide =================
  function renderGuide() {
    const tab = view.tabs.guide || 'manual';
    const T = (k, label) => `<button class="${tab === k ? 'active' : ''}" data-action="tab" data-tab="guide" data-value="${k}">${label}</button>`;
    let body = '';
    if (tab === 'manual') body = guideManual();
    if (tab === 'weights') body = guideWeights();
    if (tab === 'kpa') body = guideKpa();
    if (tab === 'roles') body = guideRoles();
    if (tab === 'external') body = guideExternal();
    if (tab === 'faq') body = `<div class="faq">${C.FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
    return `<div class="page-head"><div><h1>คู่มือ & เกณฑ์</h1><p>ขั้นตอนการใช้งาน เกณฑ์ ก.พ.อ. 2562 ค่าน้ำหนักคะแนน และคำถามที่พบบ่อย</p></div></div>
      <div class="tabs">${T('manual', 'ขั้นตอนการใช้งาน')}${T('weights', 'ตารางค่าน้ำหนักคะแนน')}${T('kpa', 'เกณฑ์วารสาร ก.พ.อ. 2562')}${T('external', 'เกณฑ์ผู้ทรงคุณวุฒิภายนอก')}${T('roles', 'สิทธิ์ผู้ใช้งาน')}${T('faq', 'คำถามที่พบบ่อย (FAQ)')}</div>${body}`;
  }

  function guideManual() {
    const steps = [
      ['grid', 'แดชบอร์ดและการแจ้งเตือนอัจฉริยะ', ['การ์ดสรุป: จำนวนหลักสูตร อาจารย์ ผลงานที่นับได้ใน 5 ปี และผลงานรอตรวจ', `แจ้งเตือนสีแดง: อาจารย์ไม่มีผลงานใน ${st().windowYears} ปี / ผลงานยังไม่ถึงเกณฑ์`, `แจ้งเตือนสีส้ม: ผลงานใกล้หมดอายุ (ปี ${windowStart()}) จะไม่ถูกนับในปีประเมินถัดไป`, 'กราฟวงกลมแสดงสัดส่วนฐานข้อมูล และกราฟแท่งแสดงค่าน้ำหนักเฉลี่ยรายหลักสูตร']],
      ['doc', 'เพิ่ม แก้ไข ลบ ผลงานวิชาการ', ['ไปที่เมนู ผลงานวิชาการ > เพิ่มผลงาน', 'เลือกอาจารย์ ประเภทผลงาน และแหล่งเผยแพร่ (ระบบแสดงค่าน้ำหนักและระดับตามประกาศ ก.พ.อ. ทันที)', 'กรอกปีที่ตีพิมพ์ (พ.ศ./ค.ศ.) — หากเกิน 5 ปี ระบบจะแจ้งเตือนว่าไม่นำมาคิดคะแนน', 'ใส่ลิงก์หลักฐาน/DOI เพื่อให้ผู้ตรวจตรวจสอบได้รวดเร็ว', 'ผลงานใหม่มีสถานะ "รอตรวจสอบ" · อาจารย์แก้ไข/ลบได้จนกว่าจะได้รับการรับรอง']],
      ['shield', 'การตรวจรับรองผลงาน (Verification Workflow)', ['ประธานหลักสูตร/Admin เปิดเมนู ตรวจรับรองผลงาน', 'กดปุ่ม ตรวจ → ใช้ลิงก์ค้นชื่อผู้แต่งใน Scopus, ThaiJO/TCI, WoS, PubMed, ERIC และตรวจ Quartile ที่ SJR', 'ยืนยัน/แก้ไขประเภทฐานข้อมูลและ Quartile ให้ถูกต้อง', 'กด รับรองผลงาน (นับคะแนนทันที) หรือ ส่งกลับแก้ไข พร้อมเหตุผล — อาจารย์จะเห็นเหตุผลและแก้ไขแล้วส่งตรวจใหม่']],
      ['users', 'การจัดการข้อมูลอาจารย์และหลักสูตร', ['Admin เพิ่มหลักสูตรและระบุระดับ (ตรี/โท/เอก) — ใช้กำหนดเกณฑ์และค่าเป้าหมาย', 'เพิ่มอาจารย์ ระบุประเภท (ผู้รับผิดชอบหลักสูตร/ประจำหลักสูตร/ประจำ/พิเศษ) และชื่อภาษาอังกฤษเพื่อใช้ค้นฐานข้อมูลสากล', 'หน้าโปรไฟล์อาจารย์แสดงผลการตรวจคุณสมบัติ ผลงานรายปี และลิงก์ค้นหาในฐานข้อมูล', 'สร้างบัญชีผู้ใช้ให้ประธานหลักสูตร (ผูกหลักสูตร) และอาจารย์ (ผูกรายชื่ออาจารย์) ที่ จัดการระบบ > ผู้ใช้งาน']],
      ['chart', 'การประเมินคุณภาพหลักสูตรและออกรายงาน PDF', ['เมนู ประเมินคุณภาพหลักสูตร แสดงร้อยละผลรวมถ่วงน้ำหนักและคะแนนเต็ม 5 ของทุกหลักสูตร', 'สลับดูผลงานเฉพาะปีประเมิน (ตามคู่มือ QA) หรือสะสม 5 ปี', 'เมนู รายงาน > เลือกรายงานหลักสูตร/รายบุคคล/ภาพรวม > พิมพ์ / บันทึก PDF', 'ในหน้าต่างพิมพ์ เลือกปลายทาง "บันทึกเป็น PDF" (Save as PDF)']],
    ];
    return `<div class="stack manual">${steps.map(([icon, title, items], i) => `<div class="card card-pad"><h3 style="margin-top:0;display:flex;gap:10px;align-items:center"><span class="stat-ico tone-primary" style="width:34px;height:34px">${ic(icon)}</span>${i + 1}. ${esc(title)}</h3><ol>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>`).join('')}</div>`;
  }

  function guideWeights() {
    const W = st().weights;
    const rows = [];
    C.CATEGORIES.forEach((c) => {
      if (c.quartile) C.QUARTILES.forEach((q) => rows.push([`${c.label} — ${q}`, W[c.id + ':' + q], c.kpa]));
      else rows.push([c.label, W[c.id], c.kpa]);
    });
    rows.sort((a, b) => b[1] - a[1]);
    const tone = (w) => (w >= 1 ? 'success' : w >= 0.6 ? 'info' : w > 0 ? 'warning' : 'danger');
    return `<div class="card"><div class="card-head"><h2>${ic('scale')} ตารางค่าน้ำหนักผลงานวิชาการ</h2><span class="muted small">ค่าปัจจุบันของระบบ${isAdmin() ? ' · <a href="#/admin" data-action="tab" data-tab="admin" data-value="settings">ปรับค่า</a>' : ''}</span></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>ประเภทผลงาน / แหล่งเผยแพร่</th><th>ระดับตามประกาศ ก.พ.อ. 2562</th><th class="num">ค่าน้ำหนัก</th></tr></thead><tbody>
      ${rows.map(([label, w, kpa]) => `<tr><td>${esc(label)}</td><td>${kpa === 'intl' ? chip('นานาชาติ', 'success') : kpa === 'nat' ? chip('ชาติ', 'info') : '<span class="muted">—</span>'}</td><td class="num"><span class="weight-pill tone-${tone(Number(w))}">${fmt(w)}</span></td></tr>`).join('')}
      </tbody></table></div>
      <div class="card-body small muted">ค่าเริ่มต้นอ้างอิงคู่มือการประกันคุณภาพการศึกษาภายใน ระดับหลักสูตร (สป.อว./สกอ.) ซึ่งให้ค่าน้ำหนักวารสารในฐาน Scopus/WoS ทุก Quartile เท่ากับ 1.00 — สถาบันสามารถกำหนดค่าน้ำหนักแยกตาม Q1–Q4 เพื่อการบริหารภายในได้ที่ จัดการระบบ > ตั้งค่าเกณฑ์</div></div>`;
  }

  function guideKpa() {
    const K = C.KPA_2562;
    return `<div class="grid two">
      <div class="card"><div class="card-head"><h2>${ic('book')} วารสารทางวิชาการระดับชาติ</h2></div><div class="card-body"><ul class="clean">${K.national.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <div class="card"><div class="card-head"><h2>${ic('book')} วารสารทางวิชาการระดับนานาชาติ</h2></div><div class="card-body"><p style="margin-top:0">อยู่ในฐานข้อมูลที่ ก.พ.อ. กำหนด:</p><div class="tag-list">${K.international.map((x) => chip(x, 'success')).join('')}</div></div></div>
    </div>
    <div class="card mt"><div class="card-head"><h2>${ic('alert')} ข้อควรระวังในการตรวจสอบ</h2></div><div class="card-body"><ul class="clean">${K.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="small muted">ที่มา: ${esc(K.title)} — <a href="${esc(K.source)}" target="_blank" rel="noopener">ราชกิจจานุเบกษา ${ic('external')}</a> (สรุปสาระสำคัญเพื่อการใช้งานในระบบ โปรดยึดประกาศฉบับเต็มเป็นหลัก)</p></div></div>`;
  }

  function guideRoles() {
    const roles = ['admin', 'chair', 'lecturer', 'executive'];
    return `<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>สิทธิ์การใช้งาน</th>${roles.map((r) => `<th>${chip(C.USER_ROLES[r].label, C.USER_ROLES[r].tone)}</th>`).join('')}</tr></thead><tbody>
      ${C.PERMISSIONS.map((row) => `<tr><td class="cell-title">${esc(row[0])}</td>${row.slice(1).map((v) => `<td>${v === '✓' ? `<span style="color:var(--success)">${ic('check')}</span>` : v === '—' ? '<span class="muted">—</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></div>`;
  }

  // ================= Pages: Admin =================
  function renderAdmin() {
    const tab = view.tabs.admin || 'users';
    const T = (k, label) => `<button class="${tab === k ? 'active' : ''}" data-action="tab" data-tab="admin" data-value="${k}">${label}</button>`;
    let body = '';
    if (tab === 'users') body = adminUsers();
    if (tab === 'settings') body = adminSettings();
    if (tab === 'data') body = adminData();
    if (tab === 'connect') body = adminConnect();
    return `<div class="page-head"><div><h1>จัดการระบบ</h1><p>ผู้ใช้งาน เกณฑ์การประเมิน การสำรองข้อมูล และการเชื่อมต่อ Google Sheets</p></div></div>
      <div class="tabs">${T('users', 'ผู้ใช้งาน')}${T('settings', 'ตั้งค่าเกณฑ์')}${T('data', 'ข้อมูล')}${T('connect', 'การเชื่อมต่อ')}</div>${body}`;
  }

  function adminUsers() {
    const rows = S.data.users.map((u) => `<tr><td><div class="person-cell"><div class="avatar sm">${esc(initials(u.displayName))}</div><div><div class="cell-title">${esc(u.displayName)}</div><div class="cell-sub">${esc(u.username)}</div></div></div></td>
      <td>${chip(C.USER_ROLES[u.role].label, C.USER_ROLES[u.role].tone)}</td>
      <td>${u.role === 'chair' ? esc(programName(u.programId)) : u.role === 'lecturer' ? esc(lecturerName(byId(S.data.lecturers, u.lecturerId))) : '<span class="muted">ทั้งวิทยาลัย</span>'}</td>
      <td class="actions"><button class="btn sm" data-action="edit-user" data-id="${u.id}">${ic('edit')}</button>${u.id !== S.user.id ? `<button class="btn sm danger" data-action="delete-user" data-id="${u.id}">${ic('trash')}</button>` : ''}</td></tr>`).join('');
    return `<div class="card"><div class="card-head"><h2>${ic('users')} บัญชีผู้ใช้งาน (${S.data.users.length})</h2><button class="btn primary sm" data-action="add-user">${ic('plus')}เพิ่มผู้ใช้</button></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>ผู้ใช้</th><th>บทบาท</th><th>ขอบเขตข้อมูล</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function openUserForm(u) {
    const editing = !!u;
    u = u || { role: 'lecturer' };
    const form = openModal({
      title: editing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน',
      body: `<div class="form-grid">
        <label class="field"><span>ชื่อผู้ใช้ (Username) <em>*</em></span><input name="username" required value="${esc(u.username)}" ${editing ? 'readonly' : ''} pattern="[A-Za-z0-9._-]{3,}" title="อย่างน้อย 3 ตัว (a-z, 0-9, . _ -)"></label>
        <label class="field"><span>ชื่อที่แสดง <em>*</em></span><input name="displayName" required value="${esc(u.displayName)}"></label>
        <label class="field"><span>บทบาท</span><select name="role" data-role-select>${Object.entries(C.USER_ROLES).map(([k, v]) => opt(k, v.label, u.role)).join('')}</select></label>
        <label class="field"><span>รหัสผ่าน ${editing ? '<small>(เว้นว่างหากไม่เปลี่ยน)</small>' : '<em>*</em>'}</span><input name="password" type="password" minlength="6" ${editing ? '' : 'required'} autocomplete="new-password"></label>
        <label class="field full" data-for="chair"><span>หลักสูตรที่ดูแล</span><select name="programId"><option value="">— เลือก —</option>${S.data.programs.map((p) => opt(p.id, p.name, u.programId)).join('')}</select></label>
        <label class="field full" data-for="lecturer"><span>ผูกกับรายชื่ออาจารย์</span><select name="lecturerId"><option value="">— เลือก —</option>${S.data.lecturers.map((l) => opt(l.id, lecturerName(l) + ' · ' + programName(l.programId), u.lecturerId)).join('')}</select></label>
      </div>`,
      onSubmit: async (v) => {
        const username = v.username.trim().toLowerCase();
        if (!editing && S.data.users.some((x) => x.username === username)) throw new Error('ชื่อผู้ใช้นี้มีอยู่แล้ว');
        if (v.role === 'chair' && !v.programId) throw new Error('กรุณาเลือกหลักสูตรของประธานหลักสูตร');
        if (v.role === 'lecturer' && !v.lecturerId) throw new Error('กรุณาผูกบัญชีกับรายชื่ออาจารย์');
        const rec = Object.assign({}, u, { id: u.id || uid('u'), username, displayName: v.displayName.trim(), role: v.role,
          programId: v.role === 'chair' ? v.programId : '', lecturerId: v.role === 'lecturer' ? v.lecturerId : '' });
        if (v.password) rec.passwordHash = await hashPw(username, v.password);
        await upsert('users', rec);
        if (rec.id === S.user.id) { S.user = rec; renderUserChip(); }
        toast('บันทึกผู้ใช้งานแล้ว');
        render();
      },
    });
    const sync = () => { const r = form.role.value; $$('[data-for]', form).forEach((el) => { el.hidden = el.dataset.for !== r; }); };
    form.role.addEventListener('change', sync); sync();
  }

  function adminSettings() {
    const s = st();
    const W = s.weights;
    const wRows = C.CATEGORIES.map((c) => {
      const base = `<tr><td>${esc(c.label)}</td><td><input class="input" style="width:90px;height:34px" type="number" step="0.05" min="0" max="2" name="w:${c.id}" value="${W[c.id]}"></td><td>${c.quartile ? C.QUARTILES.map((q) => `<label class="small" style="display:inline-flex;gap:4px;align-items:center;margin-right:8px">${q}<input class="input" style="width:72px;height:34px" type="number" step="0.05" min="0" max="2" name="w:${c.id}:${q}" value="${W[c.id + ':' + q]}"></label>`).join('') : '<span class="muted">—</span>'}</td></tr>`;
      return base;
    }).join('');
    const R = s.requirements;
    const reqRow = (k, label) => `<tr><td>${label}</td><td><input class="input" style="width:80px;height:34px" type="number" min="0" name="r:${k}:minWorks" value="${R[k].minWorks}"></td><td><input class="input" style="width:80px;height:34px" type="number" min="0" name="r:${k}:minResearch" value="${R[k].minResearch || 0}"></td></tr>`;
    return `<form id="settingsForm" class="stack">
      <div class="card"><div class="card-head"><h2>${ic('gear')} ข้อมูลทั่วไปและรอบประเมิน</h2></div><div class="card-body"><div class="form-grid">
        <label class="field"><span>ชื่อวิทยาลัย / หน่วยงาน</span><input name="collegeName" value="${esc(s.collegeName)}"></label>
        <label class="field"><span>มหาวิทยาลัย</span><input name="university" value="${esc(s.university)}"></label>
        <label class="field"><span>ปีประเมิน (พ.ศ.)</span><input name="refYear" type="number" min="2500" max="2700" value="${s.refYear}"></label>
        <label class="field"><span>ช่วงนับผลงานย้อนหลัง (ปี)</span><input name="windowYears" type="number" min="1" max="20" value="${s.windowYears}"></label>
        <label class="field"><span>ร้อยละเป้าหมาย ป.ตรี (= 5 คะแนน)</span><input name="t:bachelor" type="number" min="1" value="${s.targets.bachelor}"></label>
        <label class="field"><span>ร้อยละเป้าหมาย ป.โท</span><input name="t:master" type="number" min="1" value="${s.targets.master}"></label>
        <label class="field"><span>ร้อยละเป้าหมาย ป.เอก</span><input name="t:phd" type="number" min="1" value="${s.targets.phd}"></label>
      </div></div></div>
      <div class="card"><div class="card-head"><h2>${ic('users')} เกณฑ์ผลงานขั้นต่ำของอาจารย์ (ในช่วงนับผลงาน)</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>กลุ่ม</th><th>จำนวนผลงานขั้นต่ำ</th><th>เป็นงานวิจัยอย่างน้อย</th></tr></thead><tbody>
        ${reqRow('bachelor', 'อาจารย์ในหลักสูตรปริญญาตรี')}${reqRow('master', 'อาจารย์ในหลักสูตรปริญญาโท')}${reqRow('phd', 'อาจารย์ในหลักสูตรปริญญาเอก')}${reqRow('adjunct', 'อาจารย์พิเศษ (นับเฉพาะวารสารตามประกาศ ก.พ.อ.)')}
      </tbody></table></div></div>
      <div class="card"><div class="card-head"><h2>${ic('chart')} ค่าน้ำหนักผลงาน</h2><button type="button" class="btn sm" data-action="reset-weights">${ic('refresh')}คืนค่าเริ่มต้น</button></div><div class="table-wrap"><table class="table"><thead><tr><th>ประเภท</th><th>ค่าน้ำหนัก</th><th>แยกตาม Quartile</th></tr></thead><tbody>${wRows}</tbody></table></div></div>
      <div class="btn-row"><button class="btn primary" type="submit">${ic('check')}บันทึกการตั้งค่า</button></div></form>`;
  }

  function adminData() {
    const d = S.data;
    return `<div class="grid two">
      <div class="card"><div class="card-head"><h2>${ic('download')} สำรองข้อมูล</h2></div><div class="card-body"><p class="muted" style="margin-top:0">ดาวน์โหลดข้อมูลทั้งหมด (หลักสูตร ${d.programs.length} · อาจารย์ ${d.lecturers.length} · ผลงาน ${d.works.length} · บุคคลภายนอก ${d.externals.length} · ผู้ใช้ ${d.users.length}) เป็นไฟล์ JSON</p>
        <div class="btn-row"><button class="btn primary" data-action="backup">${ic('download')}ดาวน์โหลดไฟล์สำรอง</button><button class="btn" data-action="export-csv">${ic('download')}ผลงาน (CSV)</button></div></div></div>
      <div class="card"><div class="card-head"><h2>${ic('upload')} กู้คืนข้อมูล</h2></div><div class="card-body"><p class="muted" style="margin-top:0">นำเข้าไฟล์ JSON ที่สำรองไว้ — ข้อมูลปัจจุบันจะถูกแทนที่ทั้งหมด</p>
        <label class="btn">${ic('upload')}เลือกไฟล์ .json<input type="file" accept="application/json,.json" data-action="restore" hidden></label></div></div>
      <div class="card"><div class="card-head"><h2>${ic('refresh')} ข้อมูลเริ่มต้น</h2></div><div class="card-body"><p class="muted" style="margin-top:0">โหลดข้อมูลตัวอย่าง (หลักสูตร อาจารย์ ผลงาน และบัญชีทดลองทุกบทบาท) เพื่อทดลองระบบ หรือเริ่มระบบใหม่โดยเหลือเฉพาะบัญชีผู้ดูแลระบบ</p>
        <div class="btn-row"><button class="btn" data-action="load-sample">โหลดข้อมูลตัวอย่าง</button><button class="btn danger" data-action="clear-data">${ic('trash')}ล้างข้อมูลทั้งหมด</button></div></div></div>
    </div>`;
  }

  function adminConnect() {
    const url = apiUrl();
    return `<div class="card"><div class="card-head"><h2>${ic('link')} เชื่อมต่อฐานข้อมูล Google Sheets</h2>${S.remote ? chip('เชื่อมต่อแล้ว', 'success', true) : chip('เก็บในเครื่องนี้', 'neutral', true)}</div>
      <div class="card-body">
        <ol class="small" style="margin-top:0;padding-left:20px">
          <li>สร้าง Google Sheet ใหม่ > ส่วนขยาย > Apps Script แล้ววางโค้ดจากไฟล์ <code>apps-script/Code.gs</code> ใน repository</li>
          <li>รันฟังก์ชัน <code>setup</code> หนึ่งครั้ง (สร้างชีตและบัญชี admin / รหัสผ่าน admin1234)</li>
          <li>ทำให้ใช้งานได้ (Deploy) > เว็บแอป > ดำเนินการในฐานะ: ฉัน · ผู้มีสิทธิ์เข้าถึง: ทุกคน แล้วคัดลอก URL มาวางด้านล่าง</li>
          <li>(ไม่บังคับ) กด "ส่งข้อมูลปัจจุบันขึ้น Sheets" เพื่อย้ายข้อมูลจากเครื่องนี้</li></ol>
        <form id="apiForm" class="stack" style="gap:10px">
          <label class="field"><span>URL ของ Apps Script Web App</span><input name="apiUrl" type="url" value="${esc(url)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
          <div class="btn-row"><button class="btn primary" type="submit">${ic('check')}บันทึกและเชื่อมต่อ</button>${url ? `<button type="button" class="btn danger" data-action="disconnect">ยกเลิกการเชื่อมต่อ</button>` : ''}${S.remote ? `<button type="button" class="btn" data-action="push-remote">${ic('upload')}ส่งข้อมูลจากไฟล์สำรองขึ้น Sheets</button>` : ''}</div>
        </form>
        <p class="small muted">เมื่อเชื่อมต่อแล้ว ระบบจะออกจากระบบเพื่อให้เข้าสู่ระบบด้วยบัญชีใน Google Sheets · สิทธิ์การเข้าถึงข้อมูลถูกตรวจสอบที่ฝั่งเซิร์ฟเวอร์</p>
      </div></div>`;
  }

  // ================= Sample data =================
  async function sampleData() {
    const y = nowBE();
    const P = [
      { id: 'p_bud', name: 'พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา', degree: 'พธ.บ.', level: 'bachelor' },
      { id: 'p_soc', name: 'ครุศาสตรบัณฑิต สาขาวิชาการสอนสังคมศึกษา', degree: 'ค.บ.', level: 'bachelor' },
      { id: 'p_pol', name: 'รัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์', degree: 'ร.บ.', level: 'bachelor' },
      { id: 'p_eng', name: 'ศิลปศาสตรบัณฑิต สาขาวิชาภาษาอังกฤษ', degree: 'ศศ.บ.', level: 'bachelor' },
      { id: 'p_mpa', name: 'รัฐศาสตรมหาบัณฑิต สาขาวิชารัฐศาสตร์', degree: 'ร.ม.', level: 'master' },
    ];
    const names = [
      ['พระมหา', 'สมชาย ธมฺมวโร', 'Somchai Dhammavaro', 'p_bud', 'ผู้ช่วยศาสตราจารย์'], ['พระครู', 'วิสุทธิ์ ปญฺญาธโร', 'Wisut Panyadharo', 'p_bud', ''],
      ['ดร.', 'สุนทร แก้วมณี', 'Sunthon Kaewmanee', 'p_bud', ''], ['นางสาว', 'อรุณี ศรีสุข', 'Arunee Srisuk', 'p_bud', ''], ['พระ', 'อนุชา สุจิตฺโต', 'Anucha Sucitto', 'p_bud', ''],
      ['ดร.', 'ประเสริฐ ทองดี', 'Prasert Thongdee', 'p_soc', 'ผู้ช่วยศาสตราจารย์'], ['นาง', 'มาลัย ใจงาม', 'Malai Jaingam', 'p_soc', ''], ['พระมหา', 'วีระ วีรธมฺโม', 'Weera Weeradhammo', 'p_soc', ''],
      ['ดร.', 'ชัยวัฒน์ พรหมมา', 'Chaiwat Phromma', 'p_pol', 'รองศาสตราจารย์'], ['นาย', 'ธนพล บุญมา', 'Thanaphon Boonma', 'p_pol', ''], ['พระครู', 'สังฆรักษ์ อุตฺตโม', 'Sangharak Uttamo', 'p_pol', ''],
      ['ดร.', 'จันทร์เพ็ญ วงศ์ไทย', 'Chanphen Wongthai', 'p_eng', ''], ['Mr.', 'David Miller', 'David Miller', 'p_eng', ''],
      ['พระมหา ดร.', 'ปิยะ ปิยวณฺโณ', 'Piya Piyavanno', 'p_mpa', 'ผู้ช่วยศาสตราจารย์'], ['ดร.', 'กิตติ ศักดิ์สูง', 'Kitti Saksung', 'p_mpa', 'รองศาสตราจารย์'], ['ดร.', 'วรรณา คำแสง', 'Wanna Khamsaeng', 'p_mpa', ''],
    ];
    const L = names.map((n, i) => ({ id: 'l_' + (i + 1), prefix: n[0], nameTh: n[1], nameEn: n[2], programId: n[3], position: n[4], active: true,
      type: i === 4 || i === 12 ? 'adjunct' : i % 5 === 3 ? 'program' : 'responsible', degree: n[0].includes('ดร') ? 'ปร.ด.' : 'พธ.ม.', email: '' }));
    const J = {
      tci1: ['วารสารมหาจุฬาวิชาการ', 'วารสารสังคมศาสตร์และมานุษยวิทยาเชิงพุทธ', 'วารสาร มจร สังคมศาสตร์ปริทรรศน์'],
      tci2: ['วารสารพุทธศาสตร์ศึกษา', 'วารสารบัณฑิตศึกษามหาจุฬาขอนแก่น', 'วารสารสหวิทยาการวิจัยและวิชาการ'],
      scopus: ['Journal of Buddhist Education and Research', 'Asian Political Science Review', 'Journal of Language Teaching and Research'],
      proc_nat: ['การประชุมวิชาการระดับชาติ มจร ครั้งที่ 5'], proc_intl: ['International Buddhist Research Seminar'],
    };
    const topics = ['การประยุกต์หลักพุทธธรรมในการพัฒนาคุณภาพชีวิตผู้สูงอายุ', 'การบริหารจัดการวัดเพื่อการพัฒนาชุมชนจังหวัดนครพนม', 'รูปแบบการจัดการเรียนรู้สังคมศึกษาตามแนวพุทธ',
      'ธรรมาภิบาลในองค์กรปกครองส่วนท้องถิ่นลุ่มน้ำโขง', 'การมีส่วนร่วมทางการเมืองของประชาชนในภาคตะวันออกเฉียงเหนือ', 'English Communication Skills for Buddhist Monks',
      'บทบาทพระสงฆ์ในการส่งเสริมวัฒนธรรมไทย-ลาว', 'การพัฒนาภาวะผู้นำเชิงพุทธของผู้บริหารสถานศึกษา', 'Mindfulness-Based Learning in Thai Higher Education', 'ภูมิปัญญาท้องถิ่นกับการท่องเที่ยวเชิงพุทธ'];
    const cats = ['tci1', 'tci2', 'tci2', 'scopus', 'proc_nat', 'tci1', 'proc_intl', 'tci2', 'book', 'tci3'];
    const W = [];
    let k = 0;
    L.forEach((l, i) => {
      if (i === 7 || i === 10) return; // อาจารย์ที่ยังไม่มีผลงาน (เพื่อทดสอบการแจ้งเตือน)
      const count = 1 + ((i * 7) % 4);
      for (let j = 0; j < count; j++) {
        const cat = cats[(i + j * 3) % cats.length];
        const year = y - ((i + j * 2) % 7);
        const status = j === count - 1 && i % 3 === 0 ? 'pending' : (i + j) % 11 === 5 ? 'rejected' : 'verified';
        const jl = J[cat] || [''];
        W.push({ id: 'w_' + (++k), lecturerId: l.id, title: topics[(i + j * 3) % topics.length] + (j ? ' (ระยะที่ ' + (j + 1) + ')' : ''), type: cat === 'book' ? 'book' : cat.startsWith('proc') ? 'proceeding' : j % 3 === 2 ? 'academic' : 'research',
          authorRole: j % 2 ? 'co' : 'first', category: cat, quartile: cat === 'scopus' ? ['Q2', 'Q3', 'Q4'][i % 3] : '', journal: jl[(i + j) % jl.length], issn: '', year, detail: `ปีที่ ${8 + (j % 4)} ฉบับที่ ${1 + (i % 3)}`,
          doi: '', url: '', note: '', status, createdAt: new Date(Date.now() - (k * 86400000)).toISOString(), createdBy: 'ตัวอย่าง',
          reviewedBy: status === 'pending' ? '' : 'ผู้ดูแลระบบ', reviewedAt: status === 'pending' ? '' : new Date(Date.now() - k * 43200000).toISOString(),
          reviewNote: status === 'rejected' ? 'กรุณาแนบลิงก์หลักฐานและตรวจสอบกลุ่มวารสาร TCI' : '' });
      }
    });
    const U = [
      { id: 'u_admin', username: 'admin', displayName: 'ผู้ดูแลระบบ', role: 'admin', passwordHash: await hashPw('admin', 'admin1234') },
      { id: 'u_chair', username: 'chair', displayName: 'ประธานหลักสูตรพระพุทธศาสนา', role: 'chair', programId: 'p_bud', passwordHash: await hashPw('chair', 'chair1234') },
      { id: 'u_lect', username: 'lecturer', displayName: 'พระมหาสมชาย ธมฺมวโร', role: 'lecturer', lecturerId: 'l_1', passwordHash: await hashPw('lecturer', 'lecturer1234') },
      { id: 'u_exec', username: 'exec', displayName: 'ผู้อำนวยการวิทยาลัย', role: 'executive', passwordHash: await hashPw('exec', 'exec1234') },
    ];
    const pub = (title, category, journal, yr, quartile, verified = true) => ({ id: uid('pub'), title, category, journal, year: yr, quartile: quartile || '', issn: '', url: '', verified });
    const X = [
      { id: 'x_1', prefix: 'ดร.', nameTh: 'สมศักดิ์ วิชาการดี', nameEn: 'Somsak Wichakandee', position: 'รองศาสตราจารย์', affiliation: 'มหาวิทยาลัยตัวอย่าง (ข้อมูลสมมติ)', degreeLevel: 'phd', degreeName: 'Ph.D. (Political Science)',
        role: 'กรรมการสอบวิทยานิพนธ์', programId: 'p_mpa', examLevel: 'master', standard: '2565', researchExp: true,
        pubs: [pub('Local Governance and Buddhist Ethics in the Mekong Region', 'scopus', 'Asian Political Science Review', y - 2, 'Q3'), pub('Civic Participation in Northeastern Thailand', 'scopus', 'Journal of Asian Studies', y - 4, 'Q2'),
          pub('ธรรมาภิบาลกับการบริหารท้องถิ่น', 'tci1', 'วารสารสังคมศาสตร์และมานุษยวิทยาเชิงพุทธ', y - 6), pub('นโยบายสาธารณะเชิงพุทธ', 'tci2', 'วารสารพุทธศาสตร์ศึกษา', y - 8), pub('การเมืองภาคประชาชน', 'tci1', 'วารสารมหาจุฬาวิชาการ', y - 1)] },
      { id: 'x_2', prefix: 'พระมหา', nameTh: 'ตัวอย่าง ปญฺญาวโร', nameEn: 'Tuayang Panyavaro', position: 'ผู้ช่วยศาสตราจารย์', affiliation: 'วิทยาลัยสงฆ์ตัวอย่าง (ข้อมูลสมมติ)', degreeLevel: 'phd', degreeName: 'พธ.ด. (พระพุทธศาสนา)',
        role: 'กรรมการสอบวิทยานิพนธ์', programId: 'p_mpa', examLevel: 'master', standard: '2565',
        pubs: [pub('พุทธวิธีการบริหาร', 'tci2', 'วารสารบัณฑิตศึกษามหาจุฬาขอนแก่น', y - 3), pub('ภาวะผู้นำเชิงพุทธ', 'tci1', 'วารสาร มจร สังคมศาสตร์ปริทรรศน์', y - 5), pub('การพัฒนาชุมชนตามหลักสาราณียธรรม', 'tci3', 'วารสารตัวอย่าง', y - 2), pub('สังคหวัตถุกับการบริการ', 'tci2', 'วารสารพุทธศาสตร์ศึกษา', y - 1, '', false)] },
      { id: 'x_3', prefix: 'นาย', nameTh: 'ทดสอบ ไม่มีปริญญาเอก', nameEn: 'Thodsob Example', position: '', affiliation: 'หน่วยงานตัวอย่าง (ข้อมูลสมมติ)', degreeLevel: 'master', degreeName: 'ร.ม.',
        role: 'ผู้ทรงคุณวุฒิตรวจเครื่องมือวิจัย', programId: '', examLevel: 'master', standard: '2558', researchExp: true,
        pubs: [pub('การบริหารงานบุคคลภาครัฐ', 'tci2', 'วารสารสหวิทยาการวิจัยและวิชาการ', y - 2)] },
    ].map((x) => Object.assign(x, { createdAt: new Date().toISOString(), createdBy: 'ตัวอย่าง', updatedAt: new Date().toISOString() }));
    const settings = Object.assign(defaultSettings(), { demo: true });
    return { programs: P, lecturers: L, works: W, users: U, externals: X, settings };
  }

  // ================= CSV / backup =================
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportCsv() {
    const head = ['ชื่อผลงาน', 'อาจารย์', 'หลักสูตร', 'ประเภท', 'แหล่งเผยแพร่', 'ระดับ ก.พ.อ.', 'Quartile', 'วารสาร', 'ISSN', 'ปี (พ.ศ.)', 'สถานะ', 'ค่าน้ำหนัก', 'นับคะแนน', 'DOI', 'ลิงก์หลักฐาน', 'ผู้ตรวจ', 'วันที่ตรวจ'];
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = scopeWorks().map((w) => { const l = byId(S.data.lecturers, w.lecturerId); const c = catOf(w.category);
      return [w.title, lecturerName(l, true), l ? programName(l.programId) : '', typeOf(w.type).label, c.label, c.kpa === 'intl' ? 'นานาชาติ' : c.kpa === 'nat' ? 'ชาติ' : '', w.quartile, w.journal, w.issn, toBE(w.year), (C.STATUSES[w.status] || {}).label, weightOf(w), isCountable(w) ? 'ใช่' : 'ไม่', w.doi, w.url, w.reviewedBy, w.reviewedAt].map(q).join(','); });
    download(`ผลงานวิชาการ_${st().refYear}.csv`, '﻿' + [head.map(q).join(',')].concat(rows).join('\r\n'), 'text/csv;charset=utf-8');
  }

  // ================= Event handlers =================
  const ACTIONS = {
    'toggle-theme': () => {
      const cur = document.documentElement.dataset.theme;
      const dark = cur === 'dark' || (cur === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      const next = dark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('npc.theme', next); } catch (e) {}
      updateThemeIcon();
    },
    logout: () => { logout(); },
    print: () => window.print(),
    tab: (el) => { view.tabs[el.dataset.tab] = el.dataset.value; if (el.tagName === 'A' && el.getAttribute('href') !== location.hash) return; render(); },
    'filter-works': (el, ev) => { ev.preventDefault(); workFilters().status = el.dataset.status; location.hash = '#/works'; render(); },
    'add-work': (el) => openWorkForm(null, el.dataset.lecturer),
    'edit-work': (el) => openWorkForm(byId(S.data.works, el.dataset.id)),
    'view-work': (el) => { const w = byId(S.data.works, el.dataset.id); hydrateIcons(openModal({ title: 'รายละเอียดผลงาน', wide: true, body: workDetailHtml(w) })); },
    'verify-work': (el) => openVerify(byId(S.data.works, el.dataset.id)),
    'delete-work': async (el) => {
      const w = byId(S.data.works, el.dataset.id);
      if (await confirmBox('ลบผลงาน', `ต้องการลบผลงาน “${esc(w.title)}” ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`, 'ลบผลงาน')) { await remove('works', w.id); toast('ลบผลงานแล้ว'); render(); }
    },
    'add-lecturer': () => openLecturerForm(null),
    'edit-lecturer': (el) => openLecturerForm(byId(S.data.lecturers, el.dataset.id)),
    'delete-lecturer': async (el) => {
      const l = byId(S.data.lecturers, el.dataset.id);
      const n = worksOf(l.id).length;
      if (await confirmBox('ลบข้อมูลอาจารย์', `ต้องการลบ “${esc(lecturerName(l))}”${n ? ` และผลงานที่เกี่ยวข้อง ${n} รายการ` : ''} ใช่หรือไม่? <br><span class="muted small">หากอาจารย์ลาออก แนะนำให้แก้ไขเป็น “ไม่ปฏิบัติงาน” แทนเพื่อเก็บประวัติ</span>`, 'ลบ')) {
        for (const w of worksOf(l.id)) await remove('works', w.id);
        await remove('lecturers', l.id); toast('ลบข้อมูลอาจารย์แล้ว'); location.hash = '#/lecturers'; render();
      }
    },
    'add-external': () => openExternalForm(null),
    'edit-external': (el) => openExternalForm(byId(S.data.externals, el.dataset.id)),
    'delete-external': async (el) => {
      const x = byId(S.data.externals, el.dataset.id);
      if (await confirmBox('ลบรายชื่อ', `ต้องการลบ “${esc(lecturerName(x))}” และผลการตรวจทั้งหมดใช่หรือไม่?`, 'ลบ')) { await remove('externals', x.id); toast('ลบแล้ว'); location.hash = '#/externals'; }
    },
    'add-pub': (el) => openPubForm(byId(S.data.externals, el.dataset.x)),
    'edit-pub': (el) => { const x = byId(S.data.externals, el.dataset.x); openPubForm(x, (x.pubs || []).find((p) => p.id === el.dataset.id)); },
    'delete-pub': async (el) => {
      const x = byId(S.data.externals, el.dataset.x);
      if (await confirmBox('ลบผลงาน', 'ต้องการลบผลงานนี้ออกจากรายการตรวจใช่หรือไม่?', 'ลบ')) { await upsert('externals', Object.assign({}, x, { pubs: x.pubs.filter((p) => p.id !== el.dataset.id) })); render(); }
    },
    'add-program': () => openProgramForm(null),
    'edit-program': (el) => openProgramForm(byId(S.data.programs, el.dataset.id)),
    'delete-program': async (el) => {
      const p = byId(S.data.programs, el.dataset.id);
      const n = S.data.lecturers.filter((l) => l.programId === p.id).length;
      if (n) { toast(`ยังมีอาจารย์ในหลักสูตรนี้ ${n} ท่าน กรุณาย้ายหรือลบก่อน`, 'error'); return; }
      if (await confirmBox('ลบหลักสูตร', `ต้องการลบหลักสูตร “${esc(p.name)}” ใช่หรือไม่?`, 'ลบ')) { await remove('programs', p.id); toast('ลบหลักสูตรแล้ว'); render(); }
    },
    'add-user': () => openUserForm(null),
    'edit-user': (el) => openUserForm(byId(S.data.users, el.dataset.id)),
    'delete-user': async (el) => {
      const u = byId(S.data.users, el.dataset.id);
      if (await confirmBox('ลบผู้ใช้งาน', `ต้องการลบบัญชี “${esc(u.username)}” ใช่หรือไม่?`, 'ลบ')) { await remove('users', u.id); toast('ลบผู้ใช้แล้ว'); render(); }
    },
    'open-lecturer-report': () => { const id = $('#reportLecturer').value; if (id) location.hash = '#/report/lecturer/' + id; },
    'export-csv': () => exportCsv(),
    backup: () => {
      const data = JSON.parse(JSON.stringify(S.data));
      download(`backup_ผลงานวิชาการ_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
    },
    'load-sample': async () => {
      if (!(await confirmBox('โหลดข้อมูลตัวอย่าง', 'ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลตัวอย่าง (รวมบัญชีผู้ใช้ทดลอง: admin / admin1234) ต้องการดำเนินการต่อหรือไม่?', 'โหลดข้อมูลตัวอย่าง'))) return;
      await replaceAll(await sampleData());
      S.user = S.data.users.find((u) => u.role === 'admin');
      persistSession(); renderUserChip(); toast('โหลดข้อมูลตัวอย่างแล้ว'); render();
    },
    'clear-data': async () => {
      if (!(await confirmBox('ล้างข้อมูลทั้งหมด', 'หลักสูตร อาจารย์ ผลงาน และผู้ใช้อื่นทั้งหมดจะถูกลบ เหลือเฉพาะบัญชีของคุณ แนะนำให้สำรองข้อมูลก่อน', 'ล้างข้อมูล'))) return;
      const s = Object.assign({}, S.data.settings); delete s.demo;
      await replaceAll({ programs: [], lecturers: [], works: [], externals: [], users: [S.user], settings: s });
      toast('ล้างข้อมูลแล้ว'); render();
    },
    'reset-weights': () => { const def = defaultSettings().weights; Object.entries(def).forEach(([k, v]) => { const i = $(`[name="w:${k}"]`); if (i) i.value = v; }); toast('คืนค่าเริ่มต้นแล้ว — กดบันทึกเพื่อยืนยัน'); },
    disconnect: async () => {
      if (!(await confirmBox('ยกเลิกการเชื่อมต่อ', 'กลับไปใช้ข้อมูลที่เก็บในเครื่องนี้?', 'ยกเลิกการเชื่อมต่อ'))) return;
      try { localStorage.removeItem('npc.api'); } catch (e) {}
      logout();
    },
    'push-remote': () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json'; inp.onchange = () => restoreFile(inp.files[0]); inp.click(); },
  };

  async function restoreFile(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.works) || !Array.isArray(data.users)) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
      if (!data.users.some((u) => u.role === 'admin')) throw new Error('ไฟล์ต้องมีบัญชีผู้ดูแลระบบอย่างน้อย 1 บัญชี');
      if (!(await confirmBox('กู้คืนข้อมูล', `แทนที่ข้อมูลปัจจุบันด้วยไฟล์ “${esc(file.name)}” (ผลงาน ${data.works.length} รายการ)?`, 'กู้คืน'))) return;
      await replaceAll(data);
      const me = S.data.users.find((u) => u.username === S.user.username);
      if (!me) { toast('กู้คืนแล้ว — กรุณาเข้าสู่ระบบใหม่'); return logout(); }
      S.user = me; persistSession(); toast('กู้คืนข้อมูลแล้ว'); render();
    } catch (e) { toast('กู้คืนไม่สำเร็จ: ' + e.message, 'error'); }
  }

  document.addEventListener('click', async (ev) => {
    const el = ev.target.closest('[data-action]');
    if (el && ACTIONS[el.dataset.action] && el.tagName !== 'INPUT') {
      if (el.tagName === 'A' && el.dataset.action !== 'tab') ev.preventDefault();
      try { await ACTIONS[el.dataset.action](el, ev); } catch (e) { toast(e.message || String(e), 'error'); }
      return;
    }
    const row = ev.target.closest('tr[data-href]');
    if (row && !ev.target.closest('a,button')) location.hash = row.dataset.href;
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset.action === 'restore') { restoreFile(t.files[0]); t.value = ''; return; }
    if (t.dataset.action === 'toggle-pub') {
      const x = byId(S.data.externals, t.dataset.x);
      upsert('externals', Object.assign({}, x, { pubs: x.pubs.map((p) => (p.id === t.dataset.id ? Object.assign({}, p, { verified: t.checked }) : p)) }))
        .then(render).catch((e) => toast(e.message, 'error'));
      return;
    }
    if (t.dataset.filter && t.tagName === 'SELECT') applyFilter(t);
  });
  let filterTimer;
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.filter && t.tagName === 'INPUT') { clearTimeout(filterTimer); filterTimer = setTimeout(() => applyFilter(t, true), 200); }
  });
  function applyFilter(t, keepFocus) {
    const [page, key] = t.dataset.filter.split('.');
    (view.filters[page] = view.filters[page] || {})[key] = t.value;
    const pos = t.selectionStart;
    render();
    if (keepFocus) { const n = $(`[data-filter="${t.dataset.filter}"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }
  }

  document.addEventListener('submit', async (ev) => {
    if (ev.target.id === 'settingsForm') {
      ev.preventDefault();
      const fd = Object.fromEntries(new FormData(ev.target).entries());
      const s = JSON.parse(JSON.stringify(st()));
      s.collegeName = fd.collegeName.trim() || s.collegeName;
      s.university = fd.university.trim() || s.university;
      s.refYear = parseInt(fd.refYear, 10) || s.refYear;
      s.windowYears = Math.max(1, parseInt(fd.windowYears, 10) || 5);
      Object.keys(fd).forEach((k) => {
        const v = fd[k];
        if (k.startsWith('w:')) s.weights[k.slice(2)] = Math.max(0, parseFloat(v) || 0);
        if (k.startsWith('t:')) s.targets[k.slice(2)] = Math.max(1, parseFloat(v) || 1);
        if (k.startsWith('r:')) { const [, grp, field] = k.split(':'); s.requirements[grp][field] = Math.max(0, parseInt(v, 10) || 0); }
      });
      try { await upsert('settings', s); toast('บันทึกการตั้งค่าแล้ว'); render(); } catch (e) { toast(e.message, 'error'); }
    }
    if (ev.target.id === 'externalCheckForm') {
      ev.preventDefault();
      const x = byId(S.data.externals, ev.target.dataset.id);
      const e = evalExternal(x);
      try {
        await upsert('externals', Object.assign({}, x, { checkNote: ev.target.checkNote.value.trim(), checkResult: e.status, checkedBy: S.user.displayName || S.user.username, checkedAt: new Date().toISOString() }));
        toast('บันทึกผลการตรวจแล้ว'); render();
      } catch (err) { toast(err.message, 'error'); }
    }
    if (ev.target.id === 'apiForm') {
      ev.preventDefault();
      const url = ev.target.apiUrl.value.trim();
      if (url && !/^https:\/\/script\.google\.com\//.test(url)) { toast('URL ต้องขึ้นต้นด้วย https://script.google.com/', 'error'); return; }
      try { if (url) localStorage.setItem('npc.api', url); else localStorage.removeItem('npc.api'); } catch (e) {}
      toast('บันทึกแล้ว — กรุณาเข้าสู่ระบบด้วยบัญชีใน Google Sheets');
      logout();
    }
  });

  // Global search
  const searchInput = $('#globalSearch');
  const searchPop = $('#searchPop');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchPop.hidden = true; return; }
    const lecs = scopeLecturers().filter((l) => [l.prefix, l.nameTh, l.nameEn].join(' ').toLowerCase().includes(q)).slice(0, 6);
    const works = scopeWorks().filter((w) => String(w.title).toLowerCase().includes(q)).slice(0, 5);
    searchPop.innerHTML = (lecs.map((l) => `<a href="#/lecturer/${l.id}">${esc(lecturerName(l, true))}<small>${esc(programName(l.programId))}</small></a>`).join('') +
      works.map((w) => `<a href="#/lecturer/${w.lecturerId}">${esc(w.title)}<small>ผลงาน · ${toBE(w.year)}</small></a>`).join('')) || '<div class="muted small" style="padding:8px">ไม่พบผลลัพธ์</div>';
    searchPop.hidden = false;
  });
  searchInput.addEventListener('blur', () => setTimeout(() => { searchPop.hidden = true; }, 150));
  searchPop.addEventListener('click', () => { searchInput.value = ''; searchPop.hidden = true; });

  // Mobile sidebar
  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; }
  $('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; });
  $('#scrim').addEventListener('click', closeSidebar);

  function updateThemeIcon() {
    const cur = document.documentElement.dataset.theme;
    const dark = cur === 'dark' || (cur === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    $$('[data-action="toggle-theme"]').forEach((b) => { b.innerHTML = svg(dark ? 'sun' : 'moon'); b.title = dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'; });
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeIcon);

  // ================= Auth =================
  function persistSession() {
    try { sessionStorage.setItem(SESSION, JSON.stringify({ userId: S.user.id, token: S.token })); } catch (e) {}
  }
  function renderUserChip() {
    const u = S.user;
    $('#userChip').innerHTML = `<div class="avatar">${esc(initials(u.displayName))}</div><div style="min-width:0"><div class="n">${esc(u.displayName)}</div><div class="r">${esc(C.USER_ROLES[u.role].label)}</div></div>`;
    $('#syncState').textContent = S.remote ? 'เชื่อมต่อ Google Sheets' : 'บันทึกในเครื่องนี้';
    $('#syncState').classList.toggle('online', S.remote);
  }
  function showApp() {
    $('#loginView').hidden = true;
    $('#appView').hidden = false;
    renderUserChip();
    hydrateIcons();
    updateThemeIcon();
    render();
  }
  function showLogin() {
    $('#appView').hidden = true;
    $('#loginView').hidden = false;
    hydrateIcons();
    updateThemeIcon();
    const demo = !S.remote && S.data && S.data.settings.demo;
    $('#loginHint').innerHTML = S.remote ? 'เชื่อมต่อฐานข้อมูล Google Sheets' : demo
      ? 'บัญชีทดลอง: <code>admin</code> / <code>admin1234</code> · <code>chair</code> / <code>chair1234</code> · <code>lecturer</code> / <code>lecturer1234</code> · <code>exec</code> / <code>exec1234</code>'
      : 'ข้อมูลเก็บในเบราว์เซอร์ของเครื่องนี้';
    $('#loginForm').username.focus();
  }
  function logout() {
    if (S.remote && S.token) api('logout').catch(() => {});
    S.user = null; S.token = null;
    try { sessionStorage.removeItem(SESSION); } catch (e) {}
    boot();
  }

  $('#loginForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const username = f.username.value.trim().toLowerCase();
    const err = $('#loginError');
    err.hidden = true;
    const btn = $('button[type=submit]', f);
    btn.disabled = true;
    try {
      const passwordHash = await hashPw(username, f.password.value);
      if (S.remote) {
        const r = await api('login', { username, passwordHash });
        S.token = r.token; S.user = r.user; S.data = normalize(r.data);
      } else {
        const u = S.data.users.find((x) => x.username === username);
        if (!u || u.passwordHash !== passwordHash) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        S.user = u;
      }
      persistSession();
      f.reset();
      if (!location.hash) location.hash = '#/dashboard';
      showApp();
    } catch (e) {
      err.textContent = e.message || 'เข้าสู่ระบบไม่สำเร็จ';
      err.hidden = false;
    } finally { btn.disabled = false; }
  });

  async function boot() {
    S.remote = !!apiUrl();
    let session = null;
    try { session = JSON.parse(sessionStorage.getItem(SESSION) || 'null'); } catch (e) {}
    if (S.remote) {
      if (session && session.token) {
        try {
          S.token = session.token;
          const r = await api('load');
          S.data = normalize(r.data); S.user = r.user;
          return showApp();
        } catch (e) { S.token = null; }
      }
      S.data = normalize({});
      return showLogin();
    }
    S.data = loadLocal();
    if (!S.data) { S.data = normalize(await sampleData()); saveLocal(); }
    if (session && session.userId) {
      S.user = byId(S.data.users, session.userId) || null;
      if (S.user) return showApp();
    }
    showLogin();
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('storage', (e) => { if (e.key === KEY && !S.remote && S.user) { S.data = loadLocal(); render(); } });
  boot();
})();
