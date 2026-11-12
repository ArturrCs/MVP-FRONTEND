import { useData, toggleEv, useEvs } from "../store";
import { Badge, eventMapUrl, fmt } from "../ui";

export default function Eventos() {
  const { events, seasons } = useData();
  const evs = useEvs();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <h1>Eventos</h1>
      <section className="panel">
        <div className="grid">
          {sorted.map((e) => {
            const on = evs.includes(e.id);
            const closed = e.status !== "Aberto";
            return (
              <article className="card" key={e.id}>
                <Badge s={e.status} />
                <h3>{e.title}</h3>
                <p className="meta">📅 {fmt(e.date)} · 🕘 {e.time} · <a className="maplink" href={eventMapUrl(e)} target="_blank" rel="noopener noreferrer" title="Abrir no Google Maps">📍 {e.place}</a></p>
                {on ? (
                  <div className="actions">
                    <span className="okmsg">✅ Você está inscrito</span>
                    <button className="btn ghost sm" onClick={() => toggleEv(e.id)}>Cancelar inscrição</button>
                  </div>
                ) : (
                  <button className="btn fav sm" disabled={closed} onClick={() => toggleEv(e.id)}>{closed ? "Indisponível" : "Participar"}</button>
                )}
              </article>
            );
          })}
          {!sorted.length && <p>Nenhum evento programado.</p>}
        </div>
      </section>

      <section className="panel">
        <h2>Funcionamento por temporada</h2>
        <ul className="list">
          {seasons.map((s) => (
            <li key={s.id}><strong>{s.name}</strong>: {fmt(s.from)} a {fmt(s.to)} · {s.hours}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
