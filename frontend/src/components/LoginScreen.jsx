import { useState } from "react";

const DEFAULT_EMAIL = "admin@possum.com";
const DEFAULT_PASSWORD = "admin";

export default function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD
  });
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (
      form.email.trim().toLowerCase() !== DEFAULT_EMAIL ||
      form.password !== DEFAULT_PASSWORD
    ) {
      setError("Email atau password salah. Gunakan kredensial testing default.");
      return;
    }

    setError("");
    onLogin({
      email: DEFAULT_EMAIL,
      role: "owner"
    });
  }

  return (
    <div className="login-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <section className="login-card">
        <div className="login-copy">
          <div className="login-brand">
            <img
              alt="Possum icon"
              className="login-brand__icon"
              src="/logo-possum-icon.svg"
            />
            <img
              alt="Possum wordmark"
              className="login-brand__wordmark"
              src="/logo-possum-wordmark.svg"
            />
          </div>
          <p className="eyebrow">Possum Access</p>
          <h1>Masuk dulu sebelum mengelola toko.</h1>
          <p className="hero-copy">
            Ini login sementara untuk testing frontend. Nanti bisa diganti ke
            endpoint auth backend yang proper.
          </p>

          <div className="login-hint">
            <span>Email testing</span>
            <strong>{DEFAULT_EMAIL}</strong>
            <span>Password testing</span>
            <strong>{DEFAULT_PASSWORD}</strong>
          </div>
        </div>

        <form className="glass-card login-form" onSubmit={handleSubmit}>
          <div className="glass-card__header">
            <div>
              <p className="eyebrow">Owner login</p>
              <h2>Masuk ke dashboard</h2>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Email
              <input
                autoComplete="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Password
              <input
                autoComplete="current-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                required
              />
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" type="submit">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}
