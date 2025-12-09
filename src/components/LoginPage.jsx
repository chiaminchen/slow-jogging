import { useState } from 'react';

export function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const validUsername = import.meta.env.VITE_USERNAME;
        const validPassword = import.meta.env.VITE_PASSWORD;

        if (username === validUsername && password === validPassword) {
            onLogin();
        } else {
            setError('使用者名稱或密碼錯誤');
        }
    };

    return (
        <div className="card" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h1 className="page-title">
                <img src="/run.png" alt="跑步" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                超慢跑計時器
            </h1>

            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                    <label className="input-label" htmlFor="username">使用者名稱</label>
                    <input
                        id="username"
                        type="text"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="請輸入使用者名稱"
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="password">密碼</label>
                    <input
                        id="password"
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="請輸入密碼"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg">
                    開始使用
                </button>
            </form>
        </div>
    );
}
