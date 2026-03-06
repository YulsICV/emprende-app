import { useState } from "react"
import { cargarDatos, guardarDatos } from "../data/db"
import Navbar from "../components/Navbar"
import Recetas from "../pages/Recetas"
import Inventario from "../pages/Inventario"
import Pedidos from "../pages/Pedidos"
import Ventas from "../pages/Ventas"
import Clientes from "../pages/Clientes"
import Reportes from "../pages/Reportes"
import "./App.css"
import "./styles/components.css"

export default function App() {
  const [db, setDb] = useState(() => {
    const datos = cargarDatos()
    if (!datos.pedidos) datos.pedidos = []
    return datos
  })
  const [activo, setActivo] = useState("Recetas")

  const actualizarDb = (clave, valor) => {
    const nuevaDb = { ...db, [clave]: valor }
    setDb(nuevaDb)
    guardarDatos(nuevaDb)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 Emprende App</h1>
      </header>
      <Navbar activo={activo} setActivo={setActivo} />
      <main className="app-contenido">
        {activo === "Recetas" && <Recetas db={db} actualizarDb={actualizarDb} />}
        {activo === "Inventario" && <Inventario db={db} actualizarDb={actualizarDb} />}
        {activo === "Pedidos" && <Pedidos db={db} actualizarDb={actualizarDb} />}
        {activo === "Ventas" && <Ventas db={db} actualizarDb={actualizarDb} />}
        {activo === "Clientes" && <Clientes db={db} actualizarDb={actualizarDb} />}
        {activo === "Reportes" && <Reportes db={db} />}
      </main>
    </div>
  )
}