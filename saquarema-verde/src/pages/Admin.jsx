import { useState } from "react";
import { useData, update, uid } from "../store";
import { defImg, readImg } from "../ui";

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

function Crud({ title, k, list, fields, defaults = {}, noList }) {
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
      update((d) => ({ ...d, [k]: [...d[k], { id: uid(), ...defaults, ...f }] }));
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
      {!noList && (
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
      )}
      <SaveBar show={dirty} onSave={() => submit()} onCancel={reset} />
    </section>
  );
}

function AlertBox({ alert }) {
  const [al, setAl] = useState(alert);
  const [m, setM] = useState("");
  const dirty = al.text !== alert.text || al.active !== alert.active;
  const save = () => { update((d) => ({ ...d, alert: al })); setM("Aviso salvo!"); };
  return (
    <section className="card">
      <h2>Faixa de aviso no topo do site</h2>
      <label>Texto do aviso<input value={al.text} onChange={(e) => setAl({ ...al, text: e.target.value })} /></label>
      <label className="chk"><input type="checkbox" checked={al.active} onChange={(e) => setAl({ ...al, active: e.target.checked })} /> Exibir no topo do site</label>
      {m && !dirty && <p role="status" className="okmsg">{m}</p>}
      <SaveBar show={dirty} onSave={save} onCancel={() => setAl(alert)} />
    </section>
  );
}

function Reports({ reports }) {
  const set = (id, p) => update((d) => ({ ...d, reports: d.reports.map((r) => (r.id === id ? { ...r, ...p } : r)) }));
  const del = (id) => update((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) }));
  return (
    <section className="card">
      <h2>Relatos de visitantes</h2>
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

const TEXT = [["hours", "Horário"], ["condition", "Condição"], ["image", "Capa (/img/arquivo.jpg ou URL)"], ["location", "Local no mapa (endereço ou lat,lng)"]];

export default function Admin() {
  const { attractions, events, seasons, news, alert, reports = [] } = useData();
  const [ed, setEd] = useState({});
  const [msg, setMsg] = useState("");
  const draft = attractions.map((a) => ({ ...a, ...ed[a.id] }));
  const dirty = Object.keys(ed).length > 0;
  const change = (id, p) => { setEd((e) => ({ ...e, [id]: { ...e[id], ...p } })); setMsg(""); };
  const save = () => {
    const ok = update((d) => ({ ...d, attractions: d.attractions.map((a) => ({ ...a, ...ed[a.id] })) }));
    setEd({});
    setMsg(ok ? "Alterações salvas!" : "Não foi possível salvar: armazenamento do navegador cheio. Use fotos menores ou remova algumas.");
  };
  const up = async (e, a, cover) => {
    const t = e.target, f = t.files[0];
    if (!f) return;
    try {
      const u = await readImg(f);
      change(a.id, cover ? { image: u } : { gallery: [...(a.gallery || []), u] });
    } catch { setMsg("Não foi possível ler a imagem."); }
    t.value = "";
  };
  const del = (a) => {
    if (!window.confirm(`Excluir "${a.name}"?`)) return;
    update((d) => ({ ...d, attractions: d.attractions.filter((x) => x.id !== a.id) }));
    setEd((e) => { const n = { ...e }; delete n[a.id]; return n; });
  };

  const today = new Date().toLocaleDateString("sv-SE");
  const stats = [
    ["Atrações abertas", `${attractions.filter((a) => a.status === "Aberta").length}/${attractions.length}`],
    ["Eventos futuros", events.filter((e) => e.date >= today).length],
    ["Relatos novos", reports.filter((r) => r.status === "Novo").length],
    ["Aviso no ar", alert?.active && alert.text ? "Sim" : "Não"],
  ];

  return (
    <>
      <h1>Painel do administrador</h1>
      <div className="stats">{stats.map(([k, v]) => <div key={k}><strong>{v}</strong><span>{k}</span></div>)}</div>

      <AlertBox alert={alert || { active: false, text: "" }} />

      <section className="card">
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
                value={k === "image" && (a.image || "").startsWith("data:") ? "(foto enviada)" : a[k] || ""}
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

      <Crud title="Nova atração" k="attractions" list={[]} noList
        defaults={{ status: "Aberta", condition: "A informar", image: "/img/parque.svg", gallery: [] }}
        fields={[
          { k: "name", l: "Nome" }, { k: "area", l: "Área", opts: ["PECS", "REE Jacarepiá"] },
          { k: "type", l: "Tipo", opts: ["Trilha", "Cachoeira", "Biodiversidade", "Parque"] },
          { k: "difficulty", l: "Dificuldade", opts: ["Fácil", "Moderada", "Difícil", "Variada"] },
          { k: "distance", l: "Distância" }, { k: "hours", l: "Horário" }, { k: "location", l: "Local no mapa" },
          { k: "desc", l: "Descrição" }, { k: "tips", l: "Dicas de segurança" }, { k: "rules", l: "Regras" },
        ]} />

      <Reports reports={reports} />

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
