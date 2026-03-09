// src/components/ventas/VentasManuales.jsx
import { useState } from "react"
import FormVentaManual from "./FormVentaManual"

export default function VentasManuales({ ventas = [], onGuardar, onEliminar }) {
    const [mostrarForm, setMostrarForm] = useState(false)

    const formatFecha = (iso) => new Date(iso).toLocaleDateString("es-CR", {
        day: "numeric", month: "short", year: "numeric"
    })

    const handleGuardar = (venta) => {
        onGuardar(venta)
        setMostrarForm(false)
    }

    return (
        <div className="card">
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
            }}>
                <h3 className="seccion-titulo" style={{ margin: 0 }}>
                    🏪 Ventas espontáneas
                </h3>
                <button
                    className="btn-secundario"
                    type="button"
                    onClick={() => setMostrarForm(v => !v)}
                    style={{ fontSize: 13 }}
                >
                    {mostrarForm ? "✕ Cancelar" : "+ Registrar venta"}
                </button>
            </div>

            {mostrarForm && (
                <FormVentaManual
                    onGuardar={handleGuardar}
                    onCancelar={() => setMostrarForm(false)}
                />
            )}

            {ventas.length === 0 ? (
                <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                    Ferias, encargos rápidos, ventas en efectivo que no vienen de un pedido formal.
                </p>
            ) : (
                <TablaVentasManuales
                    ventas={ventas}
                    formatFecha={formatFecha}
                    onEliminar={onEliminar}
                />
            )}
        </div>
    )
}

function TablaVentasManuales({ ventas = [], formatFecha, onEliminar }) {
    const ventasOrdenadas = [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    return (
        <div style={{ overflowX: "auto" }}>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Cliente</th>
                        <th>Método</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {ventasOrdenadas.map(v => (
                        <tr key={v.id}>
                            <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                {formatFecha(v.fecha)}
                            </td>
                            <td><strong>{v.descripcion}</strong></td>
                            <td>{v.cliente || "—"}</td>
                            <td style={{ fontSize: 13 }}>{v.metodoPago}</td>
                            <td style={{ fontWeight: 700, color: "var(--verde-oscuro)" }}>
                                ₡{parseFloat(v.total || 0).toLocaleString()}
                            </td>
                            <td>
                                <button
                                    type="button"
                                    onClick={() => onEliminar(v.id)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontSize: 16
                                    }}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}