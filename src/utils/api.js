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
