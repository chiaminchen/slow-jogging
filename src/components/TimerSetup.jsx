import runIcon from '../assets/run.png';
import { resetAudioContext } from '../utils/helpers';

export function TimerSetup({ duration, setDuration, bpm, setBpm, onStart, onShowHistory }) {
    // 處理開始按鈕點擊 - 在用戶互動事件中重建 AudioContext（iOS Safari 螢幕休眠後需要）
    const handleStart = () => {
        resetAudioContext();
        onStart();
    };
    const minDuration = 5;
    const maxDuration = 120;
    const minBpm = 120;
    const maxBpm = 220;

    return (
        <div className="card">
            <h1 className="page-title">
                <img src={runIcon} alt="跑步" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                超慢跑計時器
            </h1>

            {/* 導航標籤 */}
            <div className="nav-tabs">
                <button className="nav-tab active">計時設定</button>
                <button className="nav-tab" onClick={onShowHistory}>歷史紀錄</button>
            </div>

            {/* 時間設定 */}
            <div className="setting-control">
                <span className="setting-label">跑步時間</span>
                <div className="setting-value">
                    <button
                        className="setting-btn"
                        onClick={() => setDuration(Math.max(minDuration, duration - 5))}
                        disabled={duration <= minDuration}
                    >
                        −
                    </button>
                    <span className="setting-display">{duration} 分鐘</span>
                    <button
                        className="setting-btn"
                        onClick={() => setDuration(Math.min(maxDuration, duration + 5))}
                        disabled={duration >= maxDuration}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* 步頻設定 */}
            <div className="setting-control">
                <span className="setting-label">步頻 (BPM)</span>
                <div className="setting-value">
                    <button
                        className="setting-btn"
                        onClick={() => setBpm(Math.max(minBpm, bpm - 10))}
                        disabled={bpm <= minBpm}
                    >
                        −
                    </button>
                    <span className="setting-display">{bpm} BPM</span>
                    <button
                        className="setting-btn"
                        onClick={() => setBpm(Math.min(maxBpm, bpm + 10))}
                        disabled={bpm >= maxBpm}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* 開始按鈕 */}
            <button
                onClick={handleStart}
                className="btn btn-success btn-block btn-lg"
                style={{ marginTop: 'var(--space-xl)' }}
            >
                開始跑步
            </button>
        </div>
    );
}
