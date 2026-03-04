import { useState } from "react"
import { cargarDatos, guardarDatos } from "../data/db"
import Navbar from "../components/Navbar"
import Recetas from "../pages/Recetas"
import Inventario from "../pages/Inventario"
import Ventas from "../pages/Ventas"
import Clientes from "../pages/Clientes"
import Reportes from "../pages/Reportes"

function App() {
  const [db, setDb] = useState(cargarDatos)
  const [activo, setActivo] = useState("Recetas")

  const actualizarDb = (clave, valor) => {
    const nuevaDb = { ...db, [clave]: valor }
    setDb(nuevaDb)
    guardarDatos(nuevaDb)
  }


  return (
    <div>
      <h1>Emprende App</h1>
      <Navbar activo={activo} setActivo={setActivo} />

      {activo === "Recetas" && <Recetas />}
      {activo === "Inventario" && <Inventario />}
      {activo === "Ventas" && <Ventas />}
      {activo === "Clientes" && <Clientes />}
      {activo === "Reportes" && <Reportes />}
    </div>
  )

}

export default App