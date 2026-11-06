import { useData } from "../store";
import { Badge, fmt } from "../ui";

export default function Eventos() {
  const { events, seasons } = useData();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <h1>Eventos</h1>
      <div className="grid">
        {sorted.map((e) => (
          <article className="card" key={e.id}>
            <Badge s={e.status} />
            <h3>{e.title}</h3>
            <p className="meta">📅 {fmt(e.date)} · 🕘 {e.time} · 📍 {e.place}</p>
          </article>
        ))}
        {!sorted.length && <p>Nenhum evento programado.</p>}
      </div>

      <h2>Funcionamento por temporada</h2>
      <ul className="list">
        {seasons.map((s) => (
          <li key={s.id}><strong>{s.name}</strong>: {fmt(s.from)} a {fmt(s.to)} · {s.hours}</li>
        ))}
      </ul>
    </>
  );
}
