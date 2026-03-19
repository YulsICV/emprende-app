import mongoose from "mongoose"

const inventarioSchema = new mongoose.Schema({
    negocioId:        { type: String, required: true, index: true },
    nombre:           { type: String, required: true },
    tipo:             { type: String, default: "ingrediente" },
    cantidadPaquetes: { type: Number },
    tamañoPaquete:    { type: Number },
    unidad:           { type: String },
    costoPorPaquete:  { type: Number },
    minimo:           { type: Number },
    cantidad:         { type: Number },
    cantidadBase:     { type: Number },
    costoTotal:       { type: Number },
    costoPorGramo:    { type: Number },
    fecha:            { type: Date, default: Date.now },
}, { timestamps: true })

const recetaSchema = new mongoose.Schema({
    negocioId:      { type: String, required: true, index: true },
    nombre:         { type: String, required: true },
    categoria:      { type: String },
    unidades:       { type: Number },
    ingredientes:   { type: Array, default: [] },
    insumos:        { type: Array, default: [] },
    margenMay:      { type: Number, default: 35 },
    margenMen:      { type: Number, default: 70 },
    envioGratis:    { type: Boolean, default: false },
    fotoBase64:     { type: String },
    fotoUrl:        { type: String },
    equipo:         { type: Array, default: [] },
    temperatura:    { type: Number },
    tiempoCoccion:  { type: Number },
    pasos:          { type: Array, default: [] },
    costoTotal:     { type: Number },
    costoPorUnidad: { type: Number },
    precioMayoreo:  { type: Number },
    precioMenudeo:  { type: Number },
    recetarioId:    { type: String },
    fecha:          { type: Date, default: Date.now },
}, { timestamps: true })

const recetarioSchema = new mongoose.Schema({
    negocioId:     { type: String, required: true, index: true },
    nombre:        { type: String, required: true },
    categoria:     { type: String },
    unidades:      { type: Number },
    ingredientes:  { type: Array, default: [] },
    fotoBase64:    { type: String },
    fotoUrl:       { type: String },
    equipo:        { type: Array, default: [] },
    temperatura:   { type: Number },
    tiempoCoccion: { type: Number },
    pasos:         { type: Array, default: [] },
    recetaCostoId: { type: String },
    fecha:         { type: Date, default: Date.now },
}, { timestamps: true })

const clienteSchema = new mongoose.Schema({
    negocioId:     { type: String, required: true, index: true },
    nombre:        { type: String, required: true },
    telefono:      { type: String },
    correo:        { type: String },
    direccion:     { type: String },
    tipo:          { type: String, default: "individual" },
    alergias:      { type: Boolean, default: false },
    notasAlergias: { type: String },
    nota:          { type: String },
    fecha:         { type: Date, default: Date.now },
}, { timestamps: true })

const pedidoSchema = new mongoose.Schema({
    negocioId:        { type: String, required: true, index: true },
    fechaEntrega:     { type: String },
    cliente:          { type: String },
    clienteId:        { type: String },
    telefono:         { type: String },
    correo:           { type: String },
    recetaId:         { type: String },
    recetaNombre:     { type: String },
    recetaUnidades:   { type: Number },
    cantidad:         { type: Number },
    estado:           { type: String, default: "pendiente" },
    metodoPago:       { type: String, default: "SINPE" },
    tipoEnvio:        { type: String, default: "recogido" },
    envio:            { type: Number, default: 0 },
    anticipo:         { type: Number, default: 0 },
    total:            { type: Number, default: 0 },
    saldoPendiente:   { type: Number, default: 0 },
    tematica:         { type: String },
    costoTematica:    { type: Number, default: 0 },
    colores:          { type: String },
    costoEmpaque:     { type: Number, default: 0 },
    especificaciones: { type: String },
    cargoCambio:      { type: Number, default: 0 },
    motivoCambio:     { type: String },
    notasInternas:    { type: String },
    fecha:            { type: Date, default: Date.now },
}, { timestamps: true })

const produccionSchema = new mongoose.Schema({
    negocioId:    { type: String, required: true, index: true },
    fecha:        { type: String, required: true },
    recetaId:     { type: String, required: true },
    recetaNombre: { type: String },
    cantidad:     { type: Number, required: true },
    tipo:         { type: String, default: "produccion" },
    notas:        { type: String },
}, { timestamps: true })

const ventaSchema = new mongoose.Schema({
    negocioId:    { type: String, required: true, index: true },
    tipo:         { type: String, default: "manual" }, // "manual" | "pedido"
    pedidoId:     { type: String },
    cliente:      { type: String },
    recetaNombre: { type: String },
    descripcion:  { type: String },
    cantidad:     { type: Number, default: 1 },
    total:        { type: Number, default: 0 },
    metodoPago:   { type: String, default: "SINPE" },
    fecha:        { type: Date, default: Date.now },
}, { timestamps: true })

const gastoFijoSchema = new mongoose.Schema({
    negocioId:  { type: String, required: true, index: true },
    nombre:     { type: String, required: true },
    monto:      { type: Number, required: true },
    frecuencia: { type: String, default: "mensual" }, // "semanal" | "mensual" | "anual"
    fecha:      { type: Date, default: Date.now },
}, { timestamps: true })

const usuarioSchema = new mongoose.Schema({
    negocioId:        { type: String, unique: true },
    nombreNegocio:    { type: String, default: "" },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:     { type: String },
    googleId:         { type: String, sparse: true },
    fotoGoogle:       { type: String },
    logoBase64:       { type: String },
    avatarBase64:     { type: String },
    nombre:           { type: String, default: "" },
    inicial:          { type: String, default: "" },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date },
    activo:           { type: Boolean, default: true },
    fecha:            { type: Date, default: Date.now },
}, { timestamps: true })

export const Inventario  = mongoose.models.Inventario  || mongoose.model("Inventario",  inventarioSchema)
export const Receta      = mongoose.models.Receta      || mongoose.model("Receta",      recetaSchema)
export const Recetario   = mongoose.models.Recetario   || mongoose.model("Recetario",   recetarioSchema)
export const Cliente     = mongoose.models.Cliente     || mongoose.model("Cliente",     clienteSchema)
export const Pedido      = mongoose.models.Pedido      || mongoose.model("Pedido",      pedidoSchema)
export const Produccion  = mongoose.models.Produccion  || mongoose.model("Produccion",  produccionSchema)
export const Venta       = mongoose.models.Venta       || mongoose.model("Venta",       ventaSchema)
export const GastoFijo   = mongoose.models.GastoFijo   || mongoose.model("GastoFijo",   gastoFijoSchema)
export const Usuario     = mongoose.models.Usuario     || mongoose.model("Usuario",     usuarioSchema)