import { FormEvent, useState } from "react";

interface ScreenLoginPageProps {
  onLogin: () => void;
}

export function ScreenLoginPage({ onLogin }: ScreenLoginPageProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username !== "admin" || password !== "admin123") {
      setError("账号或密码不正确，请使用 admin / admin123 登录。");
      return;
    }

    localStorage.setItem("YANCAO_SCREEN_TOKEN", "mock-screen-token");
    setError("");
    onLogin();
  };

  return (
    <main className="screen-login-page">
      <section className="screen-login-visual">
        <div className="screen-login-copy">
          <h1>烟草病虫害监测与防治大屏</h1>
          <p>面向监测中心、植保人员和管理人员，集中展示烟田地块、病害预警、气象墒情、视频巡检和防治建议。</p>
        </div>
      </section>

      <section className="screen-login-card">
        <form onSubmit={handleSubmit}>
          <h2>大屏前台登录</h2>
          <label>
            账号
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入账号" />
          </label>
          <label>
            密码
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
            />
          </label>
          {error && <p className="screen-login-error">{error}</p>}
          <button type="submit">登录大屏</button>
          <p className="screen-login-tip">演示账号：admin / admin123</p>
        </form>
      </section>
    </main>
  );
}
