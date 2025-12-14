import { useState, useEffect, useMemo } from 'react';
import { getWeekRange, formatDateKey, formatDateShort, formatMinutes, WEEKDAY_LABELS } from '../utils/helpers';
import { getHistoryData } from '../utils/api';
import runIcon from '../assets/run.png';

export function HistoryView({ onBack }) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [historyData, setHistoryData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // 計算當前顯示的週範圍
    const weekRange = useMemo(() => {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - weekOffset * 7);
        return getWeekRange(targetDate);
    }, [weekOffset]);

    // 產生一週的日期陣列
    const weekDays = useMemo(() => {
        const days = [];
        const current = new Date(weekRange.start);
        for (let i = 0; i < 7; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [weekRange]);

    // 取得歷史資料
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const startDate = formatDateKey(weekRange.start);
            const endDate = formatDateKey(weekRange.end);

            const result = await getHistoryData(startDate, endDate);

            if (result.success && result.data) {
                // 將陣列轉換為物件，以日期為 key
                const dataMap = {};
                result.data.forEach((item) => {
                    dataMap[item.date] = item.totalMinutes;
                });
                setHistoryData(dataMap);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [weekRange]);

    // 計算最大值以調整長條高度
    const maxMinutes = useMemo(() => {
        const values = weekDays.map((day) => historyData[formatDateKey(day)] || 0);
        return Math.max(...values, 30); // 至少 30 分鐘作為基準
    }, [weekDays, historyData]);

    // 判斷是否為今天
    const isToday = (date) => {
        const today = new Date();
        return formatDateKey(date) === formatDateKey(today);
    };

    // 計算本週總分鐘數
    const weekTotalMinutes = useMemo(() => {
        return Object.values(historyData).reduce((sum, minutes) => sum + minutes, 0);
    }, [historyData]);

    return (
        <div className="card">
            <h1 className="page-title">
                <img src={runIcon} alt="跑步" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                超慢跑計時器
            </h1>

            {/* 導航標籤 */}
            <div className="nav-tabs">
                <button className="nav-tab" onClick={onBack}>計時設定</button>
                <button className="nav-tab active">歷史紀錄</button>
            </div>

            {/* 週選擇器 */}
            <div className="history-header">
                <div className="week-nav">
                    <button
                        className="week-nav-btn"
                        onClick={() => setWeekOffset(weekOffset + 1)}
                    >
                        ←
                    </button>
                    <span className="week-range">
                        {formatDateShort(weekRange.start)} ~ {formatDateShort(weekRange.end)}
                    </span>
                    <button
                        className="week-nav-btn"
                        onClick={() => setWeekOffset(weekOffset - 1)}
                        disabled={weekOffset === 0}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* 本週紀錄 */}
            <div className="week-record">
                <span className="week-label">這週總共跑了</span>
                <div className="week-value">
                    {weekTotalMinutes}
                    <span className="week-unit">分鐘</span>
                </div>
            </div>

            {/* 長條圖 */}
            {isLoading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="bar-chart">
                    {weekDays.map((day, index) => {
                        const dateKey = formatDateKey(day);
                        const minutes = historyData[dateKey] || 0;
                        const heightPercent = (minutes / maxMinutes) * 100;

                        return (
                            <div key={dateKey} className="bar-item">
                                <span className="bar-value">
                                    {minutes}
                                </span>
                                <div className="bar-fill-container">
                                    <div
                                        className={`bar-fill ${isToday(day) ? 'today' : ''}`}
                                        style={{ height: `${heightPercent}%` }}
                                    />
                                </div>
                                <span className="bar-label">{WEEKDAY_LABELS[index]}</span>
                                <span className="bar-date">{`${day.getMonth() + 1}/${day.getDate()}`}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
