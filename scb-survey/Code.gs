/**
 * Google Apps Script backend for the SCB Business Anywhere survey.
 * Each submission is appended as one row to the sheet "ผลแบบสอบถาม".
 *
 * Two ways data arrives here:
 *   1. Page served by this script (doGet)  -> google.script.run.saveSurveyData(data)
 *   2. Page hosted elsewhere              -> fetch POST to the /exec URL (doPost)
 */

var SHEET_NAME = "ผลแบบสอบถาม";

var HEADERS = [
  "วันเวลาที่บันทึก (Timestamp)",
  "การให้ความยินยอม",
  "เพศ", "อายุ", "ตำแหน่ง", "ระยะเวลาปฏิบัติงาน",
  // มิติที่ 1
  "1.1 ขั้นตอนซับซ้อนยุ่งยาก", "1.2 โอนเงินล่าช้า", "1.3 แจ้งผลไม่ครบ/ไม่ถูกต้อง",
  "1.4 ขาดความมั่นคงปลอดภัย", "1.5 ขาดความน่าเชื่อถือ", "1.6 ขาดการสื่อสารเมื่อเปลี่ยนระบบ",
  "1.7 ตรวจสอบสถานะไม่สะดวก", "1.8 ไม่ลดขั้นตอนติดต่อธนาคาร", "1.9 ไม่รองรับโอนเงินเพียงพอ",
  "1.10 ค่าธรรมเนียมไม่ลดลง", "1.11 ไม่ลดความเสี่ยงทุจริต",
  // มิติที่ 2
  "2.1 จนท.ขาดความแม่นยำระเบียบ", "2.2 จนท.มนุษยสัมพันธ์ไม่เพียงพอ", "2.3 จนท.ขาดความชำนาญ/แก้ปัญหาไม่ได้",
  "2.4 ความเชื่อมั่นด้านโปร่งใส", "2.5 จนท.ตอบคำถามไม่ชัดเจน", "2.6 ให้บริการไม่มาตรฐานเดียวกัน",
  // มิติที่ 3
  "3.1 แหล่งสืบค้นไม่ปัจจุบัน/เข้าถึงยาก", "3.2 ช่องทางรับฟังความเห็นไม่พอ",
  "3.3 เทคโนโลยีไม่เพิ่มประสิทธิภาพเต็มที่", "3.4 คู่มือไม่พอ/เข้าใจยาก",
  // มิติที่ 4
  "4.1 ระบบไม่ตอบสนองเพียงพอ", "4.2 ระบบไม่คุ้มค่าทรัพยากร",
  "4.3 ระบบล่าช้า/ขัดข้อง/ไม่เสถียร", "4.4 ขาดการแจ้งเตือนครบถ้วน",
  // มิติที่ 5
  "5.1 ความพึงพอใจโดยรวมต่อกระบวนการ",
  // ส่วนที่ 3 ข้อเสนอแนะ
  "ข้อเสนอแนะ: ด้านกระบวนการเบิกจ่าย",
  "ข้อเสนอแนะ: ด้านเจ้าหน้าที่ผู้ให้บริการ",
  "ข้อเสนอแนะ: ด้านข้อมูลข่าวสาร/สิ่งอำนวยความสะดวก",
  "ข้อเสนอแนะ: ด้านระบบ SCB Anywhere",
  "ข้อเสนอแนะ: ด้านความพึงพอใจโดยรวม"
];

// จำนวนข้อในแต่ละมิติ (ส่วนที่ 2) -> คีย์ q_2_<มิติ>_<ข้อ>
var DIMENSION_COUNTS = [11, 6, 4, 4, 1];

var FEEDBACK_KEYS = [
  "feedback_process", "feedback_staff", "feedback_info", "feedback_system", "feedback_overall"
];

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('แบบสอบถาม SCB Business Anywhere')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** รับข้อมูลจากหน้าเว็บที่โฮสต์ภายนอก (fetch POST) */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    saveSurveyData(data);
    return jsonOutput_({ status: "success", message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    return jsonOutput_({ status: "error", message: error.toString() });
  }
}

/** บันทึกคำตอบหนึ่งชุด (index.html เรียกผ่าน google.script.run เมื่อเปิดจากลิงก์ /exec) */
function saveSurveyData(data) {
  if (!data || typeof data !== "object") throw new Error("ไม่พบข้อมูลแบบสอบถาม");
  if (data.consent !== "ยินยอม") throw new Error("ผู้ตอบยังไม่ได้ให้ความยินยอม");

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheet_();

    var row = [
      new Date(),
      "ยินยอม",
      text_(data.q1_gender),
      text_(data.q2_age),
      text_(data.q3_position),
      text_(data.q4_duration)
    ];

    DIMENSION_COUNTS.forEach(function (count, d) {
      for (var n = 1; n <= count; n++) {
        var v = Number(data["q_2_" + (d + 1) + "_" + n]);
        row.push(v >= 1 && v <= 5 ? v : "");
      }
    });

    FEEDBACK_KEYS.forEach(function (key) {
      row.push(text_(data[key]));
    });

    sheet.appendRow(row);
    return { status: "success", row: sheet.getLastRow() };
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground("#053153")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** แปลงเป็นข้อความ และกันไม่ให้ข้อความที่ขึ้นต้นด้วย = + - @ ถูกตีความเป็นสูตร */
function text_(v) {
  if (v === undefined || v === null) return "";
  v = String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** ใช้ทดสอบในหน้า Apps Script: เลือกฟังก์ชันนี้แล้วกด Run จะได้แถวทดสอบ 1 แถว */
function testSave() {
  var data = { consent: "ยินยอม", q1_gender: "หญิง", q2_age: "25-35 ปี", q3_position: "เลขานุการหลักสูตร", q4_duration: "5-15 ปี" };
  DIMENSION_COUNTS.forEach(function (count, d) {
    for (var n = 1; n <= count; n++) data["q_2_" + (d + 1) + "_" + n] = "3";
  });
  data.feedback_overall = "ทดสอบระบบ";
  Logger.log(saveSurveyData(data));
}
