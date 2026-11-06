import { lazy, Suspense, useState } from "react";
import { NavLink, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Atracoes from "./pages/Atracoes";
import Eventos from "./pages/Eventos";
import Perfil from "./pages/Perfil";
import { isAdmin, logout } from "./store";

// Páginas do admin carregam sob demanda (site público fica mais leve)
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));

export default function App() {
  const [auth, setAuth] = useState(isAdmin());
  const nav = useNavigate();
  const out = () => { logout(); setAuth(false); nav("/"); };

  return (
    <>
      <header className="top">
        <NavLink to="/" className="logo">🌿 Saquarema Verde</NavLink>
        <nav aria-label="Principal">
          <NavLink to="/atracoes">Atrações</NavLink>
          <NavLink to="/eventos">Eventos</NavLink>
          {auth ? (
            <>
              <NavLink to="/admin">Painel</NavLink>
              <button className="btn sm" onClick={out}>Sair</button>
            </>
          ) : (
            <NavLink to="/login" className="btn sm">Login admin</NavLink>
          )}
        </nav>
      </header>
      <main>
        <Suspense fallback={<p>Carregando…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/atracoes" element={<Atracoes />} />
            <Route path="/atracoes/:id" element={<Perfil />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/login" element={<Login onLogin={() => setAuth(true)} />} />
            <Route path="/admin" element={auth ? <Admin /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <footer>Circuito Saquarema Verde · Turismo sustentável e responsável</footer>
    </>
  );
}
