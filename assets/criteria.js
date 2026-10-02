/*
 * เกณฑ์และข้อมูลอ้างอิงของระบบ
 * - ประกาศ ก.พ.อ. เรื่อง หลักเกณฑ์การพิจารณาวารสารทางวิชาการสำหรับการเผยแพร่ผลงานทางวิชาการ พ.ศ. 2562
 * - ค่าน้ำหนักผลงานวิชาการตามคู่มือการประกันคุณภาพการศึกษาภายใน ระดับหลักสูตร (สป.อว./สกอ.)
 * ค่าทั้งหมดเป็น "ค่าเริ่มต้น" ผู้ดูแลระบบปรับได้ที่หน้า จัดการระบบ > ตั้งค่าเกณฑ์
 */
window.CRITERIA = (function () {
  // ประเภทแหล่งเผยแพร่ (category)
  // kpa: ระดับวารสารตามประกาศ ก.พ.อ. 2562 — intl = นานาชาติ, nat = ชาติ, '' = ไม่ใช่วารสารตามประกาศ
  // journal: เป็นบทความในวารสาร (ใช้แสดงช่องชื่อวารสาร/ISSN/Quartile)
  const CATEGORIES = [
    { id: 'scopus',     label: 'วารสารในฐาน Scopus',                        short: 'Scopus',     kpa: 'intl', journal: true, quartile: true, weight: 1.0, color: '#2f6fd6' },
    { id: 'wos',        label: 'วารสารในฐาน Web of Science (SCIE/SSCI/AHCI)', short: 'WoS',        kpa: 'intl', journal: true, quartile: true, weight: 1.0, color: '#7b5cd6' },
    { id: 'intl_kpa',   label: 'วารสารนานาชาติในฐาน ก.พ.อ. อื่น (ERIC, PubMed, MathSciNet, JSTOR, Project MUSE)', short: 'นานาชาติ (ก.พ.อ.)', kpa: 'intl', journal: true, weight: 1.0, color: '#1b9aaa' },
    { id: 'intl_other', label: 'วารสารนานาชาตินอกฐาน ก.พ.อ. (สภาสถาบันอนุมัติ)', short: 'นานาชาติอื่น', kpa: '', journal: true, weight: 0.8, color: '#5aa6c9' },
    { id: 'tci1',       label: 'วารสารในฐาน TCI กลุ่มที่ 1',                 short: 'TCI 1',      kpa: 'nat', journal: true, weight: 0.8, color: '#1f9d63' },
    { id: 'tci2',       label: 'วารสารในฐาน TCI กลุ่มที่ 2',                 short: 'TCI 2',      kpa: 'nat', journal: true, weight: 0.6, color: '#7cc04b' },
    { id: 'nat_other',  label: 'วารสารระดับชาตินอกฐาน TCI (สภาสถาบันอนุมัติ)', short: 'วารสารชาติอื่น', kpa: '', journal: true, weight: 0.4, color: '#b7c95a' },
    { id: 'proc_intl',  label: 'Proceedings ระดับนานาชาติ (ฉบับสมบูรณ์)',     short: 'Proc. นานาชาติ', kpa: '', weight: 0.4, color: '#d98a1c' },
    { id: 'proc_nat',   label: 'Proceedings ระดับชาติ (ฉบับสมบูรณ์)',         short: 'Proc. ชาติ',  kpa: '', weight: 0.2, color: '#e9b44c' },
    { id: 'book',       label: 'ตำรา / หนังสือ ที่ผ่านการประเมินตำแหน่งทางวิชาการ', short: 'ตำรา/หนังสือ', kpa: '', weight: 1.0, color: '#c0567b' },
    { id: 'patent',     label: 'สิทธิบัตร',                                    short: 'สิทธิบัตร',   kpa: '', weight: 1.0, color: '#8b5a3c' },
    { id: 'petty',      label: 'อนุสิทธิบัตร',                                 short: 'อนุสิทธิบัตร', kpa: '', weight: 0.4, color: '#b98a6a' },
    { id: 'social',     label: 'ผลงานวิชาการรับใช้สังคม (ผ่านการประเมินตำแหน่ง)', short: 'รับใช้สังคม', kpa: '', weight: 1.0, color: '#6c7a96' },
    { id: 'tci3',       label: 'วารสาร TCI กลุ่มที่ 3 (ไม่เข้าเกณฑ์)',          short: 'TCI 3',      kpa: '', journal: true, weight: 0, color: '#a0a7b8' },
    { id: 'none',       label: 'ไม่อยู่ในฐานข้อมูลที่กำหนด (ไม่เข้าเกณฑ์)',      short: 'ไม่อยู่ในฐาน', kpa: '', journal: true, weight: 0, color: '#c4c9d4' },
  ];

  const QUARTILES = ['Q1', 'Q2', 'Q3', 'Q4'];

  const WORK_TYPES = [
    { id: 'research', label: 'บทความวิจัย', research: true },
    { id: 'academic', label: 'บทความวิชาการ' },
    { id: 'proceeding', label: 'บทความวิจัยในรายงานการประชุม', research: true },
    { id: 'book', label: 'ตำรา / หนังสือ' },
    { id: 'patent', label: 'สิทธิบัตร / อนุสิทธิบัตร' },
    { id: 'other', label: 'ผลงานอื่น ๆ' },
  ];

  const AUTHOR_ROLES = [
    { id: 'first', label: 'ผู้แต่งหลัก' },
    { id: 'corresponding', label: 'ผู้ประพันธ์บรรณกิจ' },
    { id: 'co', label: 'ผู้แต่งร่วม' },
  ];

  const STATUSES = {
    pending:  { label: 'รอตรวจสอบ', tone: 'warning' },
    verified: { label: 'รับรองแล้ว', tone: 'success' },
    rejected: { label: 'ส่งกลับแก้ไข', tone: 'danger' },
  };

  const LEVELS = {
    bachelor: { label: 'ปริญญาตรี', target: 20 },
    master:   { label: 'ปริญญาโท',  target: 40 },
    phd:      { label: 'ปริญญาเอก', target: 60 },
  };

  // ประเภทอาจารย์ในหลักสูตร
  const LECTURER_TYPES = [
    { id: 'responsible', label: 'อาจารย์ผู้รับผิดชอบหลักสูตร' },
    { id: 'program',     label: 'อาจารย์ประจำหลักสูตร' },
    { id: 'regular',     label: 'อาจารย์ประจำ' },
    { id: 'adjunct',     label: 'อาจารย์พิเศษ' },
  ];

  const ACADEMIC_POSITIONS = ['', 'ผู้ช่วยศาสตราจารย์', 'รองศาสตราจารย์', 'ศาสตราจารย์'];

  // สิทธิ์ของผู้ใช้แต่ละบทบาท
  const USER_ROLES = {
    admin:     { label: 'ผู้ดูแลระบบ (Admin)', tone: 'accent' },
    chair:     { label: 'ประธานหลักสูตร',     tone: 'primary' },
    lecturer:  { label: 'อาจารย์',            tone: 'info' },
    executive: { label: 'ผู้บริหาร',          tone: 'violet' },
  };

  const PERMISSIONS = [
    // [สิทธิ์, admin, chair, lecturer, executive]
    ['ดูแดชบอร์ดและการแจ้งเตือน',            'ทั้งบัณฑิตวิทยาลัย', 'หลักสูตรตนเอง', 'ของตนเอง', 'ทั้งบัณฑิตวิทยาลัย'],
    ['เพิ่ม / แก้ไข / ลบ ผลงานวิชาการ',        '✓', 'หลักสูตรตนเอง', 'ของตนเอง (ก่อนรับรอง)', '—'],
    ['ตรวจรับรองผลงาน (Verification)',      '✓', 'หลักสูตรตนเอง', '—', '—'],
    ['จัดการข้อมูลอาจารย์',                  '✓', 'หลักสูตรตนเอง', 'แก้ไขโปรไฟล์ตนเอง', '—'],
    ['ตรวจคุณสมบัติผู้ทรงคุณวุฒิภายนอก',      '✓', '✓', '—', 'ดูอย่างเดียว'],
    ['จัดการหลักสูตร',                       '✓', '—', '—', '—'],
    ['ประเมินหลักสูตรและออกรายงาน PDF',      '✓', 'หลักสูตรตนเอง', 'รายงานตนเอง', 'ทั้งบัณฑิตวิทยาลัย'],
    ['อนุมัติคำขอสมัครใช้งาน / กำหนดสิทธิ์',   '✓', '—', '—', '—'],
    ['จัดการผู้ใช้ / ตั้งค่าเกณฑ์ / สำรองข้อมูล', '✓', '—', '—', '—'],
  ];

  // สิทธิ์ในโหมด "ผู้ดูแลระบบจัดการคนเดียว" (ค่าเริ่มต้น)
  const PERMISSIONS_ADMIN_ONLY = [
    ['ดูแดชบอร์ดและการแจ้งเตือน',             'ทั้งบัณฑิตวิทยาลัย', 'หลักสูตรตนเอง', 'ของตนเอง', 'ทั้งบัณฑิตวิทยาลัย'],
    ['เพิ่ม / แก้ไข / ลบ ผลงานวิชาการ',         '✓', 'ดูอย่างเดียว', 'ดูอย่างเดียว', 'ดูอย่างเดียว'],
    ['ตรวจรับรองผลงาน (Verification)',       '✓', '—', '—', '—'],
    ['ตรวจคุณสมบัติผู้ทรงคุณวุฒิภายนอก',       '✓', 'ดูอย่างเดียว', '—', 'ดูอย่างเดียว'],
    ['จัดการข้อมูลอาจารย์และหลักสูตร',         '✓', 'ดูอย่างเดียว', 'ดูอย่างเดียว', 'ดูอย่างเดียว'],
    ['ประเมินหลักสูตรและออกรายงาน PDF',       '✓', 'หลักสูตรตนเอง', 'รายงานตนเอง', 'ทั้งบัณฑิตวิทยาลัย'],
    ['อนุมัติคำขอสมัครใช้งาน / กำหนดสิทธิ์',    '✓', '—', '—', '—'],
    ['ตั้งค่าเกณฑ์ / สำรองข้อมูล',              '✓', '—', '—', '—'],
  ];

  // เกณฑ์คุณสมบัติด้านผลงานของอาจารย์ (ค่าเริ่มต้นตามเกณฑ์มาตรฐานหลักสูตร — ปรับได้)
  const DEFAULT_REQUIREMENTS = {
    bachelor: { minWorks: 1, minResearch: 0 },
    master:   { minWorks: 3, minResearch: 1 },
    phd:      { minWorks: 3, minResearch: 1 },
    adjunct:  { minWorks: 1, minResearch: 0, kpaOnly: true },
  };

  // คุณสมบัติผู้ทรงคุณวุฒิภายนอก (กรรมการสอบวิทยานิพนธ์) ตามเกณฑ์มาตรฐานหลักสูตรระดับบัณฑิตศึกษา
  // นับผลงานตลอดช่วงชีวิตการทำงาน (ไม่จำกัด 5 ปี) · "ฐานข้อมูลที่ยอมรับ" อ้างอิงประกาศ ก.พ.อ. พ.ศ. 2562
  // rule: research = มีประสบการณ์ทำวิจัย, intl = จำนวนผลงานระดับนานาชาติ, natOrIntl = ระดับชาติ X หรือนานาชาติ Y, accepted = ผลงานในฐานที่ยอมรับ (ชาติ+นานาชาติ)
  const EXTERNAL_STANDARDS = {
    '2548': {
      label: 'เกณฑ์ 2548',
      degree: 'ปริญญาเอกหรือเทียบเท่า หรือปริญญาโทและดำรงตำแหน่งไม่ต่ำกว่ารองศาสตราจารย์',
      phd:    { rule: 'research', text: 'มีประสบการณ์ทำวิจัยที่ไม่ใช่ส่วนหนึ่งของการศึกษาเพื่อรับปริญญา' },
      master: { rule: 'research', text: 'มีประสบการณ์ทำวิจัยที่ไม่ใช่ส่วนหนึ่งของการศึกษาเพื่อรับปริญญา' },
    },
    '2558': {
      label: 'เกณฑ์ 2558',
      degree: 'ปริญญาเอกหรือเทียบเท่า',
      phd:    { rule: 'intl', intl: 5, text: 'ผลงานตีพิมพ์ระดับนานาชาติ 5 รายการ' },
      master: { rule: 'natOrIntl', nat: 10, intl: 5, text: 'ผลงานตีพิมพ์ระดับชาติ 10 รายการ หรือระดับนานาชาติ 5 รายการ' },
    },
    '2565': {
      label: 'เกณฑ์ 2565',
      degree: 'ปริญญาเอกหรือเทียบเท่า',
      phd:    { rule: 'accepted', min: 10, text: 'ผลงานตีพิมพ์ในฐานข้อมูลที่ยอมรับ 10 รายการ (อ้างอิงประกาศ ก.พ.อ. พ.ศ. 2562)' },
      master: { rule: 'accepted', min: 5, text: 'ผลงานตีพิมพ์ในฐานข้อมูลที่ยอมรับ 5 รายการ (อ้างอิงประกาศ ก.พ.อ. พ.ศ. 2562)' },
    },
  };

  const EXTERNAL_ROLES = ['กรรมการสอบวิทยานิพนธ์', 'กรรมการสอบเค้าโครงวิทยานิพนธ์', 'อาจารย์ที่ปรึกษาวิทยานิพนธ์ร่วม', 'อาจารย์พิเศษ', 'ผู้ทรงคุณวุฒิตรวจเครื่องมือวิจัย'];

  // ลิงก์ค้นหาชื่อในฐานข้อมูล — ผู้ตรวจเปิดตรวจสอบและยืนยันด้วยตนเอง
  function splitName(full) {
    const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return { first: parts[0] || '', last: parts[0] || '' };
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
  }

  function searchLinks(p) {
    const en = (p.nameEn || '').trim();
    const th = (p.nameTh || '').trim();
    const e = encodeURIComponent;
    const { first, last } = splitName(en);
    const out = [];
    if (p.scopusId) out.push({ k: 'SC', label: 'Scopus Author Profile', hint: 'ID ' + p.scopusId, url: 'https://www.scopus.com/authid/detail.uri?authorId=' + e(p.scopusId) });
    if (en) out.push({ k: 'SC', label: 'Scopus — ค้นหาผู้แต่ง', hint: last + ', ' + first, url: 'https://www.scopus.com/results/authorNamesList.uri?origin=searchauthorlookup&src=al&st1=' + e(last) + '&st2=' + e(first) });
    if (th) out.push({ k: 'TJ', label: 'ThaiJO (TCI) — ชื่อไทย', hint: th, url: 'https://www.tci-thaijo.org/index.php/index/search/search?query=' + e(th) });
    if (en) out.push({ k: 'TJ', label: 'ThaiJO (TCI) — ชื่ออังกฤษ', hint: en, url: 'https://www.tci-thaijo.org/index.php/index/search/search?query=' + e(en) });
    out.push({ k: 'TC', label: 'TCI — ตรวจกลุ่มวารสาร', hint: 'tci-thailand.org', url: 'https://tci-thailand.org/' });
    out.push({ k: 'WS', label: 'Web of Science', hint: 'ต้องใช้เครือข่ายสถาบัน', url: 'https://www.webofscience.com/wos/author/search' });
    if (en) out.push({ k: 'PM', label: 'PubMed', hint: en, url: 'https://pubmed.ncbi.nlm.nih.gov/?term=' + e(en + '[Author]') });
    if (en) out.push({ k: 'ER', label: 'ERIC', hint: en, url: 'https://eric.ed.gov/?q=' + e('author:"' + en + '"') });
    out.push({ k: 'GS', label: 'Google Scholar', hint: en || th, url: 'https://scholar.google.com/scholar?q=' + e('author:"' + (en || th) + '"') });
    if (p.orcid) out.push({ k: 'OR', label: 'ORCID', hint: p.orcid, url: 'https://orcid.org/' + e(p.orcid) });
    return out;
  }

  function workLinks(w) {
    const e = encodeURIComponent;
    const out = [];
    const key = w.issn || w.journal;
    if (key) out.push({ label: 'SJR / Quartile', url: 'https://www.scimagojr.com/journalsearch.php?q=' + e(key) });
    if (w.journal) out.push({ label: 'ThaiJO', url: 'https://www.tci-thaijo.org/index.php/index/search/search?query=' + e(w.journal) });
    if (w.title) out.push({ label: 'Google Scholar', url: 'https://scholar.google.com/scholar?q=' + e('"' + w.title + '"') });
    if (w.doi) out.push({ label: 'DOI', url: 'https://doi.org/' + String(w.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, '') });
    if (w.url) out.push({ label: 'หลักฐาน', url: w.url });
    return out;
  }

  const KPA_2562 = {
    title: 'ประกาศ ก.พ.อ. เรื่อง หลักเกณฑ์การพิจารณาวารสารทางวิชาการสำหรับการเผยแพร่ผลงานทางวิชาการ พ.ศ. 2562',
    source: 'https://www.ratchakitcha.soc.go.th/DATA/PDF/2562/E/151/T_0013.PDF',
    national: [
      'เป็นวารสารที่อยู่ในฐานข้อมูล Thai-Journal Citation Index (TCI) กลุ่มที่ 1 หรือกลุ่มที่ 2',
      'มีกองบรรณาธิการจากหลากหลายสถาบัน และบทความผ่านการพิจารณาจากผู้ทรงคุณวุฒิ (Peer review) ก่อนตีพิมพ์',
      'ออกเผยแพร่สม่ำเสมอตรงตามกำหนดเวลา',
    ],
    international: ['ERIC', 'MathSciNet', 'PubMed', 'Scopus', 'Web of Science (เฉพาะ SCIE, SSCI, AHCI)', 'JSTOR', 'Project MUSE'],
    notes: [
      'วารสารที่มีลักษณะเป็นวารสารล่าเหยื่อ (Predatory journal) ไม่ถือเป็นวารสารทางวิชาการตามประกาศ',
      'ตรวจสถานะวารสาร ณ ปีที่ผลงานตีพิมพ์ (วารสารต้องอยู่ในฐานข้อมูลในปีนั้น)',
      'วารสาร TCI กลุ่มที่ 3 ไม่เข้าเกณฑ์วารสารทางวิชาการตามประกาศนี้',
    ],
  };

  const FAQ = [
    ['ผลงานไม่ถูกนำมาคิดคะแนน เกิดจากอะไร?',
      'ตรวจ 4 จุด: (1) สถานะต้องเป็น "รับรองแล้ว" — ผลงานรอตรวจ/ส่งกลับแก้ไขจะไม่นับ (2) ปีที่ตีพิมพ์ต้องอยู่ในช่วง 5 ปีย้อนหลังจากปีประเมิน (ดูปีประเมินที่ จัดการระบบ > ตั้งค่าเกณฑ์) (3) ประเภทแหล่งเผยแพร่ต้องมีค่าน้ำหนักมากกว่า 0 — TCI กลุ่ม 3 และวารสารนอกฐานจะได้ 0 (4) อาจารย์ต้องผูกกับหลักสูตรและเป็น "อาจารย์ผู้รับผิดชอบหลักสูตร" จึงนับในตัวบ่งชี้ระดับหลักสูตร'],
    ['ตรวจคุณสมบัติบุคคลภายนอก (ผู้ทรงคุณวุฒิภายนอก) อย่างไร?',
      'เมนู ตรวจคุณสมบัติบุคคลภายนอก > เพิ่มรายชื่อ ระบุวุฒิ ตำแหน่งทางวิชาการ ระดับการสอบ (ป.โท/ป.เอก) และเกณฑ์ที่หลักสูตรใช้ (2548/2558/2565) → กดลิงก์ค้นชื่อใน Scopus / ThaiJO / WoS → บันทึกผลงานที่พบและติ๊ก "ยืนยันแล้ว" → ระบบสรุปผลผ่าน/ไม่ผ่านทั้ง 3 เกณฑ์พร้อมกัน และพิมพ์แบบตรวจสอบเป็น PDF ได้'],
    ['อาจารย์ไม่ได้ส่งผลงานให้เจ้าหน้าที่ จะตรวจอย่างไร?',
      'ที่เมนู ตรวจคุณสมบัติบุคคลภายนอก ใช้ “ตรวจด่วนจากชื่อ” พิมพ์ชื่ออาจารย์ที่มาทำหน้าที่ → ถ้าอยู่ในทะเบียนอาจารย์ ระบบแสดงผลงานที่นับได้ทันที → ถ้าไม่พบ กด “ค้นผลงานออนไลน์” ระบบดึงรายการผลงานจากฐานข้อมูล OpenAlex และจัดกลุ่มด้วย ISSN จากฐานรายชื่อวารสาร (นำเข้าที่ จัดการระบบ > ข้อมูล) → ผู้ดูแลระบบตรวจแล้วกดยืนยัน'],
    ['ผลงานของบุคคลภายนอกนับย้อนหลังกี่ปี?',
      'เกณฑ์ผู้ทรงคุณวุฒิภายนอกนับผลงานทั้งหมดที่เคยตีพิมพ์ (ไม่จำกัด 5 ปี) แต่วารสารต้องอยู่ในฐานข้อมูลที่ยอมรับตามประกาศ ก.พ.อ. 2562 ในปีที่ตีพิมพ์ — ผลงานใน TCI กลุ่ม 3 หรือนอกฐานจะไม่ถูกนับ'],
    ['ปีที่ตีพิมพ์ ควรกรอกเป็น พ.ศ. หรือ ค.ศ.?',
      'กรอกได้ทั้งสองแบบ ระบบจะแปลง ค.ศ. (เช่น 2024) เป็น พ.ศ. (2567) ให้อัตโนมัติ'],
    ['จะสร้างข้อมูลเริ่มต้นอย่างไร?',
      'เข้าสู่ระบบด้วยบัญชี Admin แล้วไปที่ จัดการระบบ > ข้อมูล กด "โหลดข้อมูลตัวอย่าง" เพื่อทดลองระบบ หรือเริ่มจาก (1) เพิ่มหลักสูตร (2) เพิ่มอาจารย์และกำหนดหลักสูตร (3) สร้างบัญชีผู้ใช้ให้ประธานหลักสูตรและอาจารย์ (4) บันทึกผลงาน'],
    ['ผลงานใกล้หมดอายุ 5 ปี หมายถึงอะไร?',
      'ผลงานที่ตีพิมพ์ในปีแรกของช่วง 5 ปี (เช่น ปีประเมิน 2569 → ผลงานปี 2565) จะไม่ถูกนับในปีประเมินถัดไป ระบบจึงแจ้งเตือนล่วงหน้าเพื่อให้อาจารย์วางแผนเผยแพร่ผลงานใหม่'],
    ['ตรวจสอบว่าวารสารอยู่ในฐานใดอย่างไร?',
      'ในหน้าตรวจรับรองผลงาน กดลิงก์ SJR (ดู Quartile ของ Scopus), ThaiJO/TCI (ดูกลุ่มวารสาร) หรือเปิดโปรไฟล์อาจารย์แล้วใช้ "ค้นหาชื่อในฐานข้อมูล" เพื่อค้น Scopus, TCI, WoS, PubMed, ERIC และ Google Scholar'],
    ['ข้อมูลเก็บไว้ที่ไหน?',
      'โหมดเริ่มต้นเก็บในเบราว์เซอร์ของเครื่องนี้ (ควรสำรองข้อมูลเป็นไฟล์ JSON สม่ำเสมอ) หากต้องการใช้งานหลายคนพร้อมกัน ให้ติดตั้งตัวเชื่อม Google Sheets (โฟลเดอร์ apps-script) แล้วใส่ URL ที่ จัดการระบบ > การเชื่อมต่อ'],
    ['สมัครใช้งานด้วยอีเมลอย่างไร?',
      'ที่หน้าเข้าสู่ระบบ เลือกแท็บ "สมัครใช้งานด้วยอีเมล" กรอกอีเมล ชื่อ รหัสผ่าน และบทบาทที่ขอ → ผู้ดูแลระบบอนุมัติและกำหนดสิทธิ์ที่ จัดการระบบ > ผู้ใช้งาน > คำขอสมัครใช้งาน → เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่สมัคร · อีเมลที่อยู่ในรายชื่อ "อีเมลผู้ดูแลระบบ" (จัดการระบบ > ตั้งค่าเกณฑ์ หรือ ADMIN_EMAILS ใน Code.gs) จะได้สิทธิ์ผู้ดูแลระบบทันทีเมื่อสมัคร'],
    ['ลืมรหัสผ่าน Admin?',
      'โหมดเก็บในเครื่อง: เปิด DevTools > Application > Local Storage แล้วลบคีย์ mugr.data เพื่อรีเซ็ต (ข้อมูลจะหาย ควรมีไฟล์สำรอง) · โหมด Google Sheets: แก้รหัสผ่านในชีต Users ได้โดยตรง'],
  ];

  return { CATEGORIES, QUARTILES, WORK_TYPES, AUTHOR_ROLES, STATUSES, LEVELS, LECTURER_TYPES, ACADEMIC_POSITIONS,
    USER_ROLES, PERMISSIONS, PERMISSIONS_ADMIN_ONLY, DEFAULT_REQUIREMENTS, EXTERNAL_STANDARDS, EXTERNAL_ROLES, KPA_2562, FAQ, searchLinks, workLinks };
})();
