import { useState } from "react";
import { useData, update, uid } from "../store";

// Botão flutuante central: aparece só quando há alteração não salva
function SaveBar({ show, onSave, onCancel }) {
  if (!show) return null;
  return (
    <div className="savebar" role="region" aria-label="Salvar alterações">
      <span>Você tem alterações não salvas</span>
      <button className="btn" onClick={onSave}>Salvar alteração</button>
      <button className="btn ghost" onClick={onCancel}>Descartar</button>
    </div>
  );
}

function Crud({ title, k, list, fields }) {
  const empty = Object.fromEntries(fields.map((x) => [x.k, x.opts ? x.opts[0] : ""]));
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const orig = list.find((i) => i.id === editId);
  const dirty = !!orig && fields.some((x) => orig[x.k] !== f[x.k]);
  const reset = () => { setF(empty); setEditId(null); };

  const submit = (e) => {
    e?.preventDefault();
    if (fields.some((x) => !String(f[x.k]).trim())) return setMsg("Preencha todos os campos.");
    if (editId) {
      update((d) => ({ ...d, [k]: d[k].map((i) => (i.id === editId ? { ...i, ...f } : i)) }));
      setMsg("Alteração salva!");
    } else {
      update((d) => ({ ...d, [k]: [...d[k], { id: uid(), ...f }] }));
      setMsg("Item adicionado!");
    }
    reset();
  };
  const edit = (i) => { setEditId(i.id); setF(Object.fromEntries(fields.map((x) => [x.k, i[x.k]]))); setMsg(""); };
  const del = (id) => { update((d) => ({ ...d, [k]: d[k].filter((i) => i.id !== id) })); if (id === editId) reset(); };

  return (
    <section className="card">
      <h2>{title}</h2>
      <form onSubmit={submit} className="form">
        {fields.map((x) => (
          <label key={x.k}>{x.l}
            {x.opts ? (
              <select value={f[x.k]} onChange={(e) => setF({ ...f, [x.k]: e.target.value })}>
                {x.opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input type={x.t || "text"} value={f[x.k]} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="actions">
          {!editId && <button className="btn">Adicionar</button>}
          {editId && <button type="button" className="btn ghost" onClick={reset}>Cancelar edição</button>}
        </div>
      </form>
      {msg && <p role="status" className="okmsg">{msg}</p>}
      <ul className="list">
        {list.map((i) => (
          <li key={i.id}>
            <span>{fields.map((x) => i[x.k]).join(" · ")}</span>
            <span className="actions">
              <button className="link ed" onClick={() => edit(i)}>Editar</button>
              <button className="link" onClick={() => del(i.id)}>Remover</button>
            </span>
          </li>
        ))}
      </ul>
      <SaveBar show={dirty} onSave={() => submit()} onCancel={reset} />
    </section>
  );
}

const TEXT = [["hours", "Horário"], ["condition", "Condição"], ["image", "Imagem (/img/arquivo.jpg ou URL)"], ["location", "Local no mapa (endereço ou lat,lng)"]];

export default function Admin() {
  const { attractions, events, seasons, news } = useData();
  const [draft, setDraft] = useState(attractions);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(attractions);
  const change = (id, p) => { setDraft((l) => l.map((a) => (a.id === id ? { ...a, ...p } : a))); setSaved(false); };
  const save = () => { update((d) => ({ ...d, attractions: draft })); setSaved(true); };

  return (
    <>
      <h1>Painel do administrador</h1>
      <section className="card">
        <h2>Atrações</h2>
        {draft.map((a) => (
          <div className="row" key={a.id}>
            <strong className="full">{a.name}</strong>
            <select aria-label="Status" value={a.status} onChange={(e) => change(a.id, { status: e.target.value })}>
              {["Aberta", "Atenção", "Fechada"].map((o) => <option key={o}>{o}</option>)}
            </select>
            {TEXT.map(([k, l]) => (
              <input key={k} aria-label={l} placeholder={l} value={a[k] || ""} onChange={(e) => change(a.id, { [k]: e.target.value })} />
            ))}
          </div>
        ))}
        {saved && !dirty && <p role="status" className="okmsg">Alterações salvas!</p>}
        <SaveBar show={dirty} onSave={save} onCancel={() => setDraft(attractions)} />
      </section>

      <Crud title="Eventos" k="events" list={events} fields={[
        { k: "title", l: "Título" }, { k: "date", l: "Data", t: "date" }, { k: "time", l: "Horário" },
        { k: "place", l: "Local" }, { k: "status", l: "Status", opts: ["Aberto", "Lotado", "Cancelado"] },
      ]} />
      <Crud title="Temporadas" k="seasons" list={seasons} fields={[
        { k: "name", l: "Nome" }, { k: "from", l: "Início", t: "date" }, { k: "to", l: "Fim", t: "date" }, { k: "hours", l: "Horário" },
      ]} />
      <Crud title="Novidades" k="news" list={news} fields={[{ k: "title", l: "Título" }, { k: "text", l: "Texto" }]} />
    </>
  );
}
