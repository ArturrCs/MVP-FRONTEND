import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store";

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    if (login(d.get("email"), d.get("pass"))) { onLogin(); nav("/admin"); }
    else setErr("E-mail ou senha inválidos.");
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Área do administrador</h1>
      <label>E-mail<input name="email" type="email" required autoComplete="username" /></label>
      <label>Senha<input name="pass" type="password" required autoComplete="current-password" /></label>
      {err && <p role="alert" className="err">{err}</p>}
      <button className="btn">Entrar</button>
    </form>
  );
}
