import { useMemo, useState } from "react";
import { useData } from "../store";
import { AttractionCard } from "../ui";

export default function Atracoes() {
  const { attractions } = useData();
  const [q, setQ] = useState("");
  const [area, setArea] = useState("Todas");
  const [type, setType] = useState("Todos");

  const list = useMemo(
    () => attractions.filter((a) =>
      (area === "Todas" || a.area === area) &&
      (type === "Todos" || a.type === type) &&
      a.name.toLowerCase().includes(q.toLowerCase())),
    [attractions, q, area, type]
  );

  return (
    <>
      <h1>Atrações</h1>
      <div className="filters">
        <input type="search" placeholder="Buscar atração…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Área" value={area} onChange={(e) => setArea(e.target.value)}>
          {["Todas", "PECS", "REE Jacarepiá"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value)}>
          {["Todos", "Parque", "Trilha", "Cachoeira", "Biodiversidade"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="grid">
        {list.map((a) => <AttractionCard key={a.id} a={a} />)}
        {!list.length && <p>Nenhuma atração encontrada.</p>}
      </div>
    </>
  );
}
