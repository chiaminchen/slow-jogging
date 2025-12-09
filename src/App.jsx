import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { TimerSetup } from './components/TimerSetup';
import { RunningView } from './components/RunningView';
import { HistoryView } from './components/HistoryView';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('setup'); // 'setup' | 'running' | 'history'
  const [duration, setDuration] = useState(10); // 分鐘
  const [bpm, setBpm] = useState(180);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleStartRun = () => {
    setView('running');
  };

  const handleCompleteRun = () => {
    setView('setup');
  };

  const handleStopRun = () => {
    setView('setup');
  };

  const handleShowHistory = () => {
    setView('history');
  };

  const handleBackFromHistory = () => {
    setView('setup');
  };

  // 未登入：顯示登入頁面
  if (!isLoggedIn) {
    return (
      <div className="app">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  // 已登入：根據 view 狀態顯示不同畫面
  return (
    <div className="app">
      {view === 'setup' && (
        <TimerSetup
          duration={duration}
          setDuration={setDuration}
          bpm={bpm}
          setBpm={setBpm}
          onStart={handleStartRun}
          onShowHistory={handleShowHistory}
        />
      )}

      {view === 'running' && (
        <RunningView
          duration={duration}
          bpm={bpm}
          onComplete={handleCompleteRun}
          onStop={handleStopRun}
        />
      )}

      {view === 'history' && (
        <HistoryView onBack={handleBackFromHistory} />
      )}
    </div>
  );
}

export default App;
