import mongoose from "mongoose"

// ── Inventario ──
const inventarioSchema = new mongoose.Schema({
    negocioId:       { type: String, required: true, index: true },
    nombre:          { type: String, required: true },
    tipo:            { type: String, default: "ingrediente" },
    cantidadPaquetes:{ type: Number },
    tamañoPaquete:   { type: Number },
    unidad:          { type: String },
    costoPorPaquete: { type: Number },
    minimo:          { type: Number },
    cantidad:        { type: Number },
    costoTotal:      { type: Number },
    fecha:           { type: Date, default: Date.now },
}, { timestamps: true })

// ── Recetas ──
const recetaSchema = new mongoose.Schema({
    negocioId:    { type: String, required: true, index: true },
    nombre:       { type: String, required: true },
    categoria:    { type: String },
    unidades:     { type: Number },
    ingredientes: { type: Array, default: [] },
    insumos:      { type: Array, default: [] },
    margenMay:    { type: Number, default: 35 },
    margenMen:    { type: Number, default: 70 },
    envioGratis:  { type: Boolean, default: false },
    fotoBase64:   { type: String },
    fotoUrl:      { type: String },
    equipo:       { type: String },
    temperatura:  { type: Number },
    tiempoCoccion:{ type: Number },
    pasos:        { type: Array, default: [] },
    costoTotal:   { type: Number },
    costoPorUnidad:{ type: Number },
    precioMayoreo:{ type: Number },
    precioMenudeo:{ type: Number },
    recetarioId:  { type: String },
    fecha:        { type: Date, default: Date.now },
}, { timestamps: true })

// ── Recetario ──
const recetarioSchema = new mongoose.Schema({
    negocioId:    { type: String, required: true, index: true },
    nombre:       { type: String, required: true },
    categoria:    { type: String },
    unidades:     { type: Number },
    ingredientes: { type: Array, default: [] },
    fotoBase64:   { type: String },
    fotoUrl:      { type: String },
    equipo:       { type: String },
    temperatura:  { type: Number },
    tiempoCoccion:{ type: Number },
    pasos:        { type: Array, default: [] },
    fecha:        { type: Date, default: Date.now },
}, { timestamps: true })

// ── Pedidos ──
const pedidoSchema = new mongoose.Schema({
    negocioId:     { type: String, required: true, index: true },
    clienteNombre: { type: String },
    recetaNombre:  { type: String },
    cantidad:      { type: Number },
    estado:        { type: String, default: "pendiente" },
    total:         { type: Number },
    fecha:         { type: Date, default: Date.now },
}, { timestamps: true })

// Evitar re-registrar modelos en hot reload
export const Inventario = mongoose.models.Inventario || mongoose.model("Inventario", inventarioSchema)
export const Receta     = mongoose.models.Receta     || mongoose.model("Receta",     recetaSchema)
export const Recetario  = mongoose.models.Recetario  || mongoose.model("Recetario",  recetarioSchema)
export const Pedido     = mongoose.models.Pedido     || mongoose.model("Pedido",     pedidoSchema)