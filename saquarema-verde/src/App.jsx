import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Atracoes from "./pages/Atracoes";
import Eventos from "./pages/Eventos";
import Perfil from "./pages/Perfil";
import Relatar from "./pages/Relatar";
import Roteiro from "./pages/Roteiro";
import { isAdmin, logout, useData, useFavs, useEvs } from "./store";

const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const SEL = ".panel, article.card, .acard, .list li, main>h1, main>h2, article>h2, .facts div, .stats div, .gitem";

export default function App() {
  const [auth, setAuth] = useState(isAdmin());
  const [fs, setFs] = useState(() => Number(localStorage.getItem("sv_fs")) || 100);
  const [hc, setHc] = useState(() => localStorage.getItem("sv_hc") === "1");
  const [open, setOpen] = useState(false);
  const [ai, setAi] = useState(0);
  const [pause, setPause] = useState(false);
  const { alerts = [], reports = [] } = useData();
  const roteiro = useFavs().length + useEvs().length;
  const novos = reports.filter((r) => r.status === "Novo").length;
  const act = alerts.filter((x) => x.active && x.text);
  const cur = act.length ? act[ai % act.length] : null;
  const nav = useNavigate();
  const home = useLocation().pathname === "/";
  const out = () => { logout(); setAuth(false); nav("/"); };

  useEffect(() => {
    document.documentElement.style.fontSize = fs + "%";
    document.documentElement.dataset.contrast = hc ? "high" : "";
    try { localStorage.setItem("sv_fs", fs); localStorage.setItem("sv_hc", hc ? "1" : "0"); } catch {}
  }, [fs, hc]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  // Avisos alternando a cada 5 s (pausa ao passar o mouse ou focar)
  useEffect(() => {
    if (act.length < 2 || pause) return;
    const t = setInterval(() => setAi((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, [act.length, pause]);

  // Celular: o topo some ao rolar para baixo e volta ao rolar para cima
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      root.dataset.top = y > last && y > 80 ? "hide" : "";
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); delete root.dataset.top; };
  }, []);

  // Efeito ao rolar
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = window.scrollY, dir = "down";
    const onScroll = () => { const y = window.scrollY; if (y !== last) { dir = y > last ? "down" : "up"; last = y; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      e.target.dataset.dir = dir;
      e.target.classList.toggle("in", e.isIntersecting);
    }), { threshold: 0.05 });
    const scan = () => document.querySelectorAll(SEL).forEach((el) => {
      if (!el.dataset.rv) { el.dataset.rv = "1"; el.classList.add("reveal"); io.observe(el); }
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.getElementById("root"), { childList: true, subtree: true });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <>
      <a className="skip" href="#main">Pular para o conteúdo</a>
      <header className="top">
        <div className="bar">
          <NavLink to="/" className="logo" aria-label="Saquarema Verde, página inicial">
            <svg viewBox="0 0 40 36" aria-hidden="true"><path d="M0 36L14 6l8 14 6-8 12 24z" /></svg>
            <span><b>SAQUAREMA</b> VERDE<small>ECOTURISMO E NATUREZA</small></span>
          </NavLink>
          <nav aria-label="Principal">
            <NavLink to="/atracoes">Atrações</NavLink>
            <NavLink to="/eventos">Eventos</NavLink>
            <NavLink to="/roteiro">Meu roteiro ({roteiro})</NavLink>
            <NavLink to="/relatar">Relatar problema</NavLink>
            {auth ? (
              <>
                <NavLink to="/admin" aria-label={novos ? `Painel, ${novos} relatos novos` : "Painel"}>
                  Painel{novos > 0 && <span className="notif">{novos}</span>}
                </NavLink>
                <button className="btn sm" onClick={out}>Sair</button>
              </>
            ) : (
              <NavLink to="/login" className="btn sm">Login</NavLink>
            )}
          </nav>
        </div>
      </header>
        {home && (
          <section className="hero-full">
            <div className="hero-in">
              <div className="hero-text">
                <svg className="birds" viewBox="0 0 120 50" aria-hidden="true"><path d="M5 30Q25 5 50 28 30 18 5 30z" /><path d="M70 25Q85 8 105 22 88 16 70 25z" /></svg>
                <h1>Descubra o Circuito Saquarema Verde</h1>
                <p>Trilhas, cachoeiras, biodiversidade e eventos no Parque Estadual da Costa do Sol e na Reserva Ecológica Estadual de Jacarepiá.</p>
                <Link to="/atracoes" className="btn">Explorar atrações →</Link>
              </div>
              <aside className="aviso" aria-label="Aviso"
                onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
                onFocus={() => setPause(true)} onBlur={() => setPause(false)}>
                <strong>⚠️ Aviso{act.length > 1 ? ` ${(ai % act.length) + 1}/${act.length}` : ""}</strong>
                <p key={cur?.id} className="fade">{cur ? cur.text : "Nenhum aviso no momento. Boa visita!"}</p>
                {act.length > 1 && (
                  <div className="dots">
                    {act.map((x, i) => (
                      <button key={x.id} className={"dot" + (i === ai % act.length ? " on" : "")} aria-label={`Ver aviso ${i + 1}`} onClick={() => setAi(i)} />
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </section>
        )}
      <div className="shell">
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<p>Carregando…</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/atracoes" element={<Atracoes />} />
              <Route path="/atracoes/:id" element={<Perfil />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/roteiro" element={<Roteiro />} />
              <Route path="/relatar" element={<Relatar />} />
              <Route path="/login" element={<Login onLogin={() => setAuth(true)} />} />
              <Route path="/admin" element={auth ? <Admin /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <div className="a11y-fab">
          {open && (
            <div id="a11y-panel" className="a11y-panel" role="group" aria-label="Opções de acessibilidade">
              <strong>Acessibilidade</strong>
              <div className="actions">
                <button onClick={() => setFs((v) => Math.max(80, v - 10))} aria-label="Diminuir fonte">A−</button>
                <button onClick={() => setFs((v) => Math.min(150, v + 10))} aria-label="Aumentar fonte">A+</button>
              </div>
              <button aria-pressed={hc} onClick={() => setHc(!hc)}>Alto contraste</button>
              <button onClick={() => { setFs(100); setHc(false); }}>Restaurar padrão</button>
            </div>
          )}
          <button className="fab" aria-label="Acessibilidade" aria-expanded={open} aria-controls="a11y-panel" onClick={() => setOpen(!open)}>♿</button>
        </div>
        <footer>Circuito Saquarema Verde · Turismo sustentável e responsável<br />Foto de fundo: Kelly / Pexels</footer>
      </div>
    </>
  );
}
