import { useState, useEffect, useRef } from "react"

const EQUIPOS_DEFAULT = ["Horno", "Estufa", "Batidora", "Freidora de aire", "Microondas", "Ninguno", "Otro"]

export default function SelectorEquipo({ seleccionados, onChange }) {
    const [equipos, setEquipos] = useState(() => {
        const saved = localStorage.getItem("equipos")
        return saved ? JSON.parse(saved) : EQUIPOS_DEFAULT
    })
    const [mostrarInput, setMostrarInput] = useState(false)
    const [nuevoEquipo, setNuevoEquipo] = useState("")
    const inputRef = useRef(null)

    useEffect(() => {
        localStorage.setItem("equipos", JSON.stringify(equipos))
    }, [equipos])

    const toggle = (eq) => {
        const nuevo = seleccionados.includes(eq)
            ? seleccionados.filter(e => e !== eq)
            : [...seleccionados, eq]
        onChange(nuevo)
    }

    const handleAgregarEquipo = () => {
        const limpio = nuevoEquipo.trim()
        if (!limpio || equipos.includes(limpio)) return
        const nuevosEquipos = [...equipos, limpio]
        setEquipos(nuevosEquipos)
        onChange([...seleccionados, limpio])
        setNuevoEquipo("")
        setMostrarInput(false)
    }

    const handleToggleInput = () => {
        setMostrarInput(v => {
            if (!v) setTimeout(() => inputRef.current?.focus(), 50)
            return !v
        })
    }

    const inputStyle = {
        padding: "7px 12px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box", background: "#fff", color: "#2d3748",
    }

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {equipos.map(eq => {
                const seleccionado = seleccionados.includes(eq)
                return (
                    <label key={eq} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 12px", borderRadius: 20, cursor: "pointer",
                        border: `1.5px solid ${seleccionado ? "#1a9e87" : "#e2e8f0"}`,
                        background: seleccionado ? "#e8f8f5" : "#fff",
                        fontSize: 13, fontWeight: seleccionado ? 600 : 400,
                        color: seleccionado ? "#1a9e87" : "#4a5568",
                        transition: "all 0.15s",
                    }}>
                        <input type="checkbox" checked={seleccionado}
                            onChange={() => toggle(eq)}
                            style={{ display: "none" }} />
                        {eq}
                    </label>
                )
            })}
            {mostrarInput ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ej: Licuadora..."
                        value={nuevoEquipo}
                        onChange={e => setNuevoEquipo(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAgregarEquipo()}
                        style={{ ...inputStyle, width: 140 }}
                    />
                    <button type="button" onClick={handleAgregarEquipo} style={{
                        all: "unset", cursor: "pointer", padding: "7px 12px",
                        borderRadius: 10, background: "#1a9e87",
                        color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0,
                    }}>+ Agregar</button>
                    <button type="button" onClick={() => { setMostrarInput(false); setNuevoEquipo("") }} style={{
                        all: "unset", cursor: "pointer", padding: "7px 10px",
                        borderRadius: 10, background: "#e2e8f0",
                        color: "#718096", fontSize: 12, fontWeight: 600,
                    }}>✕</button>
                </div>
            ) : (
                <button type="button" onClick={handleToggleInput} title="Agregar equipo" style={{
                    all: "unset", cursor: "pointer", width: 32, height: 32,
                    borderRadius: 20, border: "1.5px dashed #2ec4a9",
                    background: "#e8f8f5", color: "#1a9e87",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700,
                }}>+</button>
            )}
        </div>
    )
}