import { Link, useParams } from "react-router-dom";
import { useData } from "../store";
import { Badge, Img, mapUrl } from "../ui";

export default function Perfil() {
  const { id } = useParams();
  const { attractions } = useData();
  const a = attractions.find((x) => String(x.id) === id);
  if (!a) return <><p>Atração não encontrada.</p><Link to="/atracoes">← Voltar</Link></>;

  const facts = [["Tipo", a.type], ["Área", a.area], ["Dificuldade", a.difficulty], ["Distância", a.distance], ["Horário", a.hours], ["Condição", a.condition]];
  return (
    <article>
      <Link to="/atracoes">← Todas as atrações</Link>
      <Img className="cover" src={a.image} alt={a.name} />
      <div className="head"><h1>{a.name}</h1><Badge s={a.status} /></div>
      <p>{a.desc}</p>
      <dl className="facts">
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <h2>Dicas de segurança</h2><p>{a.tips}</p>
      <h2>Regras de visitação</h2><p>{a.rules}</p>
      <h2>Localização</h2>
      <a className="btn" href={mapUrl(a)} target="_blank" rel="noopener noreferrer">📍 Abrir no Google Maps</a>
      <iframe className="map" loading="lazy" title={`Mapa: ${a.name}`} src={mapUrl(a, true)} />
    </article>
  );
}
