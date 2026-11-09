/**
 * 《鐘塔爺爺的停擺城堡》成績上傳後端(Google Apps Script)
 * 欄位:送出時間、姓名、結果、第1~5關答錯次數、總答錯次數
 */
var SHEET_NAME = "成績";

var HEADERS = ["送出時間", "姓名", "結果",
  "第1關答錯", "第2關答錯", "第3關答錯", "第4關答錯", "第5關答錯", "總答錯次數"];

function rowFor(data) {
  var w = data.levelWrongs || [];
  return [
    new Date(),
    val(data.playerName),
    val(data.result === "pass" ? "通關" : data.result),
    val(w[0]), val(w[1]), val(w[2]), val(w[3]), val(w[4]),
    val(data.wrongCount)
  ];
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = lock.tryLock(30000);
  try {
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return reply({ status: "error", message: "資料格式不正確" });
    }
    var sheet = getSheet();
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow(rowFor(data));
    return reply({ status: "ok" });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 0 也要寫進去(一次答對時答錯次數就是 0);= + - @ 開頭的文字補單引號,避免被當成公式
function val(x) {
  if (x === undefined || x === null) return "";
  if (typeof x === "string" && /^[=+\-@]/.test(x)) return "'" + x;
  return x;
}

function doGet(e) {
  return ContentService.createTextOutput("GAS backend is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
