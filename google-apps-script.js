/**
 * 超慢跑計時器 - Google Apps Script
 * 
 * 使用方式：
 * 1. 在 Google Sheets 中建立兩個工作表：
 *    - "Record"：ID, DateTime, Duration
 *    - "TodayDuration"：Date, TotalMinutes
 * 2. 擴充功能 > Apps Script，貼上此程式碼
 * 3. 部署 > 新增部署 > 網頁應用程式
 *    - 執行身分：我
 *    - 存取權限：所有人
 * 4. 複製部署 URL 到 .env 的 VITE_GOOGLE_APP_SCRIPT_URL
 */

// 取得試算表
function getSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
}

// 取得 Record 工作表
function getRecordSheet() {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('Record');
    if (!sheet) {
        sheet = ss.insertSheet('Record');
        sheet.appendRow(['ID', 'DateTime', 'Duration']);
    }
    return sheet;
}

// 取得 TodayDuration 工作表
function getTodayDurationSheet() {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('TodayDuration');
    if (!sheet) {
        sheet = ss.insertSheet('TodayDuration');
        sheet.appendRow(['Date', 'TotalMinutes']);
    }
    return sheet;
}

// 處理 GET 請求（取得歷史資料）
function doGet(e) {
    const action = e.parameter.action;

    if (action === 'getHistory') {
        const startDate = e.parameter.startDate;
        const endDate = e.parameter.endDate;
        return getHistory(startDate, endDate);
    }

    return ContentService
        .createTextOutput(JSON.stringify({ error: '無效的 action' }))
        .setMimeType(ContentService.MimeType.JSON);
}

// 處理 POST 請求（儲存記錄）
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        if (action === 'saveRecord') {
            return saveRecord(data.datetime, data.duration);
        }

        return ContentService
            .createTextOutput(JSON.stringify({ error: '無效的 action' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// 儲存跑步記錄
function saveRecord(datetime, duration) {
    const recordSheet = getRecordSheet();
    const lastRow = recordSheet.getLastRow();
    const newId = lastRow > 1 ? lastRow : 1;

    // 從 datetime 擷取日期部分 (yyyy-MM-dd)
    const dateOnly = datetime.split('T')[0];

    // 新增記錄
    recordSheet.appendRow([newId, datetime, duration]);

    // 更新當天總時間
    updateTodayDuration(dateOnly);

    return ContentService
        .createTextOutput(JSON.stringify({
            success: true,
            id: newId,
            datetime: datetime,
            duration: duration
        }))
        .setMimeType(ContentService.MimeType.JSON);
}

// 格式化日期為 yyyy-MM-dd（從 datetime 或 Date 物件取得日期部分）
function formatDateToString(dateValue) {
    if (typeof dateValue === 'string') {
        // 如果是 ISO datetime 格式，擷取日期部分
        return dateValue.split('T')[0];
    }
    if (dateValue instanceof Date) {
        return Utilities.formatDate(dateValue, 'Asia/Taipei', 'yyyy-MM-dd');
    }
    return String(dateValue);
}

// 更新當天總跑步時間
function updateTodayDuration(date) {
    const recordSheet = getRecordSheet();
    const todaySheet = getTodayDurationSheet();

    // 計算該日期的總時間
    const data = recordSheet.getDataRange().getValues();
    let totalMinutes = 0;

    for (let i = 1; i < data.length; i++) {
        const rowDate = formatDateToString(data[i][1]);
        if (rowDate === date) {
            totalMinutes += Number(data[i][2]);
        }
    }

    // 檢查 TodayDuration 是否已有該日期的記錄
    const todayData = todaySheet.getDataRange().getValues();
    let foundRow = -1;

    for (let i = 1; i < todayData.length; i++) {
        const rowDate = formatDateToString(todayData[i][0]);
        if (rowDate === date) {
            foundRow = i + 1;
            break;
        }
    }

    if (foundRow > 0) {
        // 更新現有記錄
        todaySheet.getRange(foundRow, 2).setValue(totalMinutes);
    } else {
        // 新增記錄
        todaySheet.appendRow([date, totalMinutes]);
    }
}

// 取得歷史資料（從 Record 工作表計算每日加總）
function getHistory(startDate, endDate) {
    const recordSheet = getRecordSheet();
    const data = recordSheet.getDataRange().getValues();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 用物件來加總每天的時間
    const dailyTotals = {};

    for (let i = 1; i < data.length; i++) {
        const rowDateStr = formatDateToString(data[i][1]); // DateTime 欄位
        const rowDate = new Date(rowDateStr);

        if (rowDate >= start && rowDate <= end) {
            const duration = Number(data[i][2]) || 0;
            if (dailyTotals[rowDateStr]) {
                dailyTotals[rowDateStr] += duration;
            } else {
                dailyTotals[rowDateStr] = duration;
            }
        }
    }

    // 轉換為陣列格式
    const result = Object.keys(dailyTotals).map(date => ({
        date: date,
        totalMinutes: dailyTotals[date]
    }));

    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// 測試函數（可在編輯器中執行測試）
function testSaveRecord() {
    const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
    saveRecord(today, 10);
    Logger.log('記錄儲存成功');
}

function testGetHistory() {
    const result = getHistory('2025-12-01', '2025-12-31');
    Logger.log(result.getContent());
}
