import { useState } from "react"
import { AuthContext } from "./AuthContext"

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const saved = localStorage.getItem("usuario")
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    const login = (token, datosUsuario) => {
        localStorage.setItem("token", token)
        localStorage.setItem("usuario", JSON.stringify(datosUsuario))
        setUsuario(datosUsuario)
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}