// URL base del endpoint de personajes. Cada página trae 20 personajes.
const API_URL = "https://rickandmortyapi.com/api/character";

// Referencias a los elementos del HTML
const lista = document.getElementById("lista-personajes");
const estado = document.getElementById("estado");
const btnMas = document.getElementById("btn-mas");

// Guardamos la URL de la siguiente página que nos da la API
let siguientePagina = API_URL;

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
  const respuesta = await fetch(url);

  // fetch NO lanza error con códigos 404/500, así que lo revisamos nosotros
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  return respuesta.json(); // { info: {...}, results: [...] }
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

  return tarjeta;
}

/** Carga la siguiente página y la agrega a la lista */
async function cargarPersonajes() {
  btnMas.disabled = true;
  estado.textContent = "Abriendo un portal...";

  try {
    const datos = await obtenerPersonajes(siguientePagina);

    // Agregamos cada personaje como tarjeta
    datos.results.forEach((personaje) => {
      lista.appendChild(crearTarjeta(personaje));
    });

    // info.next es null cuando ya no hay más páginas
    siguientePagina = datos.info.next;
    btnMas.hidden = !siguientePagina;
    estado.textContent = "";
  } catch (error) {
    console.error(error);
    estado.textContent = "¡Oh no! No se pudieron cargar los personajes. Intenta de nuevo.";
  } finally {
    btnMas.disabled = false;
  }
}

// Eventos
btnMas.addEventListener("click", cargarPersonajes);

// Carga inicial (20 personajes de la primera página)
cargarPersonajes();
