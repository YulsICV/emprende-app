// src/components/ventas/FormVentaManual.jsx
import { useState } from "react"

const VENTA_INICIAL = {
    cliente: "",
    descripcion: "",
    cantidad: "",
    total: "",
    metodoPago: "SINPE",
    fecha: new Date().toISOString().split("T")[0]
}

export default function FormVentaManual({ onGuardar, onCancelar }) {
    const [form, setForm] = useState(VENTA_INICIAL)

    const handleSubmit = () => {
        if (!form.descripcion || !form.total) return
        
        onGuardar({
            id: crypto.randomUUID(),
            ...form,
            cantidad: form.cantidad || 1,
            total: parseFloat(form.total) || 0,
            tipo: "manual",
            fecha: new Date(form.fecha + "T12:00:00").toISOString()
        })
        
        setForm(VENTA_INICIAL)
    }

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div style={{ marginBottom: 16, padding: 12, background: "var(--fondo)", borderRadius: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormGroup label="Fecha">
                    <input 
                        type="date" 
                        value={form.fecha}
                        onChange={e => updateField("fecha", e.target.value)} 
                    />
                </FormGroup>
                
                <FormGroup label="Cliente (opcional)">
                    <input 
                        type="text" 
                        placeholder="Nombre o anónimo"
                        value={form.cliente}
                        onChange={e => updateField("cliente", e.target.value)} 
                    />
                </FormGroup>
                
                <FormGroup label="Descripción *" style={{ gridColumn: "1/-1" }}>
                    <input 
                        type="text" 
                        placeholder="Ej: 6 galletas decoradas, 1 queque..."
                        value={form.descripcion}
                        onChange={e => updateField("descripcion", e.target.value)} 
                    />
                </FormGroup>
                
                <FormGroup label="Cantidad">
                    <input 
                        type="number" 
                        placeholder="1" 
                        value={form.cantidad}
                        onChange={e => updateField("cantidad", e.target.value)} 
                    />
                </FormGroup>
                
                <FormGroup label="Total (₡) *">
                    <input 
                        type="number" 
                        placeholder="0" 
                        value={form.total}
                        onChange={e => updateField("total", e.target.value)} 
                    />
                </FormGroup>
                
                <FormGroup label="Método de pago">
                    <select 
                        value={form.metodoPago}
                        onChange={e => updateField("metodoPago", e.target.value)}
                    >
                        <option value="SINPE">SINPE</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </FormGroup>
            </div>
            
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn-primario" type="button" onClick={handleSubmit}>
                    💾 Guardar venta
                </button>
                <button className="btn-secundario" type="button" onClick={onCancelar}>
                    Cancelar
                </button>
            </div>
        </div>
    )
}

function FormGroup({ label, children, style }) {
    return (
        <div className="form-grupo" style={{ margin: 0, ...style }}>
            <label>{label}</label>
            {children}
        </div>
    )
}