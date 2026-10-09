/**
 * Google Apps Script backend for the SCB Business Anywhere survey.
 *
 * Every submission is appended as one row in the sheet named SHEET_NAME.
 * The header row is created automatically on the first submission.
 *
 * Two ways the page can send data here:
 *   1. Page served by this script (doGet)  -> google.script.run.saveSurveyData(data)
 *   2. Page hosted elsewhere              -> fetch POST to the /exec URL (doPost)
 */

// ถ้าสร้างสคริปต์จากเมนู "ส่วนขยาย > Apps Script" ของชีต ปล่อยว่างได้
// ถ้าเป็นสคริปต์แยก ให้ใส่ ID ของ Google Sheets (ส่วนระหว่าง /d/ กับ /edit ใน URL)
const SPREADSHEET_ID = '';
const SHEET_NAME = 'Responses';

const DIMENSIONS = [
  { label: 'มิติที่ 1', prefix: 'q_2_1_', count: 11 },
  { label: 'มิติที่ 2', prefix: 'q_2_2_', count: 6 },
  { label: 'มิติที่ 3', prefix: 'q_2_3_', count: 4 },
  { label: 'มิติที่ 4', prefix: 'q_2_4_', count: 4 },
  { label: 'มิติที่ 5', prefix: 'q_2_5_', count: 1 }
];

const FEEDBACK_FIELDS = [
  ['feedback_process', 'ข้อเสนอแนะ 1: กระบวนการเบิกจ่าย'],
  ['feedback_staff', 'ข้อเสนอแนะ 2: ผู้ให้บริการ'],
  ['feedback_info', 'ข้อเสนอแนะ 3: ข้อมูลข่าวสาร'],
  ['feedback_system', 'ข้อเสนอแนะ 4: ระบบการให้บริการ'],
  ['feedback_overall', 'ข้อเสนอแนะ 5: ความพึงพอใจโดยรวม']
];

/** Column layout: [field key, header text]. Order here = column order in the sheet. */
function getColumns_() {
  const cols = [
    ['_timestamp', 'วันเวลาที่ส่ง'],
    ['q1_gender', 'เพศ'],
    ['q2_age', 'อายุ'],
    ['q3_position', 'ตำแหน่ง'],
    ['q4_duration', 'ระยะเวลาปฏิบัติงาน']
  ];
  DIMENSIONS.forEach((d, i) => {
    for (let n = 1; n <= d.count; n++) {
      cols.push([d.prefix + n, (i + 1) + '.' + n]);
    }
  });
  DIMENSIONS.forEach((d, i) => {
    cols.push(['_mean_' + (i + 1), 'ค่าเฉลี่ย' + d.label]);
  });
  return cols.concat(FEEDBACK_FIELDS);
}

/** เปิดหน้าแบบสอบถามเมื่อเข้าลิงก์ Web App */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('แบบสอบถามระบบ SCB Business Anywhere')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** รับข้อมูลจากหน้าเว็บที่โฮสต์ภายนอก (fetch POST) */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveSurveyData(data);
    return jsonOutput_({ status: 'success' });
  } catch (err) {
    return jsonOutput_({ status: 'error', message: String(err) });
  }
}

/** บันทึกคำตอบหนึ่งชุดลงชีต (เรียกจาก google.script.run ได้โดยตรง) */
function saveSurveyData(data) {
  if (!data || typeof data !== 'object') throw new Error('ไม่พบข้อมูลแบบสอบถาม');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet_();
    const columns = getColumns_();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columns.map(c => c[1]));
      sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
    }

    const values = Object.assign({}, data, { _timestamp: new Date() });
    DIMENSIONS.forEach((d, i) => {
      const scores = [];
      for (let n = 1; n <= d.count; n++) {
        const v = Number(data[d.prefix + n]);
        if (v >= 1 && v <= 5) scores.push(v);
      }
      values['_mean_' + (i + 1)] = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100
        : '';
    });

    const row = columns.map(([key]) => {
      const v = values[key];
      if (v === undefined || v === null) return '';
      if (/^q_2_/.test(key)) return Number(v);
      // กันไม่ให้ข้อความที่ขึ้นต้นด้วย = + - @ ถูกตีความเป็นสูตร
      if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
      return v;
    });

    sheet.appendRow(row);
    return { status: 'success', row: sheet.getLastRow() };
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('ไม่พบ Google Sheets: กรุณาใส่ SPREADSHEET_ID ใน Code.gs');
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** ใช้ทดสอบในหน้า Apps Script: เลือกฟังก์ชันนี้แล้วกด Run จะได้แถวทดสอบ 1 แถว */
function testSave() {
  const data = { q1_gender: 'หญิง', q2_age: '25-35 ปี', q3_position: 'เลขานุการหลักสูตร', q4_duration: '5-15 ปี' };
  DIMENSIONS.forEach(d => {
    for (let n = 1; n <= d.count; n++) data[d.prefix + n] = 3;
  });
  data.feedback_overall = 'ทดสอบระบบ';
  Logger.log(saveSurveyData(data));
}
