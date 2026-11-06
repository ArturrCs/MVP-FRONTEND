import { Link } from "react-router-dom";

const tone = { Aberta: "ok", Aberto: "ok", Fechada: "bad", Cancelado: "bad", Lotado: "bad" };
export const Badge = ({ s }) => <span className={"badge " + (tone[s] || "warn")}>{s}</span>;
export const fmt = (d) => new Date(d + "T00:00").toLocaleDateString("pt-BR");

export const mapUrl = (a, embed) =>
  embed
    ? `https://www.google.com/maps?q=${encodeURIComponent(a.location)}&output=embed`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`;

// Se a imagem falhar (caminho errado), usa uma ilustração padrão
export const Img = (p) => (
  <img {...p} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/img/parque.svg"; }} />
);

export function AttractionCard({ a }) {
  return (
    <article className="acard">
      <Link to={`/atracoes/${a.id}`} className="alink">
        <div className="thumb">
          <Img src={a.image} alt="" loading="lazy" />
          <div className="preview" aria-hidden="true">
            <p>{a.desc}</p>
            <p>{a.distance} · {a.difficulty} · 🕘 {a.hours}</p>
            <strong>Ver perfil →</strong>
          </div>
        </div>
        <div className="abody">
          <Badge s={a.status} />
          <h3>{a.name}</h3>
          <p className="meta">{a.type} · {a.area}</p>
        </div>
      </Link>
      <a className="btn sm" href={mapUrl(a)} target="_blank" rel="noopener noreferrer">📍 Ver localização</a>
    </article>
  );
}
