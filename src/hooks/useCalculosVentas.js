// src/components/ventas/hooks/useCalculosVentas.js
import { useMemo } from "react"

export function useCalculosVentas(db) {
    const ventas = db?.ventas || []
    const gastosFijos = db?.gastosFijos || []
    const pedidos = db?.pedidos || []
    const recetas = db?.recetas || []

    const ventasAutomaticas = useMemo(() =>
        ventas.filter(v => v.tipo === "pedido"),
        [ventas])

    const ventasManuales = useMemo(() =>
        ventas.filter(v => v.tipo === "manual"),
        [ventas])

    // Total gastos fijos mensuales
    const totalGastosMensuales = useMemo(() =>
        gastosFijos.reduce((s, g) => {
            const m = parseFloat(g.monto) || 0
            if (g.frecuencia === "semanal") return s + m * 4
            if (g.frecuencia === "anual") return s + m / 12
            return s + m
        }, 0),
        [gastosFijos])

    // Ventas del mes actual
    const ahora = new Date()
    const ventasEsteMes = useMemo(() =>
        ventas.filter(v => {
            const f = new Date(v.fecha)
            return f.getMonth() === ahora.getMonth() &&
                f.getFullYear() === ahora.getFullYear()
        }),
        [ventas])

    const gastoPorVenta = ventasEsteMes.length > 0
        ? totalGastosMensuales / ventasEsteMes.length
        : 0

    // Costo de ingredientes de un pedido
    const costoIngredientesPedido = (venta) => {
        if (venta.tipo !== "pedido") return 0
        const pedido = pedidos.find(p => p.id === venta.pedidoId)
        const receta = recetas.find(r => r.nombre === venta.recetaNombre)
        if (!receta || !pedido) return 0

        const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
        const costoIng = (receta.ingredientes || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
        const costoIns = (receta.insumos || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
        return (costoIng + costoIns) * factor
    }

    const totalMes = ventasEsteMes.reduce((s, v) => s + parseFloat(v.total || 0), 0)
    const totalGeneral = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)

    const gananciaNeta = ventasEsteMes.reduce((s, v) => {
        const ingreso = parseFloat(v.total || 0)
        const costo = costoIngredientesPedido(v)
        return s + ingreso - costo - gastoPorVenta
    }, 0)

    return {
        ventas,
        ventasAutomaticas,
        ventasManuales,
        ventasEsteMes,
        totalGastosMensuales,
        gastoPorVenta,
        costoIngredientesPedido,
        totalMes,
        totalGeneral,
        gananciaNeta
    }
}