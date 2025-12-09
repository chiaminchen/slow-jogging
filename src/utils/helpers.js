// 音效工具 - 使用 Web Audio API
let audioContext = null;

// 初始化 AudioContext
export const initAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// 播放步頻節拍音效
export const playMetronomeSound = (frequency = 800, duration = 0.05) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

// 播放慶祝音效
export const playCelebrationSound = () => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // 播放上升的音階
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        }, index * 150);
    });
};

// 格式化時間顯示 (mm:ss)
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 格式化分鐘數顯示
export const formatMinutes = (minutes) => {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
};

// 取得當週日期範圍 (週日到週六)
export const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();

    // 取得該週週日
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    sunday.setHours(0, 0, 0, 0);

    // 取得該週週六
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return { start: sunday, end: saturday };
};

// 格式化日期為 YYYY-MM-DD
export const formatDateKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 格式化日期為 M/D
export const formatDateShort = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 星期幾標籤
export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
