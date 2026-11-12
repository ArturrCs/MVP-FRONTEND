import { useState } from "react";
import { useData, add, demoMode } from "../store";

const TIPOS = ["Lixo", "Árvore caída", "Sinalização danificada", "Trilha interditada", "Risco de segurança", "Outro"];

export default function Relatar() {
  const { attractions } = useData();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const d = Object.fromEntries(new FormData(form));
    setBusy(true); setErr(""); setOk(false);
    try {
      await add("reports", { place: d.place, type: d.type, text: d.text, contact: d.contact || "", status: "Novo" });
      form.reset();
      setOk(true);
    } catch (x) {
      setErr(demoMode ? "Modo demonstração: o relato não foi enviado de verdade." : "Não foi possível enviar agora. Tente novamente.");
    } finally { setBusy(false); }
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Relatar problema na trilha</h1>
      <label>Atração<select name="place" required>{attractions.map((a) => <option key={a.id}>{a.name}</option>)}</select></label>
      <label>Tipo<select name="type">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Descrição<textarea name="text" required rows="4" maxLength="500" /></label>
      <label>Contato (opcional)<input name="contact" placeholder="E-mail ou telefone, se quiser retorno" /></label>
      <button className="btn" disabled={busy}>{busy ? "Enviando…" : "Enviar relato"}</button>
      {err && <p role="alert" className="err">{err}</p>}
      {ok && <p role="status" className="okmsg">Relato enviado. Obrigado por ajudar a cuidar do circuito!</p>}
      <p className="hint">Não inclua dados pessoais de terceiros.</p>
    </form>
  );
}
