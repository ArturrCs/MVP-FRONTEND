import { Link } from "react-router-dom";
import { useData, useFavs, useEvs, toggleFav, toggleEv } from "../store";
import { AttractionCard, Badge, eventMapUrl, fmt } from "../ui";

export default function Roteiro() {
  const { attractions, events } = useData();
  const favs = useFavs();
  const evs = useEvs();
  const list = attractions.filter((a) => favs.includes(a.id));
  const myEv = events.filter((e) => evs.includes(e.id)).sort((a, b) => a.date.localeCompare(b.date));
  const txt = "Meu roteiro no Saquarema Verde:\n"
    + list.map((a, i) => `${i + 1}. ${a.name}`).join("\n")
    + (myEv.length ? "\nEventos:\n" + myEv.map((e) => `• ${fmt(e.date)} ${e.time} ${e.title}`).join("\n") : "")
    + "\n" + window.location.origin;
  const wa = `https://wa.me/?text=${encodeURIComponent(txt)}`;
  const clear = () => { [...favs].forEach(toggleFav); [...evs].forEach(toggleEv); };

  if (!list.length && !myEv.length)
    return (
      <>
        <h1>Meu roteiro</h1>
        <p>Seu roteiro está vazio. Adicione <Link to="/atracoes">atrações</Link> ou escolha <Link to="/eventos">eventos para participar</Link>.</p>
      </>
    );
  return (
    <>
      <h1>Meu roteiro</h1>
      {!!list.length && (<section className="panel"><h2>Atrações</h2><div className="grid">{list.map((a) => <AttractionCard key={a.id} a={a} />)}</div></section>)}
      {!!myEv.length && (
        <section className="panel">
          <h2>Eventos que vou participar</h2>
          <ul className="list">
            {myEv.map((e) => (
              <li key={e.id}>
                <span><strong>{fmt(e.date)}</strong> · {e.time} · {e.title} · <a className="maplink" href={eventMapUrl(e)} target="_blank" rel="noopener noreferrer">📍 {e.place}</a> <Badge s={e.status} /></span>
                <button className="btn ghost sm" onClick={() => toggleEv(e.id)}>Cancelar inscrição</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="panel"><div className="actions">
        <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a>
        <button className="btn ghost" onClick={clear}>Limpar roteiro</button>
      </div></section>
    </>
  );
}
