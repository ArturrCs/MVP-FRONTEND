import { Link } from "react-router-dom";
import { useData } from "../store";
import { AttractionCard, Badge, fmt } from "../ui";

export default function Home() {
  const { attractions, events, news } = useData();
  const today = new Date().toLocaleDateString("sv-SE");
  const next = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  return (
    <>
      <h2>Em destaque</h2>
      <div className="grid">{attractions.slice(0, 3).map((a) => <AttractionCard key={a.id} a={a} />)}</div>

      <h2>Novidades</h2>
      <div className="grid">
        {news.map((n) => <article className="card" key={n.id}><h3>{n.title}</h3><p>{n.text}</p></article>)}
      </div>

      <h2>Próximos eventos</h2>
      <ul className="list">
        {next.map((e) => <li key={e.id}><span><strong>{fmt(e.date)}</strong> · {e.time} · {e.title}</span> <Badge s={e.status} /></li>)}
        {!next.length && <li>Nenhum evento futuro cadastrado.</li>}
      </ul>
      <Link to="/eventos" className="btn">Ver todos os eventos →</Link>
    </>
  );
}
