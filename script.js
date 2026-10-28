// URL base del endpoint de personajes. Cada página trae 20 personajes.
const API_URL = "https://rickandmortyapi.com/api/character";

// Referencias a los elementos del HTML
const lista = document.getElementById("lista-personajes");
const estado = document.getElementById("estado");
const btnMas = document.getElementById("btn-mas");
const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtro-estado");
const filtroEspecie = document.getElementById("filtro-especie");
const seccionFavoritos = document.getElementById("seccion-favoritos");
const listaFavoritos = document.getElementById("lista-favoritos");

// Guardamos la URL de la siguiente página que nos da la API
let siguientePagina = API_URL;

// Contador para ignorar respuestas viejas si el usuario escribe rápido
let peticionActual = 0;

// Nombre con el que guardamos los favoritos en localStorage
const CLAVE_FAVORITOS = "rym-favoritos";

// Traducciones simples para mostrar los datos en español
const TRADUCCIONES = {
  Alive: "Vivo",
  Dead: "Muerto",
  unknown: "Desconocido",
  Male: "Masculino",
  Female: "Femenino",
  Genderless: "Sin género",
  Human: "Humano",
  Alien: "Alienígena",
};
const traducir = (texto) => TRADUCCIONES[texto] ?? texto;

/**
 * Pide una página de personajes a la API.
 * async/await nos permite escribir código asíncrono como si fuera secuencial.
 */
async function obtenerPersonajes(url) {
  // Si la API no responde en 8 segundos, cancelamos la petición
  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 8000);

  try {
    const respuesta = await fetch(url, { signal: controlador.signal });

    // La API responde 404 cuando una búsqueda no tiene resultados: no es un error real
    if (respuesta.status === 404) {
      return { info: { next: null }, results: [] };
    }

    // fetch NO lanza error con códigos 500, así que lo revisamos nosotros
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    return await respuesta.json(); // { info: {...}, results: [...] }
  } finally {
    // Pase lo que pase, apagamos el temporizador
    clearTimeout(limite);
  }
}

/**
 * Crea una "descripción" a partir de los datos del personaje,
 * ya que la API no trae un campo de texto descriptivo.
 */
function crearDescripcion(p) {
  const tipo = p.type ? ` (${p.type})` : "";
  return `${traducir(p.species)}${tipo}, ${traducir(p.gender).toLowerCase()}. ` +
         `Aparece en ${p.episode.length} episodio${p.episode.length === 1 ? "" : "s"}.`;
}

/** Construye el HTML de una tarjeta para un personaje */
function crearTarjeta(p) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";

  tarjeta.innerHTML = `
    <img src="${p.image}" alt="Imagen de ${p.name}" loading="lazy">
    <button class="btn-fav" data-id="${p.id}" type="button"></button>
    <div class="tarjeta-cuerpo">
      <h2>${p.name}</h2>
      <p class="estado-personaje">
        <span class="punto ${p.status.toLowerCase()}"></span>
        ${traducir(p.status)} – ${traducir(p.species)}
      </p>
      <p class="dato"><strong>Descripción</strong>${crearDescripcion(p)}</p>
      <p class="dato"><strong>Origen</strong>${traducir(p.origin.name)}</p>
      <p class="dato"><strong>Última ubicación conocida</strong>${traducir(p.location.name)}</p>
    </div>
  `;

  // Botón de favorito: la función flecha "recuerda" a qué personaje pertenece
  const btnFav = tarjeta.querySelector(".btn-fav");
  pintarBotonFav(btnFav, esFavorito(p.id));
  btnFav.addEventListener("click", () => alternarFavorito(p));

  return tarjeta;
}

/* ===== Mensajes amigables en pantalla ===== */

/**
 * Muestra una caja de mensaje en el área de estado.
 * Usamos textContent (no innerHTML) para que lo que escribe el usuario
 * nunca se interprete como código HTML.
 */
function mostrarMensaje({ tipo, icono = "", titulo, texto = "", accion = null }) {
  const caja = document.createElement("div");
  caja.className = `mensaje ${tipo}`;

  if (icono) {
    const spanIcono = document.createElement("span");
    spanIcono.className = "mensaje-icono";
    spanIcono.textContent = icono;
    caja.appendChild(spanIcono);
  }

  const h3 = document.createElement("h3");
  h3.textContent = titulo;
  caja.appendChild(h3);

  if (texto) {
    const p = document.createElement("p");
    p.textContent = texto;
    caja.appendChild(p);
  }

  // Botón opcional, por ejemplo "Reintentar"
  if (accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton";
    boton.textContent = accion.texto;
    boton.addEventListener("click", accion.alHacerClic);
    caja.appendChild(boton);
  }

  estado.replaceChildren(caja);
}

function limpiarMensaje() {
  estado.replaceChildren();
}

/** Caso 1: la búsqueda no encontró a nadie */
function mostrarSinResultados() {
  const nombre = buscador.value.trim();
  const hayFiltros = filtroEstado.value || filtroEspecie.value;

  mostrarMensaje({
    tipo: "vacio",
    icono: "🔍",
    titulo: nombre ? `No encontramos a "${nombre}"` : "No hay personajes con esos filtros",
    texto: hayFiltros
      ? "Revisa cómo está escrito el nombre o prueba quitando algunos filtros."
      : "Revisa cómo está escrito el nombre o intenta con otro, por ejemplo: Rick, Morty o Summer.",
    accion: { texto: "Limpiar búsqueda", alHacerClic: limpiarBusqueda },
  });
}

