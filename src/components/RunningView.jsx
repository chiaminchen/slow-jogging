import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime, playMetronomeSound, playCelebrationSound, initAudioContext } from '../utils/helpers';
import { saveRunRecord } from '../utils/api';

export function RunningView({ duration, bpm, onComplete, onStop }) {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isPaused, setIsPaused] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const timerRef = useRef(null);
    const metronomeRef = useRef(null);
    const startTimeRef = useRef(null);
    const pausedTimeRef = useRef(0);
    const wakeLockRef = useRef(null);

    const totalSeconds = duration * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const pulseDuration = 60000 / bpm; // 毫秒

    // 圓形進度條參數
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // 開始節拍器
    const startMetronome = useCallback(async () => {
        if (metronomeRef.current) {
            clearInterval(metronomeRef.current);
        }

        initAudioContext();
        // 先 await 確保 AudioContext 恢復（手機第二次跑步時需要）
        await playMetronomeSound();

        metronomeRef.current = setInterval(() => {
            playMetronomeSound();
        }, 60000 / bpm);
    }, [bpm]);

    // 停止節拍器
    const stopMetronome = useCallback(() => {
        if (metronomeRef.current) {
            clearInterval(metronomeRef.current);
            metronomeRef.current = null;
        }
    }, []);

    // 開始計時
    const startTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // 請求螢幕保持喚醒
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock 已啟用');
            } catch (err) {
                console.log('Wake Lock 請求失敗:', err);
            }
        }
    };

    // 釋放螢幕喚醒鎖定
    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                console.log('Wake Lock 已釋放');
            } catch (err) {
                console.log('Wake Lock 釋放失敗:', err);
            }
        }
    };

    // 初始化
    useEffect(() => {
        startTimer();
        startMetronome();
        requestWakeLock();

        // 處理頁面可見性變化（從背景回到前景時重新請求）
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !isPaused && !isCompleted) {
                requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (metronomeRef.current) clearInterval(metronomeRef.current);
            releaseWakeLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [startTimer, startMetronome]);

    // 完成處理
    useEffect(() => {
        if (timeLeft === 0 && !isCompleted) {
            setIsCompleted(true);
            stopMetronome();
            playCelebrationSound();

            // 儲存記錄
            setIsSaving(true);
            saveRunRecord(duration).then(() => {
                setIsSaving(false);
            });
        }
    }, [timeLeft, isCompleted, duration, stopMetronome]);

    // 暫停/繼續
    const togglePause = () => {
        if (isPaused) {
            // 繼續
            startTimer();
            startMetronome();
        } else {
            // 暫停
            if (timerRef.current) clearInterval(timerRef.current);
            stopMetronome();
            pausedTimeRef.current = timeLeft;
        }
        setIsPaused(!isPaused);
    };

    // 顯示結束確認
    const handleStop = () => {
        // 暫停計時器和節拍器
        if (timerRef.current) clearInterval(timerRef.current);
        stopMetronome();
        setShowConfirm(true);
    };

    // 確認結束
    const confirmStop = () => {
        setShowConfirm(false);
        onStop();
    };

    // 取消結束
    const cancelStop = () => {
        setShowConfirm(false);
        // 只有在之前不是暫停狀態時才繼續計時器和節拍器
        if (!isPaused) {
            startTimer();
            startMetronome();
        }
    };

    // 完成畫面
    if (isCompleted) {
        return (
            <div className="card">
                <div className="completion-screen">
                    <div className="completion-icon">🎉</div>
                    <h2 className="completion-title">太棒了！</h2>
                    <p className="completion-stats">
                        你完成了 {duration} 分鐘的超慢跑！
                    </p>
                    {isSaving ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <button onClick={onComplete} className="btn btn-primary btn-lg">
                            完成
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="timer-display">
                {/* 脈動指示器 */}
                <div
                    className={`pulse-indicator ${isPaused || showConfirm ? 'paused' : ''}`}
                    style={{ '--pulse-duration': `${pulseDuration}ms` }}
                />

                {/* 狀態文字 */}
                <div className={`timer-status ${isPaused || showConfirm ? 'paused' : 'running'}`}>
                    {isPaused || showConfirm ? '暫停' : '跑步中'}
                </div>

                {/* 圓形進度條 */}
                <div className="timer-circle">
                    <svg width="100%" height="100%" viewBox="0 0 220 220">
                        <defs>
                            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                        <circle
                            className="timer-circle-bg"
                            cx="110"
                            cy="110"
                            r={radius}
                        />
                        <circle
                            className="timer-circle-progress"
                            cx="110"
                            cy="110"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <div className="timer-time">{formatTime(timeLeft)}</div>
                </div>

                {/* 控制按鈕 */}
                <div className="controls">
                    <button
                        onClick={togglePause}
                        className={`btn ${isPaused ? 'btn-success' : 'btn-secondary'} btn-lg`}
                        disabled={showConfirm}
                    >
                        {isPaused ? '繼續' : '暫停'}
                    </button>
                    <button onClick={handleStop} className="btn btn-danger btn-lg" disabled={showConfirm}>
                        結束
                    </button>
                </div>
            </div>

            {/* 確認對話框 */}
            {showConfirm && (
                <div className="confirm-overlay">
                    <div className="confirm-dialog">
                        <p className="confirm-message">確定要結束跑步嗎？<br />這次紀錄將不會被儲存。</p>
                        <div className="confirm-actions">
                            <button onClick={cancelStop} className="btn btn-secondary">
                                取消
                            </button>
                            <button onClick={confirmStop} className="btn btn-danger">
                                確定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
