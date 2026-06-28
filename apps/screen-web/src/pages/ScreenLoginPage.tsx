import { FormEvent, useState } from "react";
import { screenApi } from "../api";

interface ScreenLoginPageProps {
  onLogin: () => void;
}

export function ScreenLoginPage({ onLogin }: ScreenLoginPageProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    try {
      const result = await screenApi.login({ username, password });
      localStorage.setItem("YANCAO_SCREEN_TOKEN", result.token);
      onLogin();
    } catch (error) {
      setError(error instanceof Error ? error.message : "登录失败，请检查账号密码或后端服务。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen-login-page">
      <section className="screen-login-visual">
        <div className="screen-login-copy">
          <h1>烟草病毒病人工智能监测预警大屏</h1>
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
          <button disabled={loading} type="submit">{loading ? "登录中..." : "登录大屏"}</button>
          <p className="screen-login-tip">请输入后端账号登录。</p>
        </form>
      </section>
    </main>
  );
}
