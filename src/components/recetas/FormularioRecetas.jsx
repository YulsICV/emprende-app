import React, { useState, useEffect, useRef } from "react"

const EQUIPOS = ["Horno", "Estufa", "Batidora", "Freidora de aire", "Microondas", "Ninguno", "Otro"]

function SelectorCategoria({ value, onChange, categorias, onAgregarCategoria }) {
    const [mostrar, setMostrar] = useState(false)
    const [nueva, setNueva] = useState("")
    const inputRef = useRef(null)

    const handleAgregar = () => {
        const limpia = nueva.trim()
        if (!limpia) return
        onAgregarCategoria(limpia)
        setNueva("")
        setMostrar(false)
    }
    const handleToggle = () => {
        setMostrar(v => {
            if (!v) setTimeout(() => inputRef.current?.focus(), 50)
            return !v
        })
    }

    const inputStyle = {
        width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box", background: "#fff", color: "#2d3748",
    }
    const labelStyle = {
        fontSize: 11, fontWeight: 700, color: "#718096",
        textTransform: "uppercase", letterSpacing: "0.5px",
        display: "block", marginBottom: 4,
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={labelStyle}>Categoría</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {!mostrar ? (
                    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                        {categorias.map((cat, i) => <option key={i}>{cat}</option>)}
                    </select>
                ) : (
                    <>
                        <input ref={inputRef} type="text" placeholder="Ej: Sin azúcar..."
                            value={nueva} onChange={e => setNueva(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAgregar()}
                            style={{ ...inputStyle, flex: 1 }} />
                        <button type="button" onClick={handleAgregar} style={{
                            all: "unset", cursor: "pointer", padding: "9px 16px",
                            borderRadius: 10, flexShrink: 0, background: "#1a9e87",
                            color: "#fff", fontSize: 13, fontWeight: 600,
                        }}>+ Agregar</button>
                    </>
                )}
                <button type="button" onClick={handleToggle} title="Nueva categoría" style={{
                    all: "unset", cursor: "pointer", width: 36, height: 36,
                    borderRadius: 10, flexShrink: 0,
                    background: mostrar ? "#1a9e87" : "#e8f8f5",
                    color: mostrar ? "#fff" : "#1a9e87",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, border: "1.5px solid #2ec4a9",
                }}>{mostrar ? "✕" : "+"}</button>
            </div>
        </div>
    )
}

export default function FormularioRecetas({
    form, setForm, recetario = [], onJalarReceta,
    precioMayoreo = 0, precioMenudeo = 0, costoPorUnidad = 0
}) {
    const [categorias, setCategorias] = useState(() => {
        const saved = localStorage.getItem("categorias")
        return saved ? JSON.parse(saved) : ["Sencilla", "Clásica", "Especial", "Premium"]
    })
    const [sugerencias, setSugerencias] = useState([])
    const [mostrarSug, setMostrarSug] = useState(false)

    useEffect(() => {
        localStorage.setItem("categorias", JSON.stringify(categorias))
    }, [categorias])

    const inputStyle = {
        width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box", background: "#fff", color: "#2d3748",
    }
    const labelStyle = {
        fontSize: 11, fontWeight: 700, color: "#718096",
        textTransform: "uppercase", letterSpacing: "0.5px",
        display: "block", marginBottom: 4,
    }

    const handleNombreChange = (val) => {
        setForm(prev => ({ ...prev, nombre: val }))
        if (val.trim().length > 0 && recetario.length > 0) {
            const matches = recetario.filter(r =>
                r.nombre.toLowerCase().includes(val.toLowerCase())
            )
            setSugerencias(matches)
            setMostrarSug(matches.length > 0)
        } else {
            setSugerencias([])
            setMostrarSug(false)
        }
    }

    const agregarCategoria = (limpia) => {
        if (categorias.includes(limpia)) return
        setCategorias([...categorias, limpia])
        setForm(prev => ({ ...prev, categoria: limpia }))
    }

    const handleFotoFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => setForm(prev => ({ ...prev, fotoBase64: ev.target.result, fotoUrl: "" }))
        reader.readAsDataURL(file)
    }

    const agregarPaso = () =>
        setForm(prev => ({ ...prev, pasos: [...(prev.pasos || []), ""] }))
    const editarPaso = (i, val) => {
        setForm(prev => {
            const pasos = [...(prev.pasos || [])]
            pasos[i] = val
            return { ...prev, pasos }
        })
    }
    const eliminarPaso = (i) =>
        setForm(prev => ({ ...prev, pasos: (prev.pasos || []).filter((_, idx) => idx !== i) }))

    const foto = form.fotoBase64 || form.fotoUrl

    return (
        <div style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            padding: 24, marginBottom: 20,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "#2d3748" }}>
                    {form.nombre ? `✏️ ${form.nombre}` : "➕ Nueva receta"}
                </h3>
                <label style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    cursor: "pointer", userSelect: "none",
                    padding: "6px 10px", borderRadius: 8,
                    border: `1.5px solid ${form.envioGratis ? "#10b981" : "#e2e8f0"}`,
                    background: form.envioGratis ? "#f0fdf4" : "transparent",
                    transition: "all 0.2s",
                }}>
                    <div style={{
                        width: 30, height: 16, borderRadius: 8,
                        background: form.envioGratis ? "#10b981" : "#cbd5e1",
                        position: "relative", transition: "background 0.2s",
                    }}>
                        <div style={{
                            position: "absolute", top: 2,
                            left: form.envioGratis ? 15 : 2,
                            width: 12, height: 12, borderRadius: "50%",
                            background: "#fff", transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                        <input type="checkbox" checked={!!form.envioGratis}
                            onChange={e => setForm(prev => ({ ...prev, envioGratis: e.target.checked }))}
                            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                    </div>
                    <span style={{
                        fontSize: 11, whiteSpace: "nowrap",
                        color: form.envioGratis ? "#059669" : "#718096",
                        fontWeight: form.envioGratis ? 600 : 400,
                    }}>🚚 Envío gratis</span>
                </label>
            </div>

            <div style={{
                display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "center",
                marginBottom: 16, flexWrap: "wrap",
            }}>
                <div style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, width: 120, minWidth: 120, alignItems: "center", margin: "0 auto",
                }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: 12,
                        border: "2px dashed #2ec4a9", background: "#e8f8f5",
                        overflow: "hidden", position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {foto ? (
                            <>
                                <img src={foto} alt="foto"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={e => { e.target.style.display = "none" }} />
                                <button type="button"
                                    onClick={() => setForm(prev => ({ ...prev, fotoBase64: "", fotoUrl: "" }))}
                                    style={{
                                        all: "unset", cursor: "pointer",
                                        position: "absolute", top: 4, right: 4,
                                        background: "#e53e3e", color: "#fff", borderRadius: "50%",
                                        width: 18, height: 18, display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        fontSize: 10, fontWeight: 700,
                                    }}>✕</button>
                            </>
                        ) : (
                            <span style={{ fontSize: 32, opacity: 0.4 }}>📷</span>
                        )}
                    </div>
                    <label style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#e8f8f5", color: "#1a9e87", border: "1.5px dashed #2ec4a9",
                        borderRadius: 8, padding: "6px", cursor: "pointer",
                        fontSize: 11, fontWeight: 600,
                        width: "100%", boxSizing: "border-box",
                    }}>
                        📁 Foto
                        <input type="file" accept="image/*" onChange={handleFotoFile} style={{ display: "none" }} />
                    </label>
                    <input type="url" placeholder="O link..."
                        value={form.fotoUrl || ""}
                        onChange={e => setForm(prev => ({ ...prev, fotoUrl: e.target.value, fotoBase64: "" }))}
                        style={{ ...inputStyle, fontSize: 11, padding: "5px 8px", width: "100%", boxSizing: "border-box" }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ position: "relative" }}>
                        <span style={labelStyle}>Nombre de la receta</span>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={e => handleNombreChange(e.target.value)}
                            onFocus={() => sugerencias.length > 0 && setMostrarSug(true)}
                            onBlur={() => setTimeout(() => setMostrarSug(false), 150)}
                            placeholder="Ej: Minidonas San Valentín"
                            style={inputStyle}
                        />
                        {mostrarSug && sugerencias.length > 0 && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                                background: "#fff", border: "1.5px solid #e2e8f0",
                                borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                overflow: "hidden", marginTop: 2,
                            }}>
                                {sugerencias.map(r => (
                                    // FIX Bug 3: usar _id en vez de id (MongoDB)
                                    <div key={r._id}
                                        onMouseDown={() => { onJalarReceta(r); setMostrarSug(false) }}
                                        style={{
                                            padding: "9px 14px", cursor: "pointer", fontSize: 14,
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            borderBottom: "1px solid #f4f4f4",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#e8f8f5"}
                                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                    >
                                        <span>{r.nombre}</span>
                                        <span style={{
                                            fontSize: 11, color: "#718096",
                                            background: "#f4f6f8", padding: "2px 8px", borderRadius: 6,
                                        }}>{r.categoria}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <SelectorCategoria
                        value={form.categoria}
                        onChange={cat => setForm(prev => ({ ...prev, categoria: cat }))}
                        categorias={categorias}
                        onAgregarCategoria={agregarCategoria}
                    />

                    <div>
                        <span style={labelStyle}>Unidades producidas</span>
                        <input type="number" value={form.unidades} placeholder="Ej: 24"
                            onChange={e => setForm(prev => ({ ...prev, unidades: e.target.value }))}
                            style={inputStyle} />
                    </div>
                </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", marginBottom: 12, letterSpacing: 0.5, margin: "0 0 12px 0" }}>
                    💰 MÁRGENES DE GANANCIA
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: costoPorUnidad > 0 ? 12 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={labelStyle}>Margen mayoreo (%)</span>
                        <input type="number" value={form.margenMay}
                            onChange={e => setForm(prev => ({ ...prev, margenMay: parseFloat(e.target.value) }))}
                            style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={labelStyle}>Margen menudeo (%)</span>
                        <input type="number" value={form.margenMen}
                            onChange={e => setForm(prev => ({ ...prev, margenMen: parseFloat(e.target.value) }))}
                            style={inputStyle} />
                    </div>
                </div>
                {costoPorUnidad > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{
                            background: "#e8f8f5", borderRadius: 10, padding: "10px 14px",
                            borderLeft: "3px solid var(--acento)",
                        }}>
                            <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, marginBottom: 2 }}>PRECIO MAYOREO</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--verde-oscuro)" }}>₡{precioMayoreo}</div>
                        </div>
                        <div style={{
                            background: "#fff8ee", borderRadius: 10, padding: "10px 14px",
                            borderLeft: "3px solid var(--canela)",
                        }}>
                            <div style={{ fontSize: 11, color: "#718096", fontWeight: 700, marginBottom: 2 }}>PRECIO MENUDEO</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--canela)" }}>₡{precioMenudeo}</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", marginBottom: 12, margin: "0 0 12px 0", letterSpacing: 0.5 }}>
                    🍳 CONDICIONES DE PREPARACIÓN
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <span style={labelStyle}>Equipo</span>
                        <select value={form.equipo || ""}
                            onChange={e => setForm(prev => ({ ...prev, equipo: e.target.value }))}
                            style={inputStyle}>
                            <option value="">Ninguno</option>
                            {EQUIPOS.map(eq => <option key={eq}>{eq}</option>)}
                        </select>
                    </div>
                    <div>
                        <span style={labelStyle}>Temperatura (°C)</span>
                        <input type="number" placeholder="Ej: 180" value={form.temperatura || ""}
                            onChange={e => setForm(prev => ({ ...prev, temperatura: e.target.value }))}
                            style={inputStyle} />
                    </div>
                    <div>
                        <span style={labelStyle}>Tiempo cocción (min)</span>
                        <input type="number" placeholder="25" value={form.tiempoCoccion || ""}
                            onChange={e => setForm(prev => ({ ...prev, tiempoCoccion: e.target.value }))}
                            style={inputStyle} />
                    </div>
                </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, margin: 0 }}>
                        📋 PASOS DE ELABORACIÓN
                    </p>
                    <button type="button" onClick={agregarPaso}
                        style={{
                            all: "unset", cursor: "pointer",
                            background: "#e8f8f5", color: "#1a9e87",
                            padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        }}>
                        + Agregar paso
                    </button>
                </div>
                {(!form.pasos || form.pasos.length === 0) && (
                    <p style={{ fontSize: 13, color: "#718096", fontStyle: "italic" }}>
                        Sin pasos aún.
                    </p>
                )}
                {(form.pasos || []).map((paso, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: "#e8f8f5", color: "#1a9e87",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 8,
                        }}>{i + 1}</div>
                        <textarea value={paso} onChange={e => editarPaso(i, e.target.value)}
                            placeholder={`Paso ${i + 1}...`} rows={2}
                            style={{
                                flex: 1, padding: "9px 12px", border: "1.5px solid #e2e8f0",
                                borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical",
                                outline: "none", boxSizing: "border-box",
                            }}
                            onFocus={e => e.target.style.borderColor = "#2ec4a9"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                        <button type="button" onClick={() => eliminarPaso(i)}
                            style={{
                                all: "unset", cursor: "pointer",
                                marginTop: 6, padding: "6px 10px",
                                color: "#e53e3e", fontWeight: 700,
                            }}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    )
}