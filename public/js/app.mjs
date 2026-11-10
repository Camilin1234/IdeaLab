import { solicitarPropuestas } from "./api.mjs";
import {
  leerTema, guardarTema, leerFavoritos, guardarFavoritos,
  agregarAlHistorialSesion, limpiarDatosIdeaLab
} from "./utilidades.mjs";

const formulario = document.querySelector("#formulario");
const negocioInput = document.querySelector("#negocio");
const estiloInput = document.querySelector("#estilo");
const botonGenerar = document.querySelector("#botonGenerar");
const textoBoton = document.querySelector("#textoBoton");
const estado = document.querySelector("#estado");
const resultados = document.querySelector("#contenedorResultados");
const favoritosContenedor = document.querySelector("#listaFavoritos");
const contadorFavoritos = document.querySelector("#contadorFavoritos");
const botonTema = document.querySelector("#botonTema");
const botonLimpiar = document.querySelector("#botonLimpiar");
const botonBorrarDatos = document.querySelector("#botonBorrarDatos");
let favoritos = leerFavoritos();

inicializar();

function inicializar() {
  aplicarTema(leerTema());
  pintarFavoritos();
  formulario.addEventListener("submit", generar);
  botonTema.addEventListener("click", alternarTema);
  botonLimpiar.addEventListener("click", limpiarFormulario);
  botonBorrarDatos.addEventListener("click", borrarDatos);
  resultados.addEventListener("click", gestionarAcciones);
  favoritosContenedor.addEventListener("click", gestionarAcciones);
  actualizarEstado("Listo para crear nuevas ideas.", "info");
}

async function generar(evento) {
  evento.preventDefault();
  const negocio = negocioInput.value.trim();
  const estilo = estiloInput.value;

  if (negocio.length < 3 || negocio.length > 80) {
    actualizarEstado("Escribe un tipo de negocio de mínimo 3 y máximo 80 caracteres.", "warning");
    negocioInput.focus();
    return;
  }

  botonGenerar.disabled = true;
  textoBoton.textContent = "Creando propuestas...";
  actualizarEstado("Estamos preparando tus ideas. Esto puede tardar unos segundos.", "info");
  resultados.setAttribute("aria-busy", "true");

  try {
    const datos = await solicitarPropuestas({ negocio, estilo });
    const propuestas = [
      ...datos.nombres.map((texto) => ({ texto, tipo: "Nombre", negocio, estilo })),
      ...datos.esloganes.map((texto) => ({ texto, tipo: "Eslogan", negocio, estilo }))
    ];
    if (datos.nombres.length !== 4 || datos.esloganes.length !== 4) {
      throw new Error("El servidor no entregó las ocho propuestas esperadas. Intenta nuevamente.");
    }
    pintarResultados(datos);
    agregarAlHistorialSesion({
      negocio, estilo, fecha: datos.generadoEn,
      total: propuestas.length
    });
    actualizarEstado(`¡Listo! Se generaron 4 nombres y 4 eslóganes con ${datos.proveedor}.`, "success");
  } catch (error) {
    mostrarVacio("No pudimos generar las propuestas", error.message);
    actualizarEstado(error.message, "danger");
  } finally {
    botonGenerar.disabled = false;
    textoBoton.textContent = "Generar propuestas";
    resultados.setAttribute("aria-busy", "false");
  }
}

function pintarResultados(datos) {
  resultados.replaceChildren();
  resultados.append(
    crearColumnaIdeas("Nombres para tu negocio", datos.nombres, "Nombre"),
    crearColumnaIdeas("Eslóganes para tu marca", datos.esloganes, "Eslogan")
  );
}

function crearColumnaIdeas(titulo, ideas, tipo) {
  const columna = document.createElement("div");
  columna.className = "col-12 col-lg-6";
  const tarjeta = document.createElement("article");
  tarjeta.className = "idea-card";
  const encabezado = document.createElement("h3");
  encabezado.textContent = titulo;
  tarjeta.append(encabezado);
  ideas.forEach((idea) => {
    const fila = document.createElement("div");
    fila.className = "idea-row";
    const texto = document.createElement("span");
    texto.className = "idea-text";
    texto.textContent = idea;
    const acciones = document.createElement("div");
    acciones.className = "idea-actions";
    acciones.append(
      crearBoton("Copiar", "copiar", idea, "btn-outline-secondary"),
      crearBoton("Guardar", "guardar", idea, "btn-outline-primary", tipo)
    );
    fila.append(texto, acciones);
    tarjeta.append(fila);
  });
  columna.append(tarjeta);
  return columna;
}

function crearBoton(etiqueta, accion, texto, clase, tipo = "") {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `btn ${clase}`;
  boton.dataset.accion = accion;
  boton.dataset.texto = texto;
  boton.dataset.tipo = tipo;
  boton.textContent = etiqueta;
  boton.setAttribute("aria-label", `${etiqueta} ${tipo.toLowerCase()} ${texto}`);
  return boton;
}

async function gestionarAcciones(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const { accion, texto, tipo } = boton.dataset;

  if (accion === "copiar") {
    try {
      await navigator.clipboard.writeText(texto);
      boton.textContent = "Copiado";
      actualizarEstado("La propuesta se copió al portapapeles.", "success");
      window.setTimeout(() => { boton.textContent = "Copiar"; }, 1300);
    } catch {
      actualizarEstado("El navegador no permitió copiar. Selecciona el texto manualmente.", "warning");
    }
  }

  if (accion === "guardar") {
    const existe = favoritos.some((item) => item.texto === texto);
    if (existe) {
      actualizarEstado("Esta propuesta ya está en tus favoritos.", "warning");
      return;
    }
    favoritos.unshift({ texto, tipo, guardadoEn: new Date().toISOString() });
    favoritos = favoritos.slice(0, 20);
    guardarFavoritos(favoritos);
    pintarFavoritos();
    actualizarEstado("Propuesta guardada en tus favoritos de este navegador.", "success");
  }

  if (accion === "eliminar-favorito") {
    favoritos = favoritos.filter((item) => item.texto !== texto);
    guardarFavoritos(favoritos);
    pintarFavoritos();
    actualizarEstado("Favorito eliminado.", "success");
  }
}

function pintarFavoritos() {
  favoritosContenedor.replaceChildren();
  contadorFavoritos.textContent = String(favoritos.length);
  if (favoritos.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "muted";
    mensaje.textContent = "Todavía no has guardado favoritos. Usa el botón “Guardar” en una propuesta.";
    const columna = document.createElement("div");
    columna.className = "col-12";
    columna.append(mensaje);
    favoritosContenedor.append(columna);
    return;
  }
  favoritos.forEach((item) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6";
    const tarjeta = document.createElement("article");
    tarjeta.className = "favorite-card d-flex align-items-center justify-content-between gap-3";
    const texto = document.createElement("div");
    const tipo = document.createElement("span");
    tipo.className = "badge text-bg-primary mb-1";
    tipo.textContent = item.tipo;
    const contenido = document.createElement("p");
    contenido.className = "mb-0 fw-semibold";
    contenido.textContent = item.texto;
    texto.append(tipo, contenido);
    const eliminar = crearBoton("Quitar", "eliminar-favorito", item.texto, "btn-outline-danger");
    tarjeta.append(texto, eliminar);
    columna.append(tarjeta);
    favoritosContenedor.append(columna);
  });
}

function alternarTema() {
  const nuevoTema = document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark";
  aplicarTema(nuevoTema);
  guardarTema(nuevoTema);
  actualizarEstado(`Tema ${nuevoTema === "dark" ? "oscuro" : "claro"} guardado en este navegador.`, "success");
}

function aplicarTema(tema) {
  document.documentElement.dataset.bsTheme = tema;
  const oscuro = tema === "dark";
  botonTema.textContent = oscuro ? "☀️ Tema claro" : "🌙 Tema oscuro";
  botonTema.setAttribute("aria-label", oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
}

function borrarDatos() {
  const confirmar = window.confirm("¿Deseas borrar el tema, los favoritos y el historial de esta pestaña? Esta acción no se puede deshacer.");
  if (!confirmar) return;
  limpiarDatosIdeaLab();
  favoritos = [];
  aplicarTema("light");
  pintarFavoritos();
  mostrarVacio("Tus datos fueron borrados", "Puedes volver a usar IdeaLab cuando quieras.");
  actualizarEstado("Se borraron las preferencias, favoritos y datos temporales de IdeaLab.", "success");
}

function limpiarFormulario() {
  formulario.reset();
  resultados.replaceChildren();
  mostrarVacio("Formulario limpio", "Escribe un negocio para generar nuevas propuestas.");
  actualizarEstado("Se limpió el formulario. Tus favoritos y preferencias siguen guardados.", "info");
  negocioInput.focus();
}

function mostrarVacio(titulo, descripcion) {
  resultados.replaceChildren();
  const columna = document.createElement("div");
  columna.className = "col-12";
  const caja = document.createElement("div");
  caja.className = "empty-state";
  const icono = document.createElement("span");
  icono.textContent = "✧";
  const encabezado = document.createElement("h3");
  encabezado.className = "h5";
  encabezado.textContent = titulo;
  const texto = document.createElement("p");
  texto.className = "mb-0";
  texto.textContent = descripcion;
  caja.append(icono, encabezado, texto);
  columna.append(caja);
  resultados.append(columna);
}

function actualizarEstado(mensaje, tipo) {
  estado.className = `alert alert-${tipo} mt-3 mb-0`;
  estado.textContent = mensaje;
}

window.addEventListener("beforeunload", () => {
  // No se guardan datos sensibles; el historial de sesión se elimina al cerrar la pestaña.
});
