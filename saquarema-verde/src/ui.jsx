import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toggleFav, useFavs } from "./store";

const tone = { Aberta: "ok", Aberto: "ok", Fechada: "bad", Cancelado: "bad", Lotado: "bad" };
export const Badge = ({ s }) => <span className={"badge " + (tone[s] || "warn")}>{s}</span>;
export const fmt = (d) => new Date(d + "T00:00").toLocaleDateString("pt-BR");

export const mapUrl = (a, embed) =>
  embed
    ? `https://www.google.com/maps?q=${encodeURIComponent(a.location)}&output=embed`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`;

export const Img = (p) => (
  <img {...p} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/img/parque.svg"; }} />
);

// Redimensiona a foto no navegador (máx. 1200px) para caber no armazenamento
export const readImg = (file, max = 1000) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const i = new Image();
      i.onerror = rej;
      i.onload = () => {
        const k = Math.min(1, max / Math.max(i.width, i.height));
        const c = document.createElement("canvas");
        c.width = i.width * k; c.height = i.height * k;
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.7));
      };
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });

const LV = { Fácil: 1, Moderada: 2, Difícil: 3 };
export const Diff = ({ d }) => {
  const n = LV[d];
  return (
    <span className="diff" title={`Dificuldade: ${d}`}>
      {n && <><span aria-hidden="true">{"▲".repeat(n)}<i>{"▲".repeat(3 - n)}</i></span> </>}{d}
    </span>
  );
};

export function FavBtn({ id }) {
  const on = useFavs().includes(id);
  return (
    <button className="btn fav sm" aria-pressed={on} onClick={() => toggleFav(id)}>
      {on ? "❤️ No roteiro" : "🤍 Adicionar ao roteiro"}
    </button>
  );
}

const WMO = (c) => c === 0 ? ["☀️", "Céu limpo"] : c <= 3 ? ["⛅", "Parcialmente nublado"] : c <= 48 ? ["🌫️", "Neblina"] : c <= 67 ? ["🌧️", "Chuva"] : c <= 82 ? ["🌦️", "Pancadas de chuva"] : ["⛈️", "Tempestade"];
const cache = new Map();
// Previsão (Open-Meteo, sem chave). Usa "lat,lng" do campo local; senão, região de Saquarema.
export function Weather({ place }) {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(place || "");
  const [lat, lng] = m ? [m[1], m[2]] : ["-22.92", "-42.50"];
  const key = lat + "," + lng;
  const [w, setW] = useState(cache.get(key));
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (cache.has(key)) { setW(cache.get(key)); return; }
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=precipitation_probability_max&timezone=auto`)
      .then((r) => r.json())
      .then((j) => { const v = { t: j.current.temperature_2m, c: j.current.weather_code, p: j.daily.precipitation_probability_max[0] }; cache.set(key, v); setW(v); })
      .catch(() => setErr(true));
  }, [key]);
  if (err) return <p className="meta">Previsão indisponível no momento.</p>;
  if (!w) return <p className="meta">Carregando previsão…</p>;
  const [ic, tx] = WMO(w.c);
  return <p className="weather" role="status">{ic} {Math.round(w.t)}°C · {tx} · chance de chuva hoje: {w.p}%{m ? "" : " (região de Saquarema)"}</p>;
}

export function AttractionCard({ a }) {
  return (
    <article className="acard">
      <Link to={`/atracoes/${a.id}`} className="alink">
        <div className="thumb">
          <Img src={a.image} alt="" loading="lazy" />
          <div className="preview" aria-hidden="true">
            <p>{a.desc}</p>
            <p>{a.difficulty} · {a.distance} · 🕘 {a.hours}</p>
            <strong>Ver perfil →</strong>
          </div>
        </div>
        <div className="abody">
          <Badge s={a.status} />
          <h3>{a.name}</h3>
          <p className="meta">{a.type} · {a.area}</p>
          <p className="meta"><Diff d={a.difficulty} /></p>
        </div>
      </Link>
      <div className="acts">
        <a className="btn sm" href={mapUrl(a)} target="_blank" rel="noopener noreferrer">📍 Ver localização</a>
        <FavBtn id={a.id} />
      </div>
    </article>
  );
}

export const defImg = (a) =>
  ({ Trilha: "/img/trilha.svg", Cachoeira: "/img/cachoeira.svg", Biodiversidade: "/img/biodiversidade.svg" }[a.type] || "/img/parque.svg");
