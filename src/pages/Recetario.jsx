import { useState, useMemo } from "react"

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #recetario-print, #recetario-print * { visibility: visible !important; }
  #recetario-print {
    position: fixed; inset: 0; z-index: 9999;
    background: #fff; padding: 32px;
    overflow: visible;
  }
  .receta-print-pagina { page-break-after: always; }
  .receta-print-pagina:last-child { page-break-after: avoid; }
}
`

const EQUIPOS = ["", "Horno", "Estufa", "Batidora", "Freidora de aire", "Microondas", "Ninguno", "Otro"]

const FORM_VACIO = {
    nombre: "", categoria: "Clásica", unidades: "",
    fotoBase64: "", fotoUrl: "",
    equipo: "", temperatura: "", tiempoCoccion: "",
    ingredientes: [], pasos: [],
}

const ING_VACIO = { nombre: "", cantidadUso: "", unidadUso: "taza" }
const UNIDADES_ING = ["taza", "g", "kg", "ml", "l", "cdta", "cda", "oz", "lb", "unidad", "pizca"]
const UNIDADES_PAQUETE = ["g", "kg", "ml", "l", "oz", "lb", "unidad"]

// Acepta "7,140.00" o "7.140,00" o "7140" → siempre devuelve número
function parsearNumero(valor) {
    if (!valor && valor !== 0) return 0
    const str = String(valor)
    if (str.includes(",") && str.includes(".")) {
        const ultimaComa = str.lastIndexOf(",")
        const ultimoPunto = str.lastIndexOf(".")
        if (ultimaComa > ultimoPunto) {
            return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0
        } else {
            return parseFloat(str.replace(/,/g, "")) || 0
        }
    }
    if (str.includes(",")) {
        const partes = str.split(",")
        if (partes.length === 2 && partes[1].length <= 2) {
            return parseFloat(str.replace(",", ".")) || 0
        }
        return parseFloat(str.replace(/,/g, "")) || 0
    }
    return parseFloat(str) || 0
}

// ── Modal para crear ingrediente nuevo en inventario ──
function ModalNuevoIngrediente({ nombreSugerido, onGuardar, onCancelar }) {
    const [form, setForm] = useState({
        nombre: nombreSugerido || "",
        cantidadPaquetes: "",
        tamañoPaquete: "",
        unidadPaquete: "g",
        costoPorPaquete: "",
        minimo: "",
        tipo: "ingrediente"
    })

    const numPaquetes = parsearNumero(form.cantidadPaquetes)
    const numTamaño = parsearNumero(form.tamañoPaquete)
    const numCosto = parsearNumero(form.costoPorPaquete)

    const totalInventario = numPaquetes * numTamaño
    const costoTotal = numPaquetes * numCosto
    const costoPorUnidad = totalInventario > 0 ? (costoTotal / totalInventario).toFixed(2) : null

    const handleGuardar = () => {
        if (!form.nombre.trim() || !form.cantidadPaquetes || !form.tamañoPaquete || !form.costoPorPaquete) return
        
        const datos = {
            id: crypto.randomUUID(),
            nombre: form.nombre.trim(),
            tipo: form.tipo || "ingrediente",
            cantidadPaquetes: numPaquetes,
            tamañoPaquete: numTamaño,
            unidad: form.unidadPaquete,
            costoPorPaquete: numCosto,
            minimo: parsearNumero(form.minimo) || "",
            cantidad: totalInventario,
            costoTotal: costoTotal,
            fecha: new Date().toISOString()
        }
        
        onGuardar(datos)
    }

    const inputStyle = {
        width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0",
        borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
        boxSizing: "border-box", background: "#fff", color: "#2d3748",
        transition: "border-color 0.2s",
    }

    const labelStyle = {
        fontSize: 11, fontWeight: 700, color: "#718096",
        textTransform: "uppercase", letterSpacing: "0.5px",
        display: "block", marginBottom: 6,
    }

    return (
        <div onClick={onCancelar} style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
                maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            }}>
                <div style={{ padding: "24px 28px", borderBottom: "2px solid #e8f8f5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, color: "#1a9e87" }}>🆕 Nuevo Ingrediente</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#718096" }}>
                                Agregar "{nombreSugerido}" al inventario
                            </p>
                        </div>
                        <button onClick={onCancelar} style={{
                            all: "unset", cursor: "pointer", fontSize: 24,
                            color: "#a0aec0", padding: 4,
                        }}>✕</button>
                    </div>
                </div>

                <div style={{ padding: "24px 28px" }}>
                    {/* Tipo */}
                    <div style={{ marginBottom: 16 }}>
                        <span style={labelStyle}>Tipo</span>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[
                                { valor: "ingrediente", label: "🧁 Ingrediente", color: "#6366f1" },
                                { valor: "insumo", label: "📦 Insumo", color: "#10b981" }
                            ].map(({ valor, label, color }) => (
                                <button
                                    key={valor}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, tipo: valor }))}
                                    style={{
                                        flex: 1, padding: "10px 0", borderRadius: 10,
                                        border: `2px solid ${form.tipo === valor ? color : "#e2e8f0"}`,
                                        background: form.tipo === valor ? color : "transparent",
                                        color: form.tipo === valor ? "#fff" : "#718096",
                                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                                        transition: "all 0.15s"
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <span style={labelStyle}>Nombre del ingrediente</span>
                        <input 
                            type="text" 
                            value={form.nombre}
                            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                            style={inputStyle}
                            placeholder="Ej: Harina de trigo"
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <div>
                            <span style={labelStyle}>Paquetes comprados *</span>
                            <input 
                                type="text"
                                inputMode="decimal"
                                value={form.cantidadPaquetes}
                                onChange={e => setForm(prev => ({ ...prev, cantidadPaquetes: e.target.value }))}
                                style={inputStyle}
                                placeholder="Ej: 2"
                            />
                        </div>
                        <div>
                            <span style={labelStyle}>Cantidad por paquete *</span>
                            <input 
                                type="text"
                                inputMode="decimal"
                                value={form.tamañoPaquete}
                                onChange={e => setForm(prev => ({ ...prev, tamañoPaquete: e.target.value }))}
                                style={inputStyle}
                                placeholder="Ej: 1000"
                            />
                        </div>
                        <div>
                            <span style={labelStyle}>Unidad</span>
                            <select 
                                value={form.unidadPaquete}
                                onChange={e => setForm(prev => ({ ...prev, unidadPaquete: e.target.value }))}
                                style={inputStyle}
                            >
                                {UNIDADES_PAQUETE.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <span style={labelStyle}>Costo por paquete (₡) *</span>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                                color: "#718096", fontWeight: 600, fontSize: 14, pointerEvents: "none"
                            }}>₡</span>
                            <input 
                                type="text"
                                inputMode="decimal"
                                value={form.costoPorPaquete}
                                onChange={e => setForm(prev => ({ ...prev, costoPorPaquete: e.target.value }))}
                                style={{ ...inputStyle, paddingLeft: 32 }}
                                placeholder="Ej: 7,140"
                            />
                        </div>
                        {numCosto > 0 && (
                            <small style={{ color: "#718096", marginTop: 4, display: "block" }}>
                                = ₡{numCosto.toLocaleString("es-CR")}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <span style={labelStyle}>Mínimo para alerta (opcional)</span>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={form.minimo}
                            onChange={e => setForm(prev => ({ ...prev, minimo: e.target.value }))}
                            style={inputStyle}
                            placeholder="Ej: 200"
                        />
                    </div>

                    {/* Preview del cálculo */}
                    {totalInventario > 0 && costoTotal > 0 && (
                        <div style={{
                            background: "#e8f8f5", border: "2px solid #2ec4a9",
                            borderRadius: 12, padding: 16, marginBottom: 20,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: "#1a9e87" }}>Total en inventario:</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#1a9e87" }}>
                                    {totalInventario.toLocaleString("es-CR")} {form.unidadPaquete}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: "#1a9e87" }}>Costo total:</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#1a9e87" }}>
                                    ₡{costoTotal.toLocaleString("es-CR")}
                                </span>
                            </div>
                            <div style={{ 
                                display: "flex", justifyContent: "space-between",
                                paddingTop: 8, borderTop: "1px solid #2ec4a9"
                            }}>
                                <span style={{ fontSize: 13, color: "#1a9e87", fontWeight: 600 }}>Costo por {form.unidadPaquete}:</span>
                                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a9e87" }}>
                                    ₡{costoPorUnidad}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button 
                            onClick={handleGuardar}
                            disabled={!form.nombre.trim() || !form.cantidadPaquetes || !form.tamañoPaquete || !form.costoPorPaquete}
                            style={{
                                flex: 1, padding: "12px 20px", borderRadius: 10,
                                background: (!form.nombre.trim() || !form.cantidadPaquetes || !form.tamañoPaquete || !form.costoPorPaquete) ? "#cbd5e0" : "#1a9e87",
                                color: "#fff", border: "none", cursor: (!form.nombre.trim() || !form.cantidadPaquetes || !form.tamañoPaquete || !form.costoPorPaquete) ? "not-allowed" : "pointer",
                                fontSize: 14, fontWeight: 600,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            💾 Guardar en inventario
                        </button>
                        <button 
                            onClick={onCancelar}
                            style={{
                                padding: "12px 20px", borderRadius: 10,
                                background: "#e2e8f0", color: "#4a5568", border: "none",
                                cursor: "pointer", fontSize: 14, fontWeight: 600,
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function inyectarEstiloImpresion() {
    if (document.getElementById("recetario-print-style")) return
    const style = document.createElement("style")
    style.id = "recetario-print-style"
    style.textContent = PRINT_STYLE
    document.head.appendChild(style)
}

function TarjetaReceta({ receta, onVerDetalle, onEliminar }) {
    const foto = receta.fotoBase64 || receta.fotoUrl
    const [confirmando, setConfirmando] = useState(false)

    return (
        <div style={{
            background: "#fff", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.15s, box-shadow 0.15s",
            border: "1px solid var(--gris-borde)",
            position: "relative",
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)" }}
        >
            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                {confirmando ? (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "#fff", border: "1.5px solid #fecaca",
                        borderRadius: 10, padding: "4px 8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                        <span style={{ fontSize: 11, color: "#e53e3e", fontWeight: 600 }}>¿Eliminar?</span>
                        <button type="button" onClick={e => { e.stopPropagation(); onEliminar(receta) }} style={{
                            all: "unset", cursor: "pointer", background: "#e53e3e", color: "#fff",
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        }}>Sí</button>
                        <button type="button" onClick={e => { e.stopPropagation(); setConfirmando(false) }} style={{
                            all: "unset", cursor: "pointer", background: "#e2e8f0", color: "#2d3748",
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        }}>No</button>
                    </div>
                ) : (
                    <button type="button" onClick={e => { e.stopPropagation(); setConfirmando(true) }} style={{
                        all: "unset", cursor: "pointer",
                        background: "rgba(255,255,255,0.9)", color: "#e53e3e",
                        width: 28, height: 28, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}>🗑</button>
                )}
            </div>

            <div onClick={() => onVerDetalle(receta)} style={{ cursor: "pointer" }}>
                <div style={{
                    width: "100%", height: 160,
                    background: foto ? "transparent" : "linear-gradient(135deg, var(--verde-claro), #d0f0ea)",
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                    {foto
                        ? <img src={foto} alt={receta.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none" }} />
                        : <span style={{ fontSize: 48 }}>🍩</span>}
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                        <h4 style={{ margin: 0, fontSize: 14, lineHeight: 1.3 }}>{receta.nombre}</h4>
                        <span style={{
                            fontSize: 11, background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                            padding: "3px 8px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                        }}>{receta.categoria}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 5 }}>
                        {receta.unidades ? `${receta.unidades} porciones` : ""}
                        {receta.equipo ? ` · ${receta.equipo}` : ""}
                        {receta.tiempoCoccion ? ` · ${receta.tiempoCoccion} min` : ""}
                    </p>
                    {receta.pasos?.length > 0 && (
                        <p style={{ fontSize: 11, color: "var(--texto-suave)", marginTop: 3 }}>
                            📋 {receta.pasos.length} paso{receta.pasos.length !== 1 ? "s" : ""}
                            {receta.ingredientes?.length > 0 ? ` · 🧁 ${receta.ingredientes.length} ingrediente${receta.ingredientes.length !== 1 ? "s" : ""}` : ""}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function ModalDetalle({ receta, onCerrar, onImprimir, onEditar, onEliminar }) {
    const foto = receta.fotoBase64 || receta.fotoUrl
    const [confirmando, setConfirmando] = useState(false)
    return (
        <div onClick={onCerrar} style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            padding: "24px 16px", overflowY: "auto",
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#fff", borderRadius: 18, width: "100%", maxWidth: 600,
                overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}>
                {foto && (
                    <img src={foto} alt={receta.nombre}
                        style={{ width: "100%", maxHeight: 260, objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none" }}
                    />
                )}
                <div style={{ padding: "20px 24px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 20 }}>{receta.nombre}</h3>
                            <p style={{ color: "var(--texto-suave)", fontSize: 13, marginTop: 4 }}>
                                {receta.categoria}{receta.unidades ? ` · ${receta.unidades} porciones` : ""}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button type="button" onClick={() => onEditar(receta)} style={{
                                all: "unset", cursor: "pointer", fontSize: 13, fontWeight: 600,
                                background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                                padding: "6px 12px", borderRadius: 8,
                            }}>✏️ Editar</button>
                            {confirmando ? (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    background: "#fff5f5", border: "1.5px solid #fecaca",
                                    borderRadius: 8, padding: "4px 8px",
                                }}>
                                    <span style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600 }}>¿Eliminar?</span>
                                    <button type="button" onClick={() => onEliminar(receta)} style={{
                                        all: "unset", cursor: "pointer", background: "#e53e3e", color: "#fff",
                                        fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                                    }}>Sí</button>
                                    <button type="button" onClick={() => setConfirmando(false)} style={{
                                        all: "unset", cursor: "pointer", background: "#e2e8f0", color: "#2d3748",
                                        fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                                    }}>No</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setConfirmando(true)} style={{
                                    all: "unset", cursor: "pointer", fontSize: 16,
                                    color: "#e53e3e", padding: "4px 8px",
                                }}>🗑</button>
                            )}
                            <button type="button" onClick={onCerrar} style={{
                                all: "unset", cursor: "pointer", fontSize: 20,
                                color: "var(--texto-suave)", lineHeight: 1, padding: "4px 8px",
                            }}>✕</button>
                        </div>
                    </div>

                    {(receta.equipo || receta.temperatura || receta.tiempoCoccion) && (
                        <div style={{
                            display: "flex", gap: 16, flexWrap: "wrap",
                            background: "var(--gris)", borderRadius: 10,
                            padding: "10px 16px", marginBottom: 20,
                        }}>
                            {receta.equipo && <span style={{ fontSize: 13 }}>🔧 <strong>{receta.equipo}</strong></span>}
                            {receta.temperatura && <span style={{ fontSize: 13 }}>🌡️ <strong>{receta.temperatura}°C</strong></span>}
                            {receta.tiempoCoccion && <span style={{ fontSize: 13 }}>⏱️ <strong>{receta.tiempoCoccion} min</strong></span>}
                        </div>
                    )}

                    {(receta.ingredientes || []).length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 10 }}>🧁 INGREDIENTES</p>
                            {receta.ingredientes.map((ing, i) => (
                                <div key={ing.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--gris-borde)", fontSize: 14 }}>
                                    <span>{ing.nombre}</span>
                                    <span style={{ color: "var(--texto-suave)" }}>{ing.cantidadUso} {ing.unidadUso}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {(receta.pasos || []).length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 10 }}>📋 ELABORACIÓN</p>
                            {receta.pasos.map((paso, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                        background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: 700, fontSize: 12,
                                    }}>{i + 1}</div>
                                    <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6, paddingTop: 2 }}>{paso}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="button" onClick={() => onImprimir([receta])} style={{
                        all: "unset", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "var(--verde-oscuro)", color: "#fff",
                        padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    }}>
                        🖨️ Imprimir esta receta
                    </button>
                </div>
            </div>
        </div>
    )
}

function VistaPrint({ recetas }) {
    return (
        <div id="recetario-print" style={{ display: "none" }}>
            {recetas.map(receta => {
                const foto = receta.fotoBase64 || receta.fotoUrl
                return (
                    <div key={receta.id} className="receta-print-pagina" style={{ padding: "0 0 40px" }}>
                        <div style={{ borderBottom: "3px solid #1a9e87", paddingBottom: 12, marginBottom: 20 }}>
                            <h1 style={{ margin: 0, fontSize: 26, color: "#1a9e87" }}>{receta.nombre}</h1>
                            <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 13 }}>
                                {receta.categoria}{receta.unidades ? ` · ${receta.unidades} porciones` : ""}
                            </p>
                        </div>
                        {foto && <img src={foto} alt={receta.nombre} style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} />}
                        {(receta.equipo || receta.temperatura || receta.tiempoCoccion) && (
                            <div style={{ display: "flex", gap: 24, background: "#f4f6f8", padding: "10px 16px", borderRadius: 8, marginBottom: 20, flexWrap: "wrap" }}>
                                {receta.equipo && <span style={{ fontSize: 13 }}>🔧 <strong>{receta.equipo}</strong></span>}
                                {receta.temperatura && <span style={{ fontSize: 13 }}>🌡️ <strong>{receta.temperatura}°C</strong></span>}
                                {receta.tiempoCoccion && <span style={{ fontSize: 13 }}>⏱️ <strong>{receta.tiempoCoccion} min</strong></span>}
                            </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: (receta.pasos || []).length > 0 ? "1fr 1fr" : "1fr", gap: 24 }}>
                            <div>
                                {(receta.ingredientes || []).length > 0 && (
                                    <>
                                        <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, marginBottom: 8 }}>🧁 INGREDIENTES</p>
                                        {receta.ingredientes.map((ing, i) => (
                                            <div key={ing.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                                                <span>{ing.nombre}</span>
                                                <span style={{ color: "#718096" }}>{ing.cantidadUso} {ing.unidadUso}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                            {(receta.pasos || []).length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 11, color: "#718096", letterSpacing: 0.5, marginBottom: 8 }}>📋 ELABORACIÓN</p>
                                    {receta.pasos.map((paso, i) => (
                                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                                background: "#e8f8f5", color: "#1a9e87",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 700, fontSize: 11,
                                            }}>{i + 1}</div>
                                            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, paddingTop: 2 }}>{paso}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Formulario de receta del recetario ──
function FormularioRecetario({ inicial, onGuardar, onCancelar, inventario = [], onAgregarIngredienteInventario }) {
    const [form, setForm] = useState(inicial || FORM_VACIO)
    const [ingForm, setIngForm] = useState(ING_VACIO)
    const [busquedaIng, setBusquedaIng] = useState("")
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
    const [modalNuevoIng, setModalNuevoIng] = useState(null)

    // Filtrar ingredientes del inventario según búsqueda
    const sugerencias = useMemo(() => {
        if (!busquedaIng.trim()) return []
        const busqueda = busquedaIng.toLowerCase()
        return inventario.filter(ing => 
            ing.nombre.toLowerCase().includes(busqueda) &&
            !form.ingredientes.some(i => i.nombre.toLowerCase() === ing.nombre.toLowerCase())
        ).slice(0, 5)
    }, [busquedaIng, inventario, form.ingredientes])

    const set = (campo, val) => setForm(prev => ({ ...prev, [campo]: val }))

    const seleccionarIngredienteExistente = (ingredienteInventario) => {
        setIngForm(prev => ({
            ...prev,
            nombre: ingredienteInventario.nombre,
        }))
        setBusquedaIng("")
        setMostrarSugerencias(false)
    }

    const handleAgregarIngrediente = () => {
        if (!ingForm.nombre.trim()) return
        
        // Verificar si el ingrediente existe en el inventario
        const existeEnInventario = inventario.some(ing => 
            ing.nombre.toLowerCase() === ingForm.nombre.trim().toLowerCase()
        )

        if (!existeEnInventario) {
            // Mostrar modal para crear el ingrediente
            setModalNuevoIng({ nombre: ingForm.nombre.trim() })
            return
        }

        // Si existe, agregar directamente
        agregarIngredienteALista()
    }

    const agregarIngredienteALista = () => {
        if (!ingForm.nombre.trim()) return
        
        setForm(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { ...ingForm, id: crypto.randomUUID() }]
        }))
        setIngForm(ING_VACIO)
        setBusquedaIng("")
    }

    const handleGuardarNuevoIngrediente = (nuevoIngrediente) => {
        // Guardar en inventario a través del callback del padre
        onAgregarIngredienteInventario(nuevoIngrediente)
        
        // Cerrar modal y agregar a la receta
        setModalNuevoIng(null)
        agregarIngredienteALista()
    }

    const eliminarIngrediente = (id) =>
        setForm(prev => ({ ...prev, ingredientes: prev.ingredientes.filter(i => i.id !== id) }))

    const agregarPaso = () =>
        setForm(prev => ({ ...prev, pasos: [...prev.pasos, ""] }))

    const editarPaso = (i, val) => {
        setForm(prev => {
            const pasos = [...prev.pasos]
            pasos[i] = val
            return { ...prev, pasos }
        })
    }

    const eliminarPaso = (i) =>
        setForm(prev => ({ ...prev, pasos: prev.pasos.filter((_, idx) => idx !== i) }))

    const handleFoto = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => set("fotoBase64", ev.target.result)
        reader.readAsDataURL(file)
    }

    const foto = form.fotoBase64 || form.fotoUrl

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
        <>
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>
                        {inicial ? "✏️ Editar receta" : "➕ Nueva receta"}
                    </h3>
                    <button type="button" onClick={onCancelar} style={{
                        all: "unset", cursor: "pointer", fontSize: 20,
                        color: "#718096", padding: "2px 8px",
                    }}>✕</button>
                </div>

                {/* Foto + campos básicos */}
                <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, width: 120, minWidth: 120, alignItems: "center" }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: 12,
                            border: "2px dashed #2ec4a9", background: "#e8f8f5",
                            overflow: "hidden", position: "relative",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {foto
                                ? <><img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button type="button" onClick={() => { set("fotoBase64", ""); set("fotoUrl", "") }} style={{
                                        all: "unset", cursor: "pointer", position: "absolute", top: 4, right: 4,
                                        background: "#e53e3e", color: "#fff", borderRadius: "50%",
                                        width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, fontWeight: 700,
                                    }}>✕</button></>
                                : <span style={{ fontSize: 32, opacity: 0.4 }}>📷</span>}
                        </div>
                        <label style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "#e8f8f5", color: "#1a9e87", border: "1.5px dashed #2ec4a9",
                            borderRadius: 8, padding: "6px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                        }}>
                            📁 Foto
                            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
                        </label>
                        <input type="url" placeholder="O link..." value={form.fotoUrl || ""}
                            onChange={e => { set("fotoUrl", e.target.value); set("fotoBase64", "") }}
                            style={{ ...inputStyle, fontSize: 11, padding: "5px 8px" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                            <span style={labelStyle}>Nombre de la receta</span>
                            <input type="text" value={form.nombre} placeholder="Ej: Minidonas San Valentín"
                                onChange={e => set("nombre", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <span style={labelStyle}>Categoría</span>
                            <input type="text" value={form.categoria}
                                onChange={e => set("categoria", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <span style={labelStyle}>Porciones</span>
                            <input type="number" value={form.unidades} placeholder="Ej: 24"
                                onChange={e => set("unidades", e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* Equipo + Temp + Tiempo — fila aparte */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 16 }}>
                    <div style={{ gridColumn: "span 2" }}>
                        <span style={labelStyle}>Equipo</span>
                        <select value={form.equipo} onChange={e => set("equipo", e.target.value)} style={inputStyle}>
                            {EQUIPOS.map(eq => <option key={eq} value={eq}>{eq || "Seleccionar..."}</option>)}
                        </select>
                    </div>
                    <div>
                        <span style={labelStyle}>Temp (°C)</span>
                        <input type="number" value={form.temperatura} placeholder="180"
                            onChange={e => set("temperatura", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <span style={labelStyle}>Tiempo (min)</span>
                        <input type="number" value={form.tiempoCoccion} placeholder="25"
                            onChange={e => set("tiempoCoccion", e.target.value)} style={inputStyle} />
                    </div>
                </div>
                {/* Ingredientes con búsqueda inteligente */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#718096", letterSpacing: 0.5, marginBottom: 12 }}>🧁 INGREDIENTES</p>
                    
                    <div style={{ position: "relative", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <div style={{ flex: 2, minWidth: 200, position: "relative" }}>
                                <input 
                                    type="text" 
                                    placeholder="Buscar o escribir ingrediente..."
                                    value={busquedaIng || ingForm.nombre}
                                    onChange={e => {
                                        setBusquedaIng(e.target.value)
                                        setIngForm(prev => ({ ...prev, nombre: e.target.value }))
                                        setMostrarSugerencias(true)
                                    }}
                                    onFocus={() => setMostrarSugerencias(true)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleAgregarIngrediente()
                                        }
                                    }}
                                    style={{ ...inputStyle }}
                                />
                                
                                {mostrarSugerencias && sugerencias.length > 0 && (
                                    <div style={{
                                        position: "absolute", top: "100%", left: 0, right: 0,
                                        background: "#fff", border: "1.5px solid #e2e8f0",
                                        borderRadius: 10, marginTop: 4, zIndex: 100,
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                                        maxHeight: 200, overflowY: "auto",
                                    }}>
                                        {sugerencias.map((ing, idx) => (
                                            <div 
                                                key={ing.id}
                                                onClick={() => seleccionarIngredienteExistente(ing)}
                                                style={{
                                                    padding: "10px 14px", cursor: "pointer",
                                                    borderBottom: idx < sugerencias.length - 1 ? "1px solid #f0f0f0" : "none",
                                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#f8fffe"}
                                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                            >
                                                <span style={{ fontSize: 14, fontWeight: 500 }}>{ing.nombre}</span>
                                                <span style={{ fontSize: 12, color: "#1a9e87", background: "#e8f8f5", padding: "2px 8px", borderRadius: 6 }}>
                                                    ₡{ing.costoTotal ? (ing.costoTotal / ing.cantidad).toFixed(0) : "?"}/{ing.unidad}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <input type="text" placeholder="Cantidad" value={ingForm.cantidadUso}
                                onChange={e => setIngForm(prev => ({ ...prev, cantidadUso: e.target.value }))}
                                style={{ ...inputStyle, flex: 1, minWidth: 80 }} />
                            
                            <select value={ingForm.unidadUso}
                                onChange={e => setIngForm(prev => ({ ...prev, unidadUso: e.target.value }))}
                                style={{ ...inputStyle, flex: 1, minWidth: 90 }}>
                                {UNIDADES_ING.map(u => <option key={u}>{u}</option>)}
                            </select>
                            
                            <button type="button" onClick={handleAgregarIngrediente} style={{
                                all: "unset", cursor: "pointer",
                                background: "#1a9e87", color: "#fff",
                                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                display: "flex", alignItems: "center", flexShrink: 0,
                            }}>+ Agregar</button>
                        </div>
                        
                        {mostrarSugerencias && (
                            <div 
                                onClick={() => setMostrarSugerencias(false)}
                                style={{ position: "fixed", inset: 0, zIndex: 50 }}
                            />
                        )}
                    </div>

                    {form.ingredientes.map(ing => (
                        <div key={ing.id} style={{ 
                            display: "flex", justifyContent: "space-between", alignItems: "center", 
                            padding: "8px 12px", background: "#f8fffe", borderRadius: 8, 
                            marginBottom: 5, fontSize: 14, border: "1.5px solid #e8f8f5",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 16 }}>🧁</span>
                                <span style={{ fontWeight: 500 }}>{ing.nombre}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ color: "#718096", fontSize: 13, background: "#fff", padding: "2px 8px", borderRadius: 6 }}>
                                    {ing.cantidadUso} {ing.unidadUso}
                                </span>
                                <button type="button" onClick={() => eliminarIngrediente(ing.id)} style={{
                                    all: "unset", cursor: "pointer", color: "#e53e3e", fontSize: 14, fontWeight: 700,
                                    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: 6,
                                }}>✕</button>
                            </div>
                        </div>
                    ))}
                    
                    {form.ingredientes.length === 0 && (
                        <p style={{ fontSize: 13, color: "#a0aec0", fontStyle: "italic", textAlign: "center", padding: 20 }}>
                            Agrega ingredientes buscando en el inventario o escribiendo uno nuevo
                        </p>
                    )}
                </div>

                {/* Pasos */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#718096", letterSpacing: 0.5, margin: 0 }}>📋 PASOS DE ELABORACIÓN</p>
                        <button type="button" onClick={agregarPaso} className="btn-secundario" style={{ fontSize: 12, padding: "5px 12px" }}>
                            + Agregar paso
                        </button>
                    </div>
                    {form.pasos.length === 0 && (
                        <p style={{ fontSize: 13, color: "#718096", fontStyle: "italic" }}>Sin pasos aún.</p>
                    )}
                    {form.pasos.map((paso, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 8,
                                background: "#e8f8f5", color: "#1a9e87",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, fontSize: 12,
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
                            <button type="button" className="btn-peligro" onClick={() => eliminarPaso(i)}
                                style={{ marginTop: 6, padding: "6px 10px" }}>✕</button>
                        </div>
                    ))}
                </div>

                <button type="button" className="btn-primario" onClick={() => onGuardar(form)}
                    disabled={!form.nombre.trim()}>
                    💾 {inicial ? "Actualizar receta" : "Guardar receta"}
                </button>
            </div>

            {modalNuevoIng && (
                <ModalNuevoIngrediente
                    nombreSugerido={modalNuevoIng.nombre}
                    onGuardar={handleGuardarNuevoIngrediente}
                    onCancelar={() => setModalNuevoIng(null)}
                />
            )}
        </>
    )
}

export default function Recetario({ db, actualizarDb }) {
    const [detalle, setDetalle] = useState(null)
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null)
    const [recetasParaImprimir, setRecetasParaImprimir] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("Todas")

    const recetas = db.recetario || []
    // CORREGIDO: Usar db.inventario en lugar de db.insumos
    const inventario = db.inventario || []
    const categorias = ["Todas", ...new Set(recetas.map(r => r.categoria).filter(Boolean))]

    const recetasFiltradas = recetas.filter(r => {
        const coincideBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const coincideCategoria = filtroCategoria === "Todas" || r.categoria === filtroCategoria
        return coincideBusqueda && coincideCategoria
    })

    const imprimir = (lista) => {
        inyectarEstiloImpresion()
        setRecetasParaImprimir(lista)
        setDetalle(null)
        setTimeout(() => {
            const el = document.getElementById("recetario-print")
            if (el) el.style.display = "block"
            window.print()
            if (el) el.style.display = "none"
        }, 100)
    }

    // CORREGIDO: Agregar al inventario correcto con formato de colones
    const agregarIngredienteInventario = (nuevoIngrediente) => {
        const inventarioActual = db.inventario || []
        actualizarDb("inventario", [...inventarioActual, nuevoIngrediente])
    }

    const guardarReceta = (form) => {
        if (!form.nombre.trim()) return

        const recetarioActual = db.recetario || []
        const recetasCostos = db.recetas || []

        // Usar id existente si editamos, o generar uno nuevo
        const recetarioId = editando?.id || crypto.randomUUID()

        const recetaRecetario = { ...form, id: recetarioId }

        const nuevoRecetario = editando
            ? recetarioActual.map(r => r.id === editando.id ? recetaRecetario : r)
            : [...recetarioActual, recetaRecetario]

        // Buscar si ya existe en recetas & costos
        const recetaCostosExistente = recetasCostos.find(r =>
            r.recetarioId === recetarioId ||
            r.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim()
        )

        // Mapear ingredientes con datos del inventario para costos
        const ingredientesParaCostos = form.ingredientes.map(ing => {
            const ingExistente = recetaCostosExistente?.ingredientes?.find(
                i => i.nombre.toLowerCase() === ing.nombre.toLowerCase()
            )
            if (ingExistente) return ingExistente

            const ingInventario = inventario.find(
                i => i.nombre.toLowerCase() === ing.nombre.toLowerCase()
            )
            return {
                id: crypto.randomUUID(),
                nombre: ing.nombre,
                cantidadUso: ing.cantidadUso,
                unidadUso: ing.unidadUso,
                cantidadPaquete: ingInventario?.tamañoPaquete || "",
                unidadPaquete: ingInventario?.unidad || "g",
                precioPaquete: ingInventario?.costoPorPaquete || "",
                costoParcial: "0",
            }
        })

        const datosBase = {
            nombre: form.nombre,
            categoria: form.categoria,
            unidades: form.unidades,
            fotoBase64: form.fotoBase64 || "",
            fotoUrl: form.fotoUrl || "",
            equipo: form.equipo || "",
            temperatura: form.temperatura || "",
            tiempoCoccion: form.tiempoCoccion || "",
            pasos: form.pasos || [],
            ingredientes: ingredientesParaCostos,
            recetarioId,
        }

        let nuevasRecetasCostos
        if (recetaCostosExistente) {
            // Actualizar receta existente conservando costos, márgenes e insumos
            nuevasRecetasCostos = recetasCostos.map(r =>
                r.id === recetaCostosExistente.id
                    ? { ...r, ...datosBase, fecha: new Date().toISOString() }
                    : r
            )
        } else {
            // Crear nueva entrada en recetas & costos
            nuevasRecetasCostos = [...recetasCostos, {
                ...datosBase,
                id: crypto.randomUUID(),
                insumos: [],
                margenMay: 35,
                margenMen: 70,
                envioGratis: false,
                costoTotal: 0,
                costoPorUnidad: 0,
                precioMayoreo: 0,
                precioMenudeo: 0,
                fecha: new Date().toISOString(),
            }]
        }

        actualizarDb("recetario", nuevoRecetario, { recetas: nuevasRecetasCostos })
        setMostrarFormulario(false)
        setEditando(null)
    }

    const eliminarReceta = (receta) => {
        const recetarioActual = db.recetario || []
        const recetasCostos = db.recetas || []
        
        const nuevoRecetario = recetarioActual.filter(r => r.id !== receta.id)
        
        const nuevasRecetasCostos = recetasCostos.map(r => {
            if (r.recetarioId === receta.id) {
                return { ...r, recetarioId: null }
            }
            return r
        })
        
        actualizarDb("recetario", nuevoRecetario, { recetas: nuevasRecetasCostos })
        setDetalle(null)
    }

    const abrirEditar = (receta) => {
        setEditando(receta)
        setDetalle(null)
        setMostrarFormulario(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <h2 className="page-titulo" style={{ margin: 0 }}>📖 Recetario</h2>
                <div style={{ display: "flex", gap: 8 }}>
                    {recetasFiltradas.length > 0 && (
                        <button type="button" onClick={() => imprimir(recetasFiltradas)} style={{
                            all: "unset", cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "var(--gris)", color: "var(--texto)",
                            padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                            border: "1.5px solid var(--gris-borde)",
                        }}>
                            🖨️ Imprimir ({recetasFiltradas.length})
                        </button>
                    )}
                    <button type="button" onClick={() => { setEditando(null); setMostrarFormulario(true) }} style={{
                        all: "unset", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "var(--verde-oscuro)", color: "#fff",
                        padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    }}>
                        ➕ Nueva receta
                    </button>
                </div>
            </div>

            {mostrarFormulario && (
                <FormularioRecetario
                    inicial={editando}
                    onGuardar={guardarReceta}
                    onCancelar={() => { setMostrarFormulario(false); setEditando(null) }}
                    inventario={inventario}
                    onAgregarIngredienteInventario={agregarIngredienteInventario}
                />
            )}

            {recetas.length > 0 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                    <input type="text" placeholder="🔍 Buscar receta..."
                        value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        style={{ flex: 1, minWidth: 180, maxWidth: 280 }}
                    />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {categorias.map(cat => (
                            <button key={cat} type="button" onClick={() => setFiltroCategoria(cat)} style={{
                                all: "unset", cursor: "pointer",
                                padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                                background: filtroCategoria === cat ? "var(--verde-oscuro)" : "var(--gris)",
                                color: filtroCategoria === cat ? "#fff" : "var(--texto)",
                                border: "1.5px solid " + (filtroCategoria === cat ? "var(--verde-oscuro)" : "transparent"),
                            }}>{cat}</button>
                        ))}
                    </div>
                </div>
            )}

            {recetas.length === 0 && !mostrarFormulario ? (
                <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🍩</div>
                    <h3 style={{ color: "var(--texto-suave)" }}>Sin recetas todavía</h3>
                    <p style={{ color: "var(--texto-suave)", fontSize: 14, marginBottom: 20 }}>
                        Creá tu primera receta con ingredientes y pasos de preparación.
                    </p>
                    <button type="button" className="btn-primario"
                        onClick={() => setMostrarFormulario(true)}>
                        ➕ Crear primera receta
                    </button>
                </div>
            ) : recetasFiltradas.length === 0 && recetas.length > 0 ? (
                <p style={{ color: "var(--texto-suave)", textAlign: "center", padding: 32 }}>
                    No hay recetas que coincidan con la búsqueda.
                </p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {recetasFiltradas.map(receta => (
                        <TarjetaReceta key={receta.id} receta={receta} onVerDetalle={setDetalle} onEliminar={eliminarReceta} />
                    ))}
                </div>
            )}

            {detalle && (
                <ModalDetalle
                    receta={detalle}
                    onCerrar={() => setDetalle(null)}
                    onImprimir={imprimir}
                    onEditar={abrirEditar}
                    onEliminar={eliminarReceta}
                />
            )}

            {recetasParaImprimir.length > 0 && <VistaPrint recetas={recetasParaImprimir} />}
        </div>
    )
}