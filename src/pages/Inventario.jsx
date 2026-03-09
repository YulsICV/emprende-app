import { useState } from "react"

const UNIDADES = ["g", "kg", "ml", "L", "unidad", "paquete", "taza", "sobre", "caja"]

const FORM_INICIAL = {
    nombre: "",
    cantidadPaquetes: "",
    tamañoPaquete: "",
    unidad: "g",
    costoPorPaquete: "",
    minimo: "",
    tipo: "ingrediente"
}

// Acepta "7,140.00", "7.140,00", "7140", "1/2", "3/4", "1 1/2" → siempre devuelve número
function parsearNumero(valor) {
    if (!valor && valor !== 0) return 0
    const str = String(valor).trim()

    // Fracciones: "1/2", "3/4", "1 1/2", "2 1/4"
    const fracMixta = str.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (fracMixta) {
        return parseInt(fracMixta[1]) + parseInt(fracMixta[2]) / parseInt(fracMixta[3])
    }
    const fracSimple = str.match(/^(\d+)\/(\d+)$/)
    if (fracSimple) {
        return parseInt(fracSimple[1]) / parseInt(fracSimple[2])
    }

    // Si tiene coma Y punto: el último separador es el decimal
    if (str.includes(",") && str.includes(".")) {
        const ultimaComa = str.lastIndexOf(",")
        const ultimoPunto = str.lastIndexOf(".")
        if (ultimaComa > ultimoPunto) {
            return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0
        } else {
            return parseFloat(str.replace(/,/g, "")) || 0
        }
    }
    // Solo coma: puede ser decimal (1,5) o miles (7,140)
    if (str.includes(",")) {
        const partes = str.split(",")
        if (partes.length === 2 && partes[1].length <= 2) {
            return parseFloat(str.replace(",", ".")) || 0
        }
        return parseFloat(str.replace(/,/g, "")) || 0
    }
    return parseFloat(str) || 0
}

// Sugiere conversión a unidad más natural (ej: 0.5 kg → 500 g)
function sugerirConversion(valor, unidad) {
    const num = parsearNumero(valor)
    if (!num || Number.isInteger(num * 1000) === false) return null
    if ((unidad === "kg" || unidad === "L") && num > 0 && num < 1) {
        const factor = unidad === "kg" ? 1000 : 1000
        const nuevaUnidad = unidad === "kg" ? "g" : "ml"
        const nuevaVal = Math.round(num * factor)
        return { valor: nuevaVal, unidad: nuevaUnidad }
    }
    if ((unidad === "kg" || unidad === "L") && !Number.isInteger(num) && num > 0) {
        const factor = 1000
        const nuevaUnidad = unidad === "kg" ? "g" : "ml"
        const nuevaVal = Math.round(num * factor)
        return { valor: nuevaVal, unidad: nuevaUnidad }
    }
    return null
}

// Muestra número con formato ₡ amigable mientras escribís
function InputMoneda({ label, value, onChange, placeholder }) {
    return (
        <div className="form-grupo">
            <label>{label}</label>
            <div style={{ position: "relative" }}>
                <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    color: "var(--texto-suave)", fontWeight: 600, pointerEvents: "none"
                }}>₡</span>
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder || "0"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ paddingLeft: 24 }}
                />
            </div>
            {value && parsearNumero(value) > 0 && (
                <small style={{ color: "var(--texto-suave)", marginTop: 2, display: "block" }}>
                    = ₡{parsearNumero(value).toLocaleString("es-CR")}
                </small>
            )}
        </div>
    )
}

function InputNumero({ label, value, onChange, placeholder }) {
    return (
        <div className="form-grupo">
            <label>{label}</label>
            <input
                type="text"
                inputMode="decimal"
                placeholder={placeholder || "0"}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

export default function Inventario({ db, actualizarDb }) {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [modalEliminar, setModalEliminar] = useState(null)

    const inventario = db.inventario || []

    const numPaquetes = parsearNumero(form.cantidadPaquetes)
    const numTamaño = parsearNumero(form.tamañoPaquete)
    const numCosto = parsearNumero(form.costoPorPaquete)
    const numMinimo = parsearNumero(form.minimo)

    // Sugerencia de conversión cuando el tamaño tiene decimales en kg/L
    const sugerencia = sugerirConversion(form.tamañoPaquete, form.unidad)

    const aplicarSugerencia = () => {
        if (!sugerencia) return
        setForm(f => ({ ...f, tamañoPaquete: String(sugerencia.valor), unidad: sugerencia.unidad }))
    }

    const totalInventario = numPaquetes * numTamaño
    const costoTotal = numPaquetes * numCosto

    const bajoStock = inventario.filter(i =>
        i.minimo && parsearNumero(i.cantidad) <= parsearNumero(i.minimo)
    )

    const itemsFiltrados = inventario.filter(i =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    // ── MÉTRICAS RESUMEN ──
    // Valor actual del inventario (lo que tenés hoy en stock)
    const valorInventarioActual = inventario.reduce((s, i) => {
        if (!i.costoTotal || !i.cantidad || !i.tamañoPaquete || !i.cantidadPaquetes) return s
        const costoPorUnidad = parsearNumero(i.costoTotal) / parsearNumero(i.cantidad)
        return s + costoPorUnidad * parsearNumero(i.cantidad)
    }, 0)

    // Total invertido al comprarlo (lo que pagaste originalmente por todo)
    const totalInvertido = inventario.reduce((s, i) =>
        s + parsearNumero(i.costoTotal), 0
    )

    // Consumo en ₡ al entregar pedidos: pedidos entregados × costo ingrediente por unidad
    const costoConsumidoPedidos = (db.pedidos || [])
        .filter(p => p.estado === "entregado")
        .reduce((total, pedido) => {
            const receta = (db.recetas || []).find(r => r.nombre === pedido.recetaNombre)
            if (!receta) return total
            const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
            const todosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
            const costoReceta = todosItems.reduce((s, ing) => {
                const item = inventario.find(i =>
                    i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
                )
                if (!item || !item.costoTotal || !item.cantidad) return s
                const costoPorUnidad = parsearNumero(item.costoTotal) / parsearNumero(item.cantidad)
                return s + costoPorUnidad * (parseFloat(ing.cantidadUso) || 0) * factor
            }, 0)
            return total + costoReceta
        }, 0)

    // Consumo en unidades/g por producto (para mostrar qué bajó)
    const consumoPorProducto = {}
    ;(db.pedidos || [])
        .filter(p => p.estado === "entregado")
        .forEach(pedido => {
            const receta = (db.recetas || []).find(r => r.nombre === pedido.recetaNombre)
            if (!receta?.ingredientes) return
            const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
            receta.ingredientes.forEach(ing => {
                const key = ing.nombre
                const consumo = (parseFloat(ing.cantidadUso) || 0) * factor
                consumoPorProducto[key] = (consumoPorProducto[key] || 0) + consumo
            })
        })
    const topConsumo = Object.entries(consumoPorProducto)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    const guardar = () => {
        if (!form.nombre || !form.cantidadPaquetes || !form.tamañoPaquete) return

        const total = numPaquetes * numTamaño
        const costo = numPaquetes * numCosto

        const datos = {
            nombre: form.nombre,
            tipo: form.tipo || "ingrediente",
            cantidadPaquetes: numPaquetes,
            tamañoPaquete: numTamaño,
            unidad: form.unidad,
            costoPorPaquete: numCosto,
            minimo: numMinimo || "",
            cantidad: total,
            costoTotal: costo
        }

        if (editandoId) {
            actualizarDb("inventario", inventario.map(i =>
                i.id === editandoId ? { ...datos, id: editandoId } : i
            ))
            setEditandoId(null)
        } else {
            actualizarDb("inventario", [...inventario, {
                ...datos,
                id: crypto.randomUUID(),
                fecha: new Date().toISOString()
            }])
        }

        setForm(FORM_INICIAL)
    }

    const editar = (item) => {
        setForm({
            nombre: item.nombre,
            tipo: item.tipo || "ingrediente",
            cantidadPaquetes: String(item.cantidadPaquetes),
            tamañoPaquete: String(item.tamañoPaquete),
            unidad: item.unidad || "g",
            costoPorPaquete: item.costoPorPaquete ? String(item.costoPorPaquete) : "",
            minimo: item.minimo ? String(item.minimo) : ""
        })
        setEditandoId(item.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = (id) => {
        actualizarDb("inventario", inventario.filter(i => i.id !== id))
        setModalEliminar(null)
    }

    return (
        <div>
            <h2 className="page-titulo">📦 Inventario</h2>

            {/* Alertas stock bajo */}
            {bajoStock.length > 0 && (
                <div className="alerta">
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Productos con stock bajo:</p>
                    {bajoStock.map(i => (
                        <p key={i.id} style={{ margin: "2px 0" }}>
                            • <strong>{i.nombre}</strong>: {parsearNumero(i.cantidad).toFixed(1)}{i.unidad}
                            {i.minimo && (
                                <span style={{ color: "var(--texto-suave)" }}>
                                    {" "}(mín. {i.minimo}{i.unidad})
                                </span>
                            )}
                        </p>
                    ))}
                </div>
            )}

            {/* ── LAYOUT DOS COLUMNAS: FORMULARIO | RESUMEN ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: inventario.length > 0 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
                gap: 16,
                alignItems: "start"
            }}>

            {/* ── RESUMEN INVENTARIO ── */}
            {inventario.length > 0 && (
                <div className="card" style={{ order: 2 }}>
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📊 Resumen del inventario</h3>

                    {/* Tarjetas principales */}
                    <div className="resumen-grid" style={{ marginBottom: 16 }}>
                        <div className="resumen-item" style={{ borderLeft: "3px solid var(--acento)" }}>
                            <div className="valor">₡{valorInventarioActual.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                            <div className="etiqueta">💰 Valor stock actual</div>
                        </div>
                        <div className="resumen-item" style={{ borderLeft: "3px solid #6366f1" }}>
                            <div className="valor">₡{totalInvertido.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                            <div className="etiqueta">🛒 Total invertido</div>
                        </div>
                        <div className="resumen-item" style={{ borderLeft: "3px solid #10b981" }}>
                            <div className="valor">₡{costoConsumidoPedidos.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                            <div className="etiqueta">🍩 Consumido en pedidos</div>
                        </div>
                        <div className="resumen-item" style={{ borderLeft: "3px solid #f59e0b" }}>
                            <div className="valor">{inventario.length}</div>
                            <div className="etiqueta">📦 Productos en stock</div>
                        </div>
                    </div>

                    {/* Top ingredientes más consumidos */}
                    {topConsumo.length > 0 && (
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--texto-suave)", marginBottom: 10, letterSpacing: 0.5 }}>
                                MÁS USADOS EN PEDIDOS ENTREGADOS
                            </p>
                            {topConsumo.map(([nombre, cantidad]) => {
                                const item = inventario.find(i => i.nombre.toLowerCase().trim() === nombre.toLowerCase().trim())
                                const unidad = item?.unidad || ""
                                const stockActual = parsearNumero(item?.cantidad)
                                const porcentajeStock = item ? Math.min(100, (stockActual / (parsearNumero(item.tamañoPaquete) * parsearNumero(item.cantidadPaquetes))) * 100) : 0
                                return (
                                    <div key={nombre} style={{ marginBottom: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 14 }}>
                                            <span>{nombre}</span>
                                            <div style={{ display: "flex", gap: 12 }}>
                                                <span style={{ color: "var(--texto-suave)" }}>
                                                    consumido: <strong>{cantidad.toFixed(1)}{unidad}</strong>
                                                </span>
                                                <span style={{ color: stockActual < (parsearNumero(item?.minimo) || Infinity) ? "#d97706" : "var(--acento)" }}>
                                                    stock: <strong>{stockActual.toFixed(1)}{unidad}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ height: 5, background: "var(--borde)", borderRadius: 3 }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${porcentajeStock}%`,
                                                background: porcentajeStock < 20 ? "#ef4444" : porcentajeStock < 50 ? "#f59e0b" : "var(--acento)",
                                                borderRadius: 3,
                                                transition: "width 0.4s"
                                            }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── FORMULARIO ── */}
            <div className="card" style={{ order: 1 }}>
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                    {editandoId ? "✏️ Editar item" : "➕ Agregar al inventario"}
                </h3>

                <div className="form-grupo">
                    <label>Producto *</label>
                    <input
                        type="text"
                        placeholder="Ej: Harina, Fondant, Bolsas..."
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>

                <div className="form-grupo">
                    <label>Tipo</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { valor: "ingrediente", label: "🧁 Ingrediente", color: "#6366f1" },
                            { valor: "insumo", label: "📦 Insumo de empaque", color: "#10b981" }
                        ].map(({ valor, label, color }) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => setForm({ ...form, tipo: valor })}
                                style={{
                                    flex: 1, padding: "8px 0", borderRadius: 8,
                                    border: `2px solid ${form.tipo === valor ? color : "var(--borde)"}`,
                                    background: form.tipo === valor ? color : "transparent",
                                    color: form.tipo === valor ? "#fff" : "var(--texto-suave)",
                                    cursor: "pointer", fontSize: 13, fontWeight: 600,
                                    transition: "all 0.15s"
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <InputNumero
                        label="¿Cuántos paquetes? *"
                        value={form.cantidadPaquetes}
                        onChange={v => setForm({ ...form, cantidadPaquetes: v })}
                        placeholder="Ej: 2"
                    />
                    <div className="form-grupo">
                        <label style={{ textTransform: "none", fontSize: 12 }}>Cantidad por paquete *</label>
                        <div style={{ display: "flex", gap: 6 }}>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Ej: 910 ó 1/2"
                                value={form.tamañoPaquete}
                                onChange={e => setForm({ ...form, tamañoPaquete: e.target.value })}
                                style={{ flex: 1, minWidth: 0 }}
                            />
                            <select
                                value={form.unidad}
                                onChange={e => setForm({ ...form, unidad: e.target.value })}
                                style={{ width: 72, flexShrink: 0 }}
                            >
                                {UNIDADES.map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        {/* Preview de fracción */}
                        {form.tamañoPaquete && parsearNumero(form.tamañoPaquete) > 0 &&
                         form.tamañoPaquete.includes("/") && (
                            <small style={{ color: "var(--acento)", marginTop: 3, display: "block", fontWeight: 600 }}>
                                = {parsearNumero(form.tamañoPaquete)} {form.unidad}
                            </small>
                        )}
                        {/* Sugerencia para conversión */}
                        {sugerencia && (
                            <div style={{
                                marginTop: 6, padding: "7px 10px", borderRadius: 8,
                                background: "#fffbeb", border: "1.5px solid #fcd34d",
                                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                            }}>
                                <span style={{ color: "#92400e", fontSize: 12, lineHeight: 1.3 }}>
                                    💡 <strong>{sugerencia.valor} {sugerencia.unidad}</strong> es más exacto
                                </span>
                                <button type="button" onClick={aplicarSugerencia} style={{
                                    all: "unset", cursor: "pointer", whiteSpace: "nowrap",
                                    color: "#fff", background: "#f59e0b",
                                    fontSize: 11, fontWeight: 700,
                                    padding: "4px 10px", borderRadius: 6, flexShrink: 0,
                                }}>Usar {sugerencia.valor}{sugerencia.unidad}</button>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <InputMoneda
                        label="₡ Costo por paquete"
                        value={form.costoPorPaquete}
                        onChange={v => setForm({ ...form, costoPorPaquete: v })}
                        placeholder="Ej: 7,140"
                    />
                    <InputNumero
                        label="Mínimo para alerta"
                        value={form.minimo}
                        onChange={v => setForm({ ...form, minimo: v })}
                        placeholder="Ej: 200"
                    />
                </div>

                {/* Preview del total */}
                {numPaquetes > 0 && numTamaño > 0 && (
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">
                                {totalInventario.toLocaleString("es-CR")}{form.unidad}
                            </div>
                            <div className="etiqueta">Total en inventario</div>
                        </div>
                        {costoTotal > 0 && (
                            <div className="resumen-item">
                                <div className="valor">₡{costoTotal.toLocaleString("es-CR")}</div>
                                <div className="etiqueta">Costo total</div>
                            </div>
                        )}
                        {costoTotal > 0 && totalInventario > 0 && (
                            <div className="resumen-item">
                                <div className="valor">
                                    ₡{(costoTotal / totalInventario).toFixed(2)}
                                </div>
                                <div className="etiqueta">Costo por {form.unidad}</div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn-primario" type="button" onClick={guardar}>
                        {editandoId ? "✏️ Actualizar" : "💾 Agregar al inventario"}
                    </button>
                    {editandoId && (
                        <button className="btn-secundario" type="button" onClick={cancelarEdicion}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </div>

            </div>{/* fin grid dos columnas */}

            {/* ── TABLA ── */}
            {inventario.length > 0 && (
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3 className="seccion-titulo" style={{ margin: 0 }}>
                            Mi inventario ({inventario.length})
                        </h3>
                        {bajoStock.length > 0 && (
                            <span style={{
                                background: "#fef3c7", color: "#d97706",
                                padding: "3px 10px", borderRadius: 20,
                                fontSize: 13, fontWeight: 600
                            }}>
                                ⚠️ {bajoStock.length} bajo stock
                            </span>
                        )}
                    </div>

                    {inventario.length > 5 && (
                        <div className="form-grupo">
                            <input
                                type="text"
                                placeholder="🔍 Buscar producto..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </div>
                    )}

                    {[
                        { tipo: "ingrediente", label: "🧁 Ingredientes", color: "#6366f1" },
                        { tipo: "insumo", label: "📦 Insumos de empaque", color: "#10b981" }
                    ].map(({ tipo, label, color }) => {
                        const items = itemsFiltrados.filter(i => (i.tipo || "ingrediente") === tipo)
                        if (items.length === 0) return null
                        return (
                            <div key={tipo} style={{ marginBottom: 20 }}>
                                <p style={{
                                    fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
                                    color, marginBottom: 8,
                                    paddingBottom: 6, borderBottom: `2px solid ${color}22`
                                }}>
                                    {label} ({items.length})
                                </p>
                                <div style={{ overflowX: "auto" }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Paquetes</th>
                                                <th>Disponible</th>
                                                <th>Costo unitario</th>
                                                <th>Costo total</th>
                                                <th>Alerta</th>
                                                <th style={{ textAlign: "center" }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(i => {
                                                const bajo = i.minimo && parsearNumero(i.cantidad) <= parsearNumero(i.minimo)
                                                return (
                                                    <tr key={i.id} style={{ background: bajo ? "#fffbeb" : undefined }}>
                                                        <td>
                                                            <strong>{i.nombre}</strong>
                                                            {bajo && (
                                                                <span style={{
                                                                    marginLeft: 6, fontSize: 11,
                                                                    color: "#d97706", background: "#fef3c7",
                                                                    padding: "1px 6px", borderRadius: 10
                                                                }}>⚠️ bajo</span>
                                                            )}
                                                        </td>
                                                        <td style={{ color: "var(--texto-suave)" }}>
                                                            {i.cantidadPaquetes} × {i.tamañoPaquete}{i.unidad}
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: bajo ? "#d97706" : color }}>
                                                                {parsearNumero(i.cantidad).toLocaleString("es-CR")}{i.unidad}
                                                            </strong>
                                                        </td>
                                                        <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                                            {i.costoTotal && i.cantidad
                                                                ? `₡${(parsearNumero(i.costoTotal) / parsearNumero(i.cantidad)).toFixed(2)}/${i.unidad}`
                                                                : "—"}
                                                        </td>
                                                        <td>
                                                            {i.costoTotal ? `₡${parsearNumero(i.costoTotal).toLocaleString("es-CR")}` : "—"}
                                                        </td>
                                                        <td style={{ color: "var(--texto-suave)" }}>
                                                            {i.minimo ? `${i.minimo}${i.unidad}` : "—"}
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                                                <button className="btn-secundario" type="button"
                                                                    onClick={() => editar(i)}
                                                                    style={{ padding: "4px 10px", fontSize: 13 }}>✏️</button>
                                                                <button className="btn-peligro" type="button"
                                                                    onClick={() => setModalEliminar({ id: i.id, nombre: i.nombre })}>🗑</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })}

                    {itemsFiltrados.length === 0 && busqueda && (
                        <p style={{ color: "var(--texto-suave)", textAlign: "center", padding: 20 }}>
                            No se encontró "{busqueda}"
                        </p>
                    )}
                </div>
            )}

            {inventario.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>📦</p>
                    <p>Tu inventario está vacío.</p>
                    <p style={{ fontSize: 13 }}>Agrega ingredientes e insumos arriba.</p>
                </div>
            )}

            {modalEliminar && (
                <div onClick={() => setModalEliminar(null)} style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20,
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "#fff", borderRadius: 20, padding: "32px 28px",
                        width: "100%", maxWidth: 400, textAlign: "center",
                        boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
                    }}>
                        <div style={{ fontSize: 52, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ margin: "0 0 8px", fontSize: 20, color: "#1a202c" }}>
                            ¿Eliminar producto?
                        </h3>
                        <p style={{ color: "#718096", fontSize: 15, marginBottom: 28 }}>
                            Vas a eliminar <strong style={{ color: "#2d3748" }}>"{modalEliminar.nombre}"</strong> del inventario.
                            <br />Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button type="button" onClick={() => setModalEliminar(null)} style={{
                                flex: 1, padding: "12px 0", borderRadius: 12,
                                background: "#e2e8f0", color: "#4a5568",
                                border: "none", cursor: "pointer",
                                fontSize: 15, fontWeight: 600,
                            }}>Cancelar</button>
                            <button type="button" onClick={() => eliminar(modalEliminar.id)} style={{
                                flex: 1, padding: "12px 0", borderRadius: 12,
                                background: "#e53e3e", color: "#fff",
                                border: "none", cursor: "pointer",
                                fontSize: 15, fontWeight: 700,
                            }}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}