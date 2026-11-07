import { useData, useFavs, toggleFav } from "../store";
import { AttractionCard } from "../ui";

export default function Roteiro() {
  const { attractions } = useData();
  const favs = useFavs();
  const list = attractions.filter((a) => favs.includes(a.id));
  const wa = `https://wa.me/?text=${encodeURIComponent("Meu roteiro no Saquarema Verde:\n" + list.map((a, i) => `${i + 1}. ${a.name}`).join("\n") + "\n" + window.location.origin)}`;
  return (
    <>
      <h1>Meu roteiro</h1>
      {list.length ? (
        <>
          <div className="grid">{list.map((a) => <AttractionCard key={a.id} a={a} />)}</div>
          <div className="actions">
            <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a>
            <button className="btn ghost" onClick={() => [...favs].forEach(toggleFav)}>Limpar roteiro</button>
          </div>
        </>
      ) : (
        <p>Você ainda não adicionou atrações. Use o botão "🤍 Adicionar ao roteiro" nos cards.</p>
      )}
    </>
  );
}