function limpiarBusqueda() {
  buscador.value = "";
  filtroEstado.value = "";
  filtroEspecie.value = "";
  cargarPersonajes(true);
}

/** Caso 2: no pudimos hablar con la API (sin internet, caída o muy lenta) */
function mostrarError(error) {
  let icono, titulo, texto;

  if (!navigator.onLine) {
    icono = "📡";
    titulo = "Sin conexión a internet";
    texto = "Parece que no tienes internet. Revisa tu Wi-Fi o tus datos y vuelve a intentarlo.";
  } else if (error.name === "AbortError") {
    icono = "⏳";
    titulo = "El servidor está tardando demasiado";
    texto = "La página de Rick and Morty no respondió a tiempo. Espera unos segundos y vuelve a intentarlo.";
  } else {
    icono = "🛸";
    titulo = "No pudimos conectar con el multiverso";
    texto = "El servicio de Rick and Morty no está disponible en este momento. No es tu culpa: inténtalo de nuevo más tarde.";
  }

  mostrarMensaje({
    tipo: "error",
    icono,
    titulo,
    texto,
    accion: { texto: "Reintentar", alHacerClic: () => cargarPersonajes() },
  });
}

/** Carga la siguiente página y la agrega a la lista */
async function cargarPersonajes(reiniciar = false) {
  // Si cambió la búsqueda o un filtro, borramos la lista y empezamos desde la página 1
  if (reiniciar) {
    lista.innerHTML = "";
    siguientePagina = construirUrl();
  }
  const miPeticion = ++peticionActual;
  btnMas.disabled = true;
  mostrarMensaje({ tipo: "cargando", titulo: "🌀 Abriendo un portal..." });

  try {
    const datos = await obtenerPersonajes(siguientePagina);

    // Si mientras esperábamos llegó una búsqueda más nueva, ignoramos esta respuesta vieja
    if (miPeticion !== peticionActual) return;

    // Agregamos cada personaje como tarjeta
    datos.results.forEach((personaje) => {
      lista.appendChild(crearTarjeta(personaje));
    });

    // info.next es null cuando ya no hay más páginas
    siguientePagina = datos.info.next;
    btnMas.hidden = !siguientePagina;
    if (lista.children.length === 0) {
      mostrarSinResultados();
    } else {
      limpiarMensaje();
    }
  } catch (error) {
    // Si el usuario ya hizo otra búsqueda, este error ya no importa
    if (miPeticion !== peticionActual) return;
    console.error(error);
    btnMas.hidden = true;
    mostrarError(error);
  } finally {
    btnMas.disabled = false;
  }
}

/** Arma la URL de la API con lo que hay en el buscador y los filtros */
function construirUrl() {
  const params = new URLSearchParams();
  const nombre = buscador.value.trim();
  if (nombre) params.set("name", nombre);
  if (filtroEstado.value) params.set("status", filtroEstado.value);
  if (filtroEspecie.value) params.set("species", filtroEspecie.value);
  return `${API_URL}?${params}`;
}

/**
 * Debounce: retrasa la ejecución de "fn" hasta que pasen "espera" ms
 * sin que se vuelva a llamar. Así no consultamos la API con cada letra.
 */
function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

/* ===== Favoritos con localStorage ===== */

// localStorage solo guarda texto, por eso usamos JSON.parse / JSON.stringify
function leerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) ?? [];
  } catch {
    return [];
  }
}

function guardarFavoritos(favoritos) {
  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  } catch (error) {
    console.error("No se pudo guardar en localStorage", error);
  }
}

function esFavorito(id) {
  return leerFavoritos().some((f) => f.id === id);
}

/** Cambia la estrella del botón: ★ llena = favorito, ☆ vacía = no */
function pintarBotonFav(boton, activo) {
  boton.textContent = activo ? "★" : "☆";
  boton.classList.toggle("activo", activo);
  boton.setAttribute("aria-label", activo ? "Quitar de favoritos" : "Guardar en favoritos");
}

/** Agrega o quita un personaje de favoritos */
function alternarFavorito(p) {
  let favoritos = leerFavoritos();
  if (esFavorito(p.id)) {
    favoritos = favoritos.filter((f) => f.id !== p.id);
  } else {
    favoritos.push(p);
  }
  guardarFavoritos(favoritos);

  // El mismo personaje puede estar en la lista y en favoritos: actualizamos ambos botones
  const activo = esFavorito(p.id);
  document.querySelectorAll(`.btn-fav[data-id="${p.id}"]`)
    .forEach((boton) => pintarBotonFav(boton, activo));

  mostrarFavoritos();
}

/** Dibuja la sección de favoritos (se oculta si está vacía) */
function mostrarFavoritos() {
  const favoritos = leerFavoritos();
  listaFavoritos.innerHTML = "";
  favoritos.forEach((p) => listaFavoritos.appendChild(crearTarjeta(p)));
  seccionFavoritos.hidden = favoritos.length === 0;
}

// Eventos
const buscarConRetraso = debounce(() => cargarPersonajes(true), 500);
buscador.addEventListener("input", buscarConRetraso);
filtroEstado.addEventListener("change", () => cargarPersonajes(true));
filtroEspecie.addEventListener("change", () => cargarPersonajes(true));
btnMas.addEventListener("click", () => cargarPersonajes());

// Carga inicial: primero los favoritos guardados, luego los personajes
mostrarFavoritos();
cargarPersonajes();
