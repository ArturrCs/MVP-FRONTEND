import { useState } from "react";
import { useData, update, uid } from "../store";

const TIPOS = ["Lixo", "Árvore caída", "Sinalização danificada", "Trilha interditada", "Risco de segurança", "Outro"];

export default function Relatar() {
  const { attractions } = useData();
  const [ok, setOk] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    update((s) => ({ ...s, reports: [{ id: uid(), date: new Date().toLocaleDateString("sv-SE"), status: "Novo", ...d }, ...(s.reports || [])] }));
    e.target.reset();
    setOk(true);
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Relatar problema na trilha</h1>
      <label>Atração<select name="place" required>{attractions.map((a) => <option key={a.id}>{a.name}</option>)}</select></label>
      <label>Tipo<select name="type">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Descrição<textarea name="text" required rows="4" maxLength="500" /></label>
      <label>Contato (opcional)<input name="contact" placeholder="E-mail ou telefone, se quiser retorno" /></label>
      <button className="btn">Enviar relato</button>
      {ok && <p role="status" className="okmsg">Relato enviado. Obrigado por ajudar a cuidar do circuito!</p>}
      <p className="hint">Não inclua dados pessoais de terceiros.</p>
    </form>
  );
}
