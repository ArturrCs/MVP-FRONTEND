import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAdmin, update, useData } from "../store";
import { Badge, Diff, FavBtn, Img, Weather, mapUrl } from "../ui";

export default function Perfil() {
  const { id } = useParams();
  const { attractions } = useData();
  const [big, setBig] = useState(null);
  const a = attractions.find((x) => String(x.id) === id);
  if (!a) return <><p>Atração não encontrada.</p><Link to="/atracoes">← Voltar</Link></>;

  const pics = [a.image, ...(a.gallery || [])];
  const adm = isAdmin();
  const DEF = { Trilha: "/img/trilha.svg", Cachoeira: "/img/cachoeira.svg", Biodiversidade: "/img/biodiversidade.svg", Parque: "/img/parque.svg", Mirante: "/img/trilha.svg", Praia: "/img/parque.svg" };
  const canDel = (i) => adm && (i > 0 || !/\.svg$/.test(a.image || ""));
  const delPic = (i) => {
    if (!window.confirm(i === 0 ? "Excluir a foto de capa? Será usada a ilustração padrão." : "Excluir esta foto da galeria?")) return;
    update((d) => ({ ...d, attractions: d.attractions.map((x) => x.id !== a.id ? x : i === 0 ? { ...x, image: DEF[a.type] || "/img/parque.svg" } : { ...x, gallery: (x.gallery || []).filter((_, j) => j !== i - 1) }) }));
  };
  const wa = `https://wa.me/?text=${encodeURIComponent(`Conheça ${a.name} no Circuito Saquarema Verde: ${window.location.href}`)}`;
  const facts = [["Tipo", a.type], ["Área", a.area], ["Dificuldade", <Diff d={a.difficulty} />], ["Distância", a.distance], ["Horário", a.hours], ["Condição", a.condition]];

  return (
    <article>
      <Link to="/atracoes" className="back"><span aria-hidden="true">←</span> Todas as atrações</Link>

      <section className="panel">
        <Img className="cover" src={a.image} alt={a.name} />
        <div className="head"><h1>{a.name}</h1><Badge s={a.status} /></div>
        {a.status === "Atenção" && <div className="callout" role="note">⚠ <strong>Atenção:</strong> {a.condition}</div>}
        <p>{a.desc}</p>
        <div className="actions">
          <FavBtn id={a.id} />
          <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a>
        </div>
      </section>

      <section className="panel">
        <h2>Previsão do tempo</h2>
        <Weather place={a.location} />
        <dl className="facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      <section className="panel">
        <h2>Galeria</h2>
        {adm && pics.every((_, i) => !canDel(i)) && <p className="hint">Nenhuma foto enviada para excluir. Para adicionar: Painel → Atrações → "Adicionar foto à galeria" → "Salvar alteração".</p>}
        <div className="gallery">
          {pics.map((p, i) => (
            <div className="gitem" key={i}>
              <button className="gbtn" onClick={() => setBig(p)} aria-label={`Ampliar foto ${i + 1}`}>
                <Img src={p} alt={`${a.name}, foto ${i + 1}`} loading="lazy" />
              </button>
              {canDel(i) && <button className="gdel" aria-label={`Excluir foto ${i + 1}`} onClick={() => delPic(i)}>🗑 Excluir</button>}
            </div>
          ))}
        </div>
      </section>
      {big && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setBig(null)}>
          <Img src={big} alt="" />
          <button className="btn" autoFocus>Fechar</button>
        </div>
      )}

      <section className="panel">
        <h2>Dicas de segurança</h2><p>{a.tips}</p>
        <h2>Regras de visitação</h2><p>{a.rules}</p>
        {a.sources?.length > 0 && (
          <p className="hint">Fontes: {a.sources.map((x, i) => <span key={i}>{i ? " · " : ""}<a href={x.u} target="_blank" rel="noopener noreferrer">{x.t}</a></span>)}</p>
        )}
      </section>

      <section className="panel">
        <h2>Localização</h2>
        {a.address && <p>📍 {a.address}</p>}
        <a className="btn" href={mapUrl(a)} target="_blank" rel="noopener noreferrer">📍 Abrir no Google Maps</a>
        <iframe className="map" loading="lazy" title={`Mapa: ${a.name}`} src={mapUrl(a, true)} />
      </section>
    </article>
  );
}
