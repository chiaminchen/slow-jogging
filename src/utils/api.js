// Google Apps Script API 工具

const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

// 記錄跑步資料
export const saveRunRecord = async (durationMinutes) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveRecord',
                duration: durationMinutes,
                datetime: new Date().toISOString(),
            }),
        });

        // no-cors 模式下無法讀取 response
        return { success: true };
    } catch (error) {
        console.error('儲存記錄失敗:', error);
        return { success: false, error: error.message };
    }
};

// 取得歷史資料
export const getHistoryData = async (startDate, endDate) => {
    try {
        const url = `${API_URL}?action=getHistory&startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('取得資料失敗');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('取得歷史資料失敗:', error);
        return { success: false, error: error.message, data: [] };
    }
};

// 取得今天累計資料
export const getTodayData = async () => {
    try {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const result = await getHistoryData(dateStr, dateStr);

        if (result.success && result.data && result.data.length > 0) {
            // Google Sheet API 回傳格式如果是陣列，取第一筆資料的 totalMinutes
            // 假設回傳格式為 [{ date: '2023-12-14', totalMinutes: 30 }]
            return { success: true, totalMinutes: result.data[0].totalMinutes || 0 };
        }
        return { success: true, totalMinutes: 0 };
    } catch (error) {
        console.error('取得今天資料失敗:', error);
        return { success: false, error: error.message, totalMinutes: 0 };
    }
};
