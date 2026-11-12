import { useSyncExternalStore } from "react";

const KEY = "sv_data_v1";
// DEMO: credenciais no front-end NÃO são seguras. Em produção use Supabase Auth.
const ADMIN = { email: "admin@saquaremaverde.com", pass: "verde123" };

// DADOS DE EXEMPLO: substitua pelos oficiais (INEA / Prefeitura) pelo painel admin.
const seed = {
  attractions: [
    { id: 5, name: "Parque Estadual da Costa do Sol", area: "PECS", type: "Parque", difficulty: "Variada", distance: "Vários roteiros", hours: "08h–16h", status: "Aberta", condition: "Consulte a administração", desc: "Unidade de conservação estadual que protege ecossistemas costeiros como restingas e lagoas.", tips: "Respeite a sinalização e mantenha-se nas trilhas autorizadas.", rules: "Proibido fazer fogueira, acampar fora das áreas permitidas e retirar fauna ou flora.", image: "/img/parque.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
    { id: 6, name: "Reserva Ecológica Estadual de Jacarepiá", area: "REE Jacarepiá", type: "Parque", difficulty: "Variada", distance: "Vários roteiros", hours: "07h–15h", status: "Aberta", condition: "Consulte a administração", desc: "Reserva com Mata Atlântica, trilhas e cachoeiras, voltada à conservação e à educação ambiental.", tips: "Faça o registro na portaria e leve água suficiente.", rules: "Visitação sujeita às normas da reserva. Não leve animais de estimação.", image: "/img/parque.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 1, name: "Trilha da Restinga", area: "PECS", type: "Trilha", difficulty: "Fácil", distance: "3 km", hours: "08h–16h", status: "Aberta", condition: "Seca e bem sinalizada", desc: "Caminhada leve entre vegetação de restinga, ideal para observar aves e plantas nativas.", tips: "Leve água, protetor solar e use calçado fechado.", rules: "Proibido deixar lixo, alimentar animais ou retirar plantas.", image: "/img/trilha.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
    { id: 2, name: "Mirante da Serra", area: "REE Jacarepiá", type: "Trilha", difficulty: "Moderada", distance: "6 km", hours: "07h–15h", status: "Atenção", condition: "Trecho escorregadio após chuva", desc: "Subida com vista panorâmica das lagoas e do litoral de Saquarema.", tips: "Evite dias de chuva e inicie cedo para voltar antes do fim da tarde.", rules: "Visitação com registro na portaria. Grupos de até 10 pessoas.", image: "/img/trilha.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 3, name: "Cachoeira do Vale", area: "REE Jacarepiá", type: "Cachoeira", difficulty: "Moderada", distance: "4 km", hours: "08h–15h", status: "Aberta", condition: "Boa, com volume de água médio", desc: "Queda d'água cercada de Mata Atlântica, com poço para contemplação.", tips: "Não pule nas pedras; a superfície é lisa.", rules: "Não é permitido som alto nem sabão/repelente na água.", image: "/img/cachoeira.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 4, name: "Observação de Aves", area: "PECS", type: "Biodiversidade", difficulty: "Fácil", distance: "2 km", hours: "06h–10h", status: "Aberta", condition: "Ótima para observação pela manhã", desc: "Roteiro curto para registrar aves, borboletas e outros animais da região.", tips: "Fale baixo, use roupas de cores neutras e leve binóculos.", rules: "Proibido o uso de drones.", image: "/img/biodiversidade.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
    {"id": 7, "name": "PECS – Núcleo Massambaba (Saquarema)", "area": "PECS", "type": "Parque", "difficulty": "Variada", "distance": "A confirmar", "hours": "Consulte o INEA", "status": "Aberta", "condition": "Consulte a administração antes de visitar", "desc": "Parte do Parque Estadual da Costa do Sol que alcança Saquarema, criada pelo decreto estadual nº 42.929/2011. Protege restinga, manguezal, Mata Atlântica, vegetação xerófila, cordões arenosos, costões rochosos, brejos e lagoas, além de sítios arqueológicos. O decreto descreve uma área de cerca de 2.691 ha (Área 1 do Núcleo Massambaba), com limites que partem do litoral de Saquarema.", "tips": "O atendimento administrativo do parque fica no posto do INEA em Cabo Frio, em dias úteis. Confirme o contato e as áreas liberadas antes de ir.", "rules": "O decreto de criação proíbe obras e atividades que afetem a substância ou a destinação do parque. Siga as regras de visitação vigentes do INEA.", "image": "/img/parque.svg", "location": "Parque Estadual da Costa do Sol, Saquarema, RJ", "gallery": [], "sources": [{"t": "Decreto nº 42.929/2011", "u": "https://www.saquarema.rj.gov.br/wp-content/uploads/2020/07/DECRETO-N%C2%B0-42.929-11-PCSOL.pdf"}, {"t": "Catraca Livre", "u": "https://catracalivre.com.br/gira/confira-6-parques-estaduais-com-trilhas-cachoeiras-e-praias/"}]},
    {"id": 8, "name": "Floresta de Restinga Seca de Jacarepiá", "area": "REE Jacarepiá", "type": "Biodiversidade", "difficulty": "Variada", "distance": "A confirmar", "hours": "Consulte a administração", "status": "Atenção", "condition": "Confirme com o INEA se a visitação está liberada", "desc": "Entre a Lagoa de Jacarepiá e o mar fica uma floresta de restinga seca, com árvores de cerca de 20 m, troncos grossos e muitas epífitas. Um relatório da FEEMA citado pelo VilaturOnLine a descreve como a floresta de restinga seca mais bem preservada do estado do Rio de Janeiro.", "tips": "Por ser área protegida, confirme se é preciso autorização ou guia. Leve água, repelente e calçado fechado.", "rules": "Leve todo o lixo de volta e não retire plantas nem animais. A fonte registra queimadas, lixo e entrada de veículos em áreas da reserva: ajude a evitar isso.", "image": "/img/biodiversidade.svg", "location": "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ", "gallery": [], "sources": [{"t": "VilaturOnLine", "u": "https://vilaturonline.com.br/reserva-de-jacarepia/"}]},
    {"id": 9, "name": "Lagoa de Jacarepiá e Brejo", "area": "REE Jacarepiá", "type": "Biodiversidade", "difficulty": "Variada", "distance": "A confirmar", "hours": "Consulte a administração", "status": "Atenção", "condition": "Confirme com o INEA as regras de visitação", "desc": "A Lagoa de Jacarepiá é cercada por um extenso brejo, que alaga na época das chuvas. Segundo o VilaturOnLine, a área abriga jacaré-de-papo-amarelo, lontra, mão-pelada, garças, coruja-buraqueira e peixes como acará, traíra e piaba, além de bromélias e do maracujá-da-restinga.", "tips": "Na época das chuvas o brejo alaga e o terreno fica encharcado. Observe os animais à distância e leve repelente.", "rules": "Não alimente nem capture animais. Leve todo o lixo de volta e não retire plantas nem animais.", "image": "/img/biodiversidade.svg", "location": "Lagoa de Jacarepiá, Saquarema, RJ", "gallery": [], "sources": [{"t": "VilaturOnLine", "u": "https://vilaturonline.com.br/reserva-de-jacarepia/"}]},
    {"id": 10, "name": "Lagoa de Saquarema", "area": "Saquarema", "type": "Biodiversidade", "difficulty": "Fácil", "distance": "Passeio na água", "hours": "A confirmar", "status": "Aberta", "condition": "Verifique o vento e o clima antes de entrar na água", "desc": "Lagoa mais calma que o oceano, com atividades como stand-up paddle, caiaque, vela e canoa havaiana. Também é um bom lugar para observar aves e o dia a dia dos pescadores, num ecossistema com fauna e flora variadas.", "tips": "Use colete salva-vidas nas atividades náuticas, evite vento forte e leve protetor solar. Para passeios guiados, procure operadores credenciados.", "rules": "Não jogue lixo na água nem alimente a fauna silvestre. Respeite as áreas de pesca.", "image": "/img/biodiversidade.svg", "location": "Lagoa de Saquarema, Saquarema, RJ", "gallery": [], "sources": [{"t": "Routard", "u": "https://www.routard.com/fr/guide/ameriques/bresil/etat-de-rio-de-janeiro/saquarema"}, {"t": "Seguros Promo", "u": "https://www.segurospromo.com.br/blog/saquarema/"}]},
    {"id": 11, "name": "Cachoeiras da Serra do Roncador", "area": "Saquarema", "type": "Cachoeira", "difficulty": "Variada", "distance": "A confirmar", "hours": "A confirmar", "status": "Atenção", "condition": "Acesso só por trilha na mata: vá com guia local", "desc": "Conjunto de seis cachoeiras no alto de uma trilha de montanha, cercadas por mata preservada, a menos de 30 km do centro de Saquarema. O único acesso é por trilhas na floresta, e as fontes recomendam ir com guia.", "tips": "Vá com guia local, evite dias de chuva e avise alguém do seu roteiro. Leve água, lanche e calçado com boa aderência.", "rules": "Não use sabão nem repelente na água. Leve todo o lixo de volta e não retire plantas nem animais.", "image": "/img/cachoeira.svg", "location": "Cachoeira do Roncador, Saquarema, RJ", "gallery": [], "sources": [{"t": "I Love Rio", "u": "https://iloverio.com/rio-de-janeiro-tours-buzios-ilha-grande-niteroi-guide/rio-de-janeiro-saquarema/rio-de-janeiro-entertainment-tours-saquarema-attractions3.htm"}, {"t": "Seguros Promo", "u": "https://www.segurospromo.com.br/blog/saquarema/"}]},
    {"id": 12, "name": "Cachoeira do Tinguí", "area": "Saquarema", "type": "Cachoeira", "difficulty": "Variada", "distance": "A confirmar", "hours": "A confirmar", "status": "Atenção", "condition": "Acesso, trilha e dificuldade não confirmados: consulte um guia local", "desc": "Cachoeira no bairro Tinguí, na região de Sampaio Corrêa, listada entre os pontos naturais de Saquarema e a cerca de 6,6 km da Cachoeira do Roncador, segundo o Buser. Dados de trilha, duração e dificuldade não foram confirmados.", "tips": "Pergunte a moradores ou guias locais sobre o acesso e as condições antes de ir, e evite dias de chuva.", "rules": "Respeite propriedades particulares, não use sabão na água. Leve todo o lixo de volta e não retire plantas nem animais.", "image": "/img/cachoeira.svg", "location": "Cachoeira do Tinguí, Sampaio Corrêa, Saquarema, RJ", "gallery": [], "sources": [{"t": "Buser", "u": "https://www.buser.com.br/destinos/pontos-turisticos/rj/saquarema/todos"}]},
    {"id": 13, "name": "Mirante do Morro da Cruz", "area": "Saquarema", "type": "Mirante", "difficulty": "Variada", "distance": "A confirmar", "hours": "A confirmar", "status": "Aberta", "condition": "Melhor no fim da tarde, para o pôr do sol", "desc": "Mirante perto do centro, com vista da cidade, da lagoa, do mar e das montanhas, especialmente bonita ao pôr do sol.", "tips": "Chegue com antecedência para o pôr do sol e volte antes de escurecer. Leve água e uma lanterna.", "rules": "Mantenha o local limpo e respeite a sinalização.", "image": "/img/trilha.svg", "location": "Mirante Morro da Cruz, Saquarema, RJ", "gallery": [], "sources": [{"t": "I Love Rio", "u": "https://iloverio.com/rio-de-janeiro-tours-buzios-ilha-grande-niteroi-guide/rio-de-janeiro-saquarema/rio-de-janeiro-entertainment-tours-saquarema-attractions3.htm"}, {"t": "Seguros Promo", "u": "https://www.segurospromo.com.br/blog/saquarema/"}]},
    {"id": 14, "name": "Praia de Itaúna", "area": "Saquarema", "type": "Praia", "difficulty": "Fácil", "distance": "Orla extensa", "hours": "Acesso livre", "status": "Aberta", "condition": "Ondas fortes: atenção ao banho de mar", "desc": "Praia mais famosa de Saquarema, conhecida pelas ondas fortes e por receber etapa de campeonato internacional de surfe. Há trechos de águas mais tranquilas para o banho.", "tips": "Observe as condições do mar, banhe-se onde houver salva-vidas e use protetor solar.", "rules": "Respeite as áreas de surfe e leve o lixo de volta.", "image": "/img/parque.svg", "location": "Praia de Itaúna, Saquarema, RJ", "gallery": [], "sources": [{"t": "Routard", "u": "https://www.routard.com/fr/guide/ameriques/bresil/etat-de-rio-de-janeiro/saquarema"}, {"t": "Seguros Promo", "u": "https://www.segurospromo.com.br/blog/saquarema/"}]},
    {"id": 15, "name": "Praia de Jaconé", "area": "Saquarema", "type": "Praia", "difficulty": "Fácil", "distance": "Orla extensa", "hours": "Acesso livre", "status": "Aberta", "condition": "Trechos de mar calmo e de ondas: confirme antes de entrar", "desc": "Praia com áreas de preservação ambiental, com trechos calmos para o banho e outros para o surfe.", "tips": "Escolha o trecho conforme a atividade e observe as condições do mar.", "rules": "Respeite as áreas de preservação e leve o lixo de volta.", "image": "/img/parque.svg", "location": "Praia de Jaconé, Saquarema, RJ", "gallery": [], "sources": [{"t": "Seguros Promo", "u": "https://www.segurospromo.com.br/blog/saquarema/"}, {"t": "Buser", "u": "https://www.buser.com.br/destinos/pontos-turisticos/rj/saquarema/todos"}]},
    {"id": 16, "name": "Praia de Vilatur", "area": "Saquarema", "type": "Praia", "difficulty": "Fácil", "distance": "Orla extensa", "hours": "Acesso livre", "status": "Aberta", "condition": "Mar tranquilo, indicado para famílias", "desc": "Praia tranquila, adequada para famílias. O bairro de Vilatur também é citado pelo VilaturOnLine como o local da Reserva Ecológica Estadual de Jacarepiá.", "tips": "Use protetor solar e observe as condições do mar com crianças.", "rules": "Leve o lixo de volta e respeite a fauna e a vegetação de restinga.", "image": "/img/parque.svg", "location": "Praia de Vilatur, Saquarema, RJ", "gallery": [], "sources": [{"t": "Routard", "u": "https://www.routard.com/fr/guide/ameriques/bresil/etat-de-rio-de-janeiro/saquarema"}, {"t": "VilaturOnLine", "u": "https://vilaturonline.com.br/reserva-de-jacarepia/"}]},
  ],
  events: [
    { id: 1, title: "Mutirão de Limpeza da Restinga", date: "2026-11-21", time: "08h–12h", place: "PECS", status: "Aberto" },
    { id: 2, title: "Caminhada Noturna com Guia", date: "2026-12-05", time: "18h–21h", place: "REE Jacarepiá", status: "Lotado" },
    { id: 3, title: "Oficina de Observação de Aves", date: "2026-12-12", time: "06h–09h", place: "PECS", status: "Aberto" },
  ],
  seasons: [
    { id: 1, name: "Alta temporada (verão)", from: "2026-12-15", to: "2027-03-15", hours: "07h–17h" },
    { id: 2, name: "Baixa temporada", from: "2027-03-16", to: "2027-12-14", hours: "08h–16h" },
  ],
  v: 3,
  alerts: [{ id: 1, active: true, text: "Trilha do Mirante com trecho em manutenção: use o acesso alternativo." }],
  reports: [],
  news: [
    { id: 1, title: "Trilha do Mirante com trecho em manutenção", text: "Equipe do parque faz reparos na escadaria. Use o acesso alternativo." },
    { id: 2, title: "Novas regras de visitação", text: "Grupos acima de 10 pessoas precisam agendar com antecedência." },
  ],
};

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return seed;
    if (!s.alerts) s.alerts = s.alert && s.alert.text ? [{ id: 1, active: !!s.alert.active, text: s.alert.text }] : seed.alerts;
    if (s.v >= 3) return { ...seed, ...s };
    if (s.v === 2) {
      // v3: adiciona as atrações novas (ids 7 a 16) sem recriar as que o admin já excluiu antes
      const have = new Set(s.attractions.map((a) => a.id));
      return { ...seed, ...s, v: 3, attractions: [...s.attractions, ...seed.attractions.filter((a) => a.id >= 7 && a.id <= 16 && !have.has(a.id))] };
    }
    const base = Object.fromEntries(seed.attractions.map((a) => [a.id, a]));
    const have = new Set(s.attractions.map((a) => a.id));
    const old = s.attractions.map((a) => ({ ...base[a.id], ...a }));
    return { ...seed, ...s, v: 3, attractions: [...old, ...seed.attractions.filter((a) => !have.has(a.id))] };
  } catch { return seed; }
};
let data = load();
const subs = new Set();

export const update = (fn) => {
  data = fn(data);
  let ok = true;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { ok = false; }
  subs.forEach((x) => x());
  return ok;
};
export const useData = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => data);

export const uid = () => Date.now() + Math.floor(Math.random() * 1000);
export const login = (e, p) => {
  const ok = e.trim().toLowerCase() === ADMIN.email && p === ADMIN.pass;
  if (ok) sessionStorage.setItem("sv_admin", "1");
  return ok;
};
export const isAdmin = () => sessionStorage.getItem("sv_admin") === "1";
export const logout = () => sessionStorage.removeItem("sv_admin");

// Roteiro favorito (por visitante, neste navegador)
let favs = (() => { try { return JSON.parse(localStorage.getItem("sv_favs")) || []; } catch { return []; } })();
const fsubs = new Set();
export const toggleFav = (id) => {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  try { localStorage.setItem("sv_favs", JSON.stringify(favs)); } catch {}
  fsubs.forEach((x) => x());
};
export const useFavs = () => useSyncExternalStore((f) => { fsubs.add(f); return () => fsubs.delete(f); }, () => favs);

// Eventos em que o visitante vai participar (aparecem em "Meu roteiro")
let evs = (() => { try { return JSON.parse(localStorage.getItem("sv_evs")) || []; } catch { return []; } })();
const esubs = new Set();
export const toggleEv = (id) => {
  evs = evs.includes(id) ? evs.filter((x) => x !== id) : [...evs, id];
  try { localStorage.setItem("sv_evs", JSON.stringify(evs)); } catch {}
  esubs.forEach((x) => x());
};
export const useEvs = () => useSyncExternalStore((f) => { esubs.add(f); return () => esubs.delete(f); }, () => evs);
