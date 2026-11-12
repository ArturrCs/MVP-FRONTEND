import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store";

export default function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    setBusy(true); setErr("");
    try {
      await login(d.get("email"), d.get("pass"));
      nav("/admin");
    } catch (x) {
      setErr(x.message);
    } finally { setBusy(false); }
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Área do administrador</h1>
      <label>E-mail<input name="email" type="email" required autoComplete="username" /></label>
      <label>Senha<input name="pass" type="password" required autoComplete="current-password" /></label>
      {err && <p role="alert" className="err">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
