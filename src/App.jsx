import { useState, useEffect } from "react"
import { cargarDatos, guardarDatos } from "./data/db"
import Navbar from "../components/Navbar"
import Recetas from "./pages/Recetas"
import Inventario from "./pages/Inventario"
import Pedidos from "./pages/Pedidos"
import Ventas from "./pages/Ventas"
import Clientes from "./pages/Clientes"
import Reportes from "./pages/Reportes"
import Produccion from "./pages/Produccion"
import Recetario from "./pages/Recetario"
import LoginPage from "./pages/LoginPage"
import "./App.css"
import "./styles/components.css"

const MODULOS = ["Recetas", "Recetario", "Produccion", "Inventario", "Pedidos", "Ventas", "Clientes", "Reportes"]

export default function App() {
  // 🔑 Usuario persistente
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem("usuario")
    return savedUser ? JSON.parse(savedUser) : null
  })

  // 📦 Base de datos persistente
  const [db, setDb] = useState(() => {
    const datos = cargarDatos()
    if (!datos.pedidos) datos.pedidos = []
    return datos
  })

  // 📍 Módulo activo persistente
  const [activo, setActivo] = useState(() => {
    return localStorage.getItem("activo") || "Recetas"
  })

  // 📝 Guardar usuario cuando cambie
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario))
    } else {
      localStorage.removeItem("usuario")
    }
  }, [usuario])

  // 📝 Guardar módulo activo cuando cambie
  useEffect(() => {
    localStorage.setItem("activo", activo)
  }, [activo])

  const actualizarDb = (clave, valor, extra = {}) => {
    setDb(prev => {
      const nuevaDb = { ...prev, [clave]: valor, ...extra }
      guardarDatos(nuevaDb)
      return nuevaDb
    })
  }

  if (!usuario) return <LoginPage onLogin={setUsuario} />

  return (
    <div className="app">
      <header className="app-header">

        <div className="header-logo">
          <img src="../src/assets/logo-transparente.png" style={{ height: 34 }} alt="logo" />
          <span className="header-titulo">Emprende App</span>
        </div>

        <Navbar
          activo={activo}
          setActivo={setActivo}
          usuario={usuario}
          onCerrarSesion={() => setUsuario(null)}
          modulos={MODULOS}
        />

        <div className="header-sesion">
          <div className="sesion-avatar">{usuario.inicial}</div>
          <span className="sesion-nombre">{usuario.nombre}</span>
          <button className="sesion-salir" onClick={() => setUsuario(null)}>Salir</button>
        </div>

      </header>

      <main className="app-contenido">
        {activo === "Recetas"    && <Recetas    db={db} actualizarDb={actualizarDb} />}
        {activo === "Recetario"  && <Recetario  db={db} />}
        {activo === "Produccion" && <Produccion db={db} actualizarDb={actualizarDb} />}
        {activo === "Inventario" && <Inventario db={db} actualizarDb={actualizarDb} />}
        {activo === "Pedidos"    && <Pedidos    db={db} actualizarDb={actualizarDb} />}
        {activo === "Ventas"     && <Ventas     db={db} actualizarDb={actualizarDb} />}
        {activo === "Clientes"   && <Clientes   db={db} actualizarDb={actualizarDb} />}
        {activo === "Reportes"   && <Reportes   db={db} actualizarDb={actualizarDb} />}
      </main>
    </div>
  )
}
