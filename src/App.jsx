import { useState } from "react"
import { cargarDatos, guardarDatos } from "./data/db"
import { useAuth } from "./AuthContext"
import Navbar from "./components/Navbar"
import Recetas from "./pages/Recetas"
import Inventario from "./pages/Inventario"
import Pedidos from "./pages/Pedidos"
import Ventas from "./pages/Ventas"
import Clientes from "./pages/Clientes"
import Reportes from "./pages/Reportes"
import Produccion from "./pages/Produccion"
import Recetario from "./pages/Recetario"
import LoginPage from "./pages/LoginPage"
import Perfil from "./pages/Perfil"
import "./App.css"
import "./styles/components.css"

const MODULOS = ["Recetas", "Recetario", "Produccion", "Inventario", "Pedidos", "Ventas", "Clientes", "Reportes", "Perfil"]

export default function App() {
    const { usuario, logout } = useAuth()

    const [db, setDb] = useState(() => {
        const datos = cargarDatos()
        if (!datos.pedidos) datos.pedidos = []
        return datos
    })

    const [activo, setActivo] = useState("Recetas")

    const actualizarDb = (clave, valor, extra = {}) => {
        setDb(prev => {
            const nuevaDb = { ...prev, [clave]: valor, ...extra }
            guardarDatos(nuevaDb)
            return nuevaDb
        })
    }

    if (!usuario) return <LoginPage />

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-logo">
                    <img src="/logo-transparente.png" style={{ height: 34 }} alt="logo" />
                    <span className="header-titulo">Emprende App</span>
                </div>

                <Navbar
                    activo={activo}
                    setActivo={setActivo}
                    usuario={usuario}
                    onCerrarSesion={logout}
                    modulos={MODULOS}
                />

                <div className="header-sesion">
                    {usuario.fotoGoogle ? (
                        <img src={usuario.fotoGoogle} alt="avatar"
                            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                        <div className="sesion-avatar">{usuario.inicial}</div>
                    )}
                    <span className="sesion-nombre">{usuario.nombre}</span>
                    <button className="sesion-salir" onClick={logout}>Salir</button>
                </div>
            </header>

            <main className="app-contenido">
                {activo === "Recetas" && <Recetas db={db} actualizarDb={actualizarDb} />}
                {activo === "Recetario" && <Recetario db={db} actualizarDb={actualizarDb} />}
                {activo === "Produccion" && <Produccion db={db} actualizarDb={actualizarDb} />}
                {activo === "Inventario" && <Inventario db={db} actualizarDb={actualizarDb} />}
                {activo === "Pedidos" && <Pedidos db={db} actualizarDb={actualizarDb} />}
                {activo === "Ventas" && <Ventas db={db} actualizarDb={actualizarDb} />}
                {activo === "Clientes" && <Clientes db={db} actualizarDb={actualizarDb} />}
                {activo === "Reportes" && <Reportes db={db} actualizarDb={actualizarDb} />}
                {activo === "Perfil" && <Perfil />}
            </main>
        </div>
    )
}