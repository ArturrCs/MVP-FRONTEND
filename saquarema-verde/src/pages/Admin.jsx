import { useState } from "react";
import { useData, add, patch, remove, uploadImage } from "../store";
import { defImg } from "../ui";

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

function Crud({ id, title, k, list, fields, defaults = {}, noList }) {
  const empty = Object.fromEntries(fields.map((x) => [x.k, x.opts ? x.opts[0] : ""]));
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const orig = list.find((i) => i.id === editId);
  const dirty = !!orig && fields.some((x) => (orig[x.k] ?? "") !== f[x.k]);
  const reset = () => { setF(empty); setEditId(null); };

  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (fields.some((x) => !x.opt && !String(f[x.k]).trim())) return setMsg("Preencha todos os campos.");
    setBusy(true);
    try {
      if (editId) { await patch(k, editId, f); setMsg("Alteração salva!"); }
      else { await add(k, { ...defaults, ...f }); setMsg("Item adicionado!"); }
      reset();
    } catch (x) { setMsg("Erro: " + x.message); }
    finally { setBusy(false); }
  };
  const edit = (i) => { setEditId(i.id); setF(Object.fromEntries(fields.map((x) => [x.k, i[x.k] ?? ""]))); setMsg(""); };
  const del = async (id) => {
    if (!window.confirm("Remover este item?")) return;
    try { await remove(k, id); if (id === editId) reset(); } catch (x) { setMsg("Erro: " + x.message); }
  };

  return (
    <section className="card" id={id}>
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
          {!editId && <button className="btn" disabled={busy}>Adicionar</button>}
          {editId && <button type="button" className="btn ghost" onClick={reset}>Cancelar edição</button>}
        </div>
      </form>
      {msg && <p role="status" className="okmsg">{msg}</p>}
      {!noList && (
        <ul className="list">
          {list.map((i) => (
            <li key={i.id}>
              <span>{fields.map((x) => i[x.k]).filter(Boolean).join(" · ")}</span>
              <span className="actions">
                <button className="link ed" onClick={() => edit(i)}>Editar</button>
                <button className="link" onClick={() => del(i.id)}>Remover</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <SaveBar show={dirty} onSave={() => submit()} onCancel={reset} />
    </section>
  );
}

function Avisos({ alerts }) {
  const [t, setT] = useState("");
  const [err, setErr] = useState("");
  const run = async (fn) => { setErr(""); try { await fn(); } catch (x) { setErr("Erro: " + x.message); } };
  const set = (id, p) => run(() => patch("alerts", id, p));
  const create = (e) => {
    e.preventDefault();
    if (!t.trim()) return;
    run(async () => { await add("alerts", { active: true, text: t.trim() }); setT(""); });
  };
  return (
    <section className="card" id="avisos">
      <h2>Avisos da página principal</h2>
      <p className="hint">Com 2 ou mais avisos ativos, eles se alternam automaticamente.</p>
      <form onSubmit={create} className="form">
        <label>Novo aviso<input value={t} onChange={(e) => setT(e.target.value)} /></label>
        <div className="actions"><button className="btn">Adicionar aviso</button></div>
      </form>
      {err && <p role="alert" className="err">{err}</p>}
      <ul className="list">
        {alerts.map((x) => (
          <li key={x.id}>
            <span>{x.text}</span>
            <span className="actions">
              <label className="chk"><input type="checkbox" checked={x.active} onChange={(e) => set(x.id, { active: e.target.checked })} /> Exibir</label>
              <button className="link" onClick={() => run(() => remove("alerts", x.id))}>Remover</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reports({ reports }) {
  const [err, setErr] = useState("");
  const run = async (fn) => { setErr(""); try { await fn(); } catch (x) { setErr("Erro: " + x.message); } };
  const set = (id, p) => run(() => patch("reports", id, p));
  const del = (id) => window.confirm("Excluir este relato?") && run(() => remove("reports", id));
  return (
    <section className="card" id="relatos">
      <h2>Relatos de visitantes</h2>
      {err && <p role="alert" className="err">{err}</p>}
      {!reports.length && <p>Nenhum relato recebido.</p>}
      <ul className="list">
        {reports.map((r) => (
          <li key={r.id}>
            <span><strong>{r.type}</strong> · {r.place} · {r.date} · {r.status}<br />{r.text}{r.contact && <><br />Contato: {r.contact}</>}</span>
            <span className="actions">
              {r.status === "Novo" && <button className="link ed" onClick={() => set(r.id, { status: "Resolvido" })}>Marcar resolvido</button>}
              <button className="link" onClick={() => del(r.id)}>Excluir</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TEXT = [["hours", "Horário"], ["condition", "Condição"], ["address", "Endereço (aparece no perfil e no mapa)"], ["image", "Capa (/img/arquivo.jpg ou URL)"], ["location", "Local no mapa (endereço ou lat,lng)"]];

const TOPICS = [["avisos", "Avisos"], ["atracoes", "Atrações"], ["nova", "Nova atração"], ["relatos", "Relatos"], ["eventos", "Eventos"], ["temporadas", "Temporadas"], ["novidades", "Novidades"]];

export default function Admin() {
  const { attractions, events, seasons, news, alerts = [], reports = [] } = useData();
  const [ed, setEd] = useState({});
  const [msg, setMsg] = useState("");
  const draft = attractions.map((a) => ({ ...a, ...ed[a.id] }));
  const dirty = Object.keys(ed).length > 0;
  const change = (id, p) => { setEd((e) => ({ ...e, [id]: { ...e[id], ...p } })); setMsg(""); };
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const left = { ...ed };
    let fail = "";
    for (const [id, p] of Object.entries(ed)) {
      try { await patch("attractions", Number(id), p); delete left[id]; }
      catch (x) { fail = x.message; }
    }
    setEd(left);
    setBusy(false);
    setMsg(fail ? "Erro ao salvar: " + fail : "Alterações salvas!");
  };
  const up = async (e, a, cover) => {
    const t = e.target, f = t.files[0];
    if (!f) return;
    setMsg("Enviando foto…");
    try {
      const u = await uploadImage(f);
      change(a.id, cover ? { image: u } : { gallery: [...(a.gallery || []), u] });
      setMsg("Foto enviada. Clique em “Salvar alteração” para publicar.");
    } catch (x) { setMsg("Erro no envio da foto: " + x.message); }
    t.value = "";
  };
  const del = async (a) => {
    if (!window.confirm(`Excluir "${a.name}"?`)) return;
    try {
      await remove("attractions", a.id);
      setEd((e) => { const n = { ...e }; delete n[a.id]; return n; });
    } catch (x) { setMsg("Erro: " + x.message); }
  };

  const today = new Date().toLocaleDateString("sv-SE");
  const stats = [
    ["Atrações abertas", `${attractions.filter((a) => a.status === "Aberta").length}/${attractions.length}`],
    ["Eventos futuros", events.filter((e) => e.date >= today).length],
    ["Relatos novos", reports.filter((r) => r.status === "Novo").length],
    ["Avisos no ar", alerts.filter((x) => x.active && x.text).length],
  ];

  return (
    <>
      <section className="panel">
        <div className="stats">
          <div className="stat-title"><h1>Painel do Administrador</h1><span>Gerencie o conteúdo do site</span></div>
          {stats.map(([k, v]) => <div key={k}><strong>{v}</strong><span>{k}</span></div>)}
        </div>
      </section>
      <nav className="quick" aria-label="Ir para um tópico">
        {TOPICS.map(([id, l]) => (
          <button key={id} className="btn sm" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{l}</button>
        ))}
      </nav>

      <Avisos alerts={alerts} />

      <section className="card" id="atracoes">
        <h2>Atrações</h2>
        {draft.map((a) => (
          <div className="row" key={a.id}>
            <strong className="full">{a.name}</strong>
            <select aria-label="Status" value={a.status} onChange={(e) => change(a.id, { status: e.target.value })}>
              {["Aberta", "Atenção", "Fechada"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select aria-label="Dificuldade" value={a.difficulty} onChange={(e) => change(a.id, { difficulty: e.target.value })}>
              {["Fácil", "Moderada", "Difícil", "Variada"].map((o) => <option key={o}>{o}</option>)}
            </select>
            {TEXT.map(([k, l]) => (
              <input key={k} aria-label={l} placeholder={l}
                value={a[k] || ""}
                onChange={(e) => change(a.id, { [k]: e.target.value })} />
            ))}
            <label className="file">Enviar nova capa<input type="file" accept="image/*" onChange={(e) => up(e, a, true)} /></label>
            <label className="file">Adicionar foto à galeria<input type="file" accept="image/*" onChange={(e) => up(e, a, false)} /></label>
            <div className="full photos">
              {[a.image, ...(a.gallery || [])].map((src, i) =>
                (i > 0 || !/\.svg$/.test(src || "")) && (
                  <figure className="gthumb" key={i}>
                    <img src={src} alt={i === 0 ? "Capa" : `Foto ${i} da galeria`} />
                    <figcaption>{i === 0 ? "Capa" : `Galeria ${i}`}</figcaption>
                    <button type="button" className="del"
                      onClick={() => change(a.id, i === 0 ? { image: defImg(a) } : { gallery: a.gallery.filter((_, j) => j !== i - 1) })}>
                      🗑 Excluir
                    </button>
                  </figure>
                )
              )}
            </div>
            <div className="full actions">
              <button type="button" className="del" onClick={() => del(a)}>🗑 Excluir atração</button>
            </div>
          </div>
        ))}
        {msg && <p role="status" className="okmsg">{msg}</p>}
        <SaveBar show={dirty} onSave={save} onCancel={() => setEd({})} />
      </section>

      <Crud id="nova" title="Nova atração" k="attractions" list={[]} noList
        defaults={{ status: "Aberta", condition: "A informar", image: "/img/parque.svg", gallery: [] }}
        fields={[
          { k: "name", l: "Nome" }, { k: "area", l: "Área", opts: ["PECS", "REE Jacarepiá", "Saquarema"] },
          { k: "type", l: "Tipo", opts: ["Trilha", "Cachoeira", "Biodiversidade", "Parque", "Mirante", "Praia"] },
          { k: "difficulty", l: "Dificuldade", opts: ["Fácil", "Moderada", "Difícil", "Variada"] },
          { k: "distance", l: "Distância" }, { k: "hours", l: "Horário" }, { k: "location", l: "Local no mapa" }, { k: "address", l: "Endereço", opt: true },
          { k: "desc", l: "Descrição" }, { k: "tips", l: "Dicas de segurança" }, { k: "rules", l: "Regras" },
        ]} />

      <Reports reports={reports} />

      <Crud id="eventos" title="Eventos" k="events" list={events} fields={[
        { k: "title", l: "Título" }, { k: "date", l: "Data", t: "date" }, { k: "time", l: "Horário" },
        { k: "place", l: "Local" }, { k: "address", l: "Endereço do local (opcional)", opt: true }, { k: "status", l: "Status", opts: ["Aberto", "Lotado", "Cancelado"] },
      ]} />
      <Crud id="temporadas" title="Temporadas" k="seasons" list={seasons} fields={[
        { k: "name", l: "Nome" }, { k: "from", l: "Início", t: "date" }, { k: "to", l: "Fim", t: "date" }, { k: "hours", l: "Horário" },
      ]} />
      <Crud id="novidades" title="Novidades" k="news" list={news} fields={[{ k: "title", l: "Título" }, { k: "text", l: "Texto" }]} />
    </>
  );
}
