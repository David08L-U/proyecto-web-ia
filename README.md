# 🛸 Rick and Morty – Explorador de personajes

Aplicación web hecha con **HTML, CSS y JavaScript** (sin frameworks) que consume la API pública de [Rick and Morty](https://rickandmortyapi.com/documentation) para mostrar personajes con su foto y descripción.

## ✨ Funcionalidades

- Muestra 20 personajes por página con foto, estado, especie, origen y última ubicación, y tiene un botón **"Cargar más"**.
- **Buscador automático** con *debounce* de 500 ms: espera a que dejes de escribir antes de consultar la API.
- **Filtros** por estado (vivo, muerto o desconocido) y por especie.
- **Favoritos** guardados en `localStorage`, en su propia pestaña con contador: no se borran al recargar la página.
- **Comparador** *(mi aporte)*: elige dos personajes y velos lado a lado, con los datos que coinciden resaltados.
- **Mensajes amigables** cuando no hay resultados, no hay internet, la API está caída o tarda demasiado. Cada mensaje trae un botón para recuperarse.
- **Diseño adaptable** (*responsive*): 1 columna en celular y 3 o 4 en computadora.
- Paleta de verdes y azules inspirada en la serie.

## 📁 Estructura

```
Rickmorti/
├── index.html   → estructura de la página
├── style.css    → estilos, paleta de colores y diseño adaptable
├── script.js    → API, buscador, filtros, favoritos, comparador y errores
└── README.md
```

## 👤 Integrante

Proyecto individual, desarrollado por **LUIS DAVID CAT CANCHE** ([@David08L-U](https://github.com/David08L-U)).

## ▶️ Instrucciones de uso

La aplicación está publicada con **GitHub Pages**:
👉 https://david08l-u.github.io/proyecto-web-ia/

1. **Buscar:** escribe un nombre en el buscador (por ejemplo, *Rick*). Los resultados aparecen solos medio segundo después de que dejas de escribir.
2. **Filtrar:** usa las listas para ver solo personajes vivos, muertos o desconocidos, o de una especie.
3. **Favoritos:** toca la estrella ☆ de una tarjeta. Tus favoritos aparecen en la pestaña **⭐ Favoritos** y se conservan aunque recargues la página.
4. **Comparar:** toca **⚖️ Comparar** en dos tarjetas. Se abre la pestaña **Comparar** con los dos personajes lado a lado.
5. **Cargar más:** al final de la lista, el botón **Cargar más personajes** trae la siguiente página de la API.

Todo el código se escribió y modificó desde el editor web de GitHub, y se publicó desde **Settings → Pages** (rama `main`, carpeta raíz).

---

## 🤖 Desarrollo con IA

Desarrollé este proyecto usando una IA (Claude) como **tutor de programación**. Le pedí que no regenerara todo el código en cada cambio, sino que me indicara **en qué archivo y en qué línea** insertar cada modificación, para ir entendiendo el código mientras lo escribía.

> **Mi aporte:** la base del proyecto (consulta a la API, buscador, filtros, favoritos y manejo de errores) la construí guiado por la IA. El apartado de **⚖️ Comparar personajes** fue idea mía: lo propuse, decidí cómo debía funcionar (elegir dos personajes, verlos lado a lado y resaltar lo que tienen en común) y lo integré al proyecto. Lo explico a detalle en la sección 4.

### 1. Tres prompts importantes utilizados

**Prompt 1: código inicial**
> Actúa como mi tutor de programación. Estoy haciendo una aplicación web sobre Rick and Morty usando su API pública (https://rickandmortyapi.com/documentation). Dame el código inicial en HTML, CSS y JavaScript para consultar y mostrar al menos 10 personajes con su foto y descripción. Haz que la página sea adaptable, es decir, que se vea bien tanto en celulares como en computadoras. Usa una paleta de colores con tonos verdes y azules que recuerden a la serie.

**Prompt 2: buscador, filtros y favoritos**
> Sobre el código anterior, necesito agregarle funciones. Primero, un buscador de personajes que funcione automáticamente mientras escribo, pero ponle una pequeña pausa (retraso) para que no haga consultas de más a la API con cada letra. Debajo de este buscador, agrega opciones para filtrar los resultados (por ejemplo, si están vivos, muertos o especie). Por último, agrega un botón en cada personaje para guardarlos en una sección de 'Favoritos' usando localStorage para que no se borren al recargar la página.

**Prompt 3: manejo de errores**
> Ahora necesito que la página no se rompa si algo sale mal. Modifica el código para que muestre mensajes amigables en la pantalla en estos dos casos: primero, si el usuario busca un personaje que no existe (como un error 404 o sin resultados); y segundo, si la API falla o se cae y no podemos conectarnos a ella. Que los mensajes sean claros para cualquier persona.

### 2. Una respuesta de la IA que requirió correcciones

En la primera respuesta, la IA generó los archivos con los nombres `styles.css` y `app.js`. En mi repositorio yo los llamé `style.css` y `script.js`. Cambié la etiqueta `<script>` en `index.html`, pero la línea del CSS seguía apuntando al nombre anterior:

```html
<!-- Antes (incorrecto): el archivo no existe -->
<link rel="stylesheet" href="styles.css">

<!-- Después (correcto) -->
<link rel="stylesheet" href="style.css">
```

Si no lo hubiera corregido, la página habría cargado **sin ningún estilo**. Al mandarle una captura del código a la IA, detectó la diferencia. Desde ese momento le pedí que trabajara con mis nombres de archivo y que me diera los cambios por línea.

**Lección:** el código de la IA no se copia a ciegas. Hay que adaptarlo al proyecto y revisar que los nombres en `href` y `src` coincidan *exactamente* con los archivos (en servidores Linux, como GitHub Pages, también importan las mayúsculas).

### 3. Un error encontrado y cómo se resolvió

**Problema:** el botón **"Cargar más personajes"** nunca desaparecía, aunque el JavaScript le ponía `btnMas.hidden = true` cuando ya no había más páginas o cuando fallaba la API.

**Causa:** el atributo `hidden` de HTML solo aplica `display: none` con prioridad muy baja. En `style.css` la clase del botón tenía:

```css
.boton {
  display: block;   /* ← esta regla le ganaba al atributo hidden */
  ...
}
```

Así que el CSS "des-ocultaba" el botón. Lo descubrimos al probar el mensaje de error: el botón seguía visible debajo del aviso. Revisándolo en la consola, `btnMas.hidden` era `true` pero `getComputedStyle(btnMas).display` era `"block"`.

**Solución:** agregar una regla global en `style.css` para que `hidden` siempre gane:

```css
[hidden] {
  display: none !important;
}
```

**Lección:** que el JavaScript haga lo correcto no garantiza que se vea bien. El CSS puede contradecirlo, por eso hay que probar en el navegador e inspeccionar los estilos calculados.

### 4. Una modificación realizada al código que puedo explicar: ⚖️ Comparar personajes (mi aporte)

**La idea:** quería poder elegir dos personajes y verlos **lado a lado**, para saber rápido en qué se parecen y en qué no (por ejemplo, Rick y Morty: misma especie y mismo origen, pero distinto género). Esta funcionalidad no venía en los requisitos; la propuse yo y la agregué al final como la versión definitiva del proyecto.

**Cómo funciona para el usuario:**

1. Cada tarjeta tiene un botón **⚖️ Comparar**. Al tocarlo cambia a **✓ Seleccionado**.
2. La pestaña **⚖️ Comparar (n/2)** muestra cuántos personajes van elegidos.
3. Al elegir el segundo, la página salta sola a la pestaña Comparar.
4. Ahí aparecen las dos fotos con un **VS** en medio y una tabla con estado, especie, tipo, género, origen, ubicación y número de episodios.
5. Las filas donde ambos personajes coinciden se pintan de verde con la etiqueta **✓ Coinciden**.
6. El botón **Limpiar comparación** quita la selección para empezar de nuevo.

**Cómo funciona por dentro (`script.js`):**

- **Arreglo `seleccionados`:** guarda los personajes elegidos, con un máximo de 2. Si eliges un tercero, el más antiguo se quita con `shift()` y el nuevo entra con `push()`. Así la comparación nunca se rompe por tener de más.
- **`alternarComparacion(p)`:** si el personaje ya estaba seleccionado lo quita; si no, lo agrega. Después actualiza el contador, repinta los botones y llama a `mostrarComparacion()`.
- **`mostrarComparacion()`:** si hay menos de 2 personajes muestra un texto de ayuda; si hay 2, construye la cabecera con las fotos y la tabla.
- **Tabla basada en datos:** las filas se definen en un arreglo de pares `[nombre, función]`, por ejemplo `["Especie", (p) => traducir(p.species)]`. Con `.map()` genero todas las filas sin repetir código. Para agregar un dato nuevo basta con añadir un par al arreglo.
- **Coincidencias:** para cada fila comparo el valor de los dos personajes; si son iguales, la fila recibe la clase `igual`, que en CSS la pinta de verde.
- **Seguridad:** todo el texto se inserta con `textContent`, no con `innerHTML`.

**Cómo encaja con el resto de la página (pestañas):** para que el comparador tuviera su propio espacio, la página se divide en tres pestañas: **🧪 Personajes**, **⭐ Favoritos** y **⚖️ Comparar**.

- Cada pestaña tiene un atributo `data-vista` y cada sección es un `<section class="vista">` con el id `vista-<nombre>`.
- `cambiarVista(nombre)` oculta con `hidden` las secciones que no corresponden y marca la pestaña activa.
- En vez de un `addEventListener` por pestaña, uso **delegación de eventos**: uno solo en el `<nav>` y `e.target.closest(".pestana")` para saber cuál se tocó.
- Esto también resolvió que los favoritos aparecieran encima de la lista de personajes: ahora tienen su propia pestaña.

**Detalles que aprendí al hacerlo:**

- `data-id` siempre se lee como **texto**, así que hay que convertirlo con `Number(boton.dataset.id)` antes de compararlo con el `id` numérico de la API. Sin eso, `"1" === 1` da `false` y el botón nunca se marcaba como seleccionado.
- Al publicar en **GitHub Pages**, la página se veía sin los botones de Comparar: el `index.html` era el nuevo, pero el navegador seguía usando el `style.css` y el `script.js` viejos guardados en caché. Se solucionó subiendo los tres archivos y recargando con `Ctrl + Shift + R`.

### 5. Reflexión sobre lo que aprendí utilizando IA

Usar la IA como tutor, y no solo como generador de código, fue lo que más me ayudó. Cuando le pedí que me dijera **dónde** insertar cada cambio en lugar de darme archivos completos, tuve que leer y entender cada fragmento antes de pegarlo, y así aprendí conceptos que no conocía:

- **`fetch` y `async/await`** para consumir una API, y que `fetch` **no** marca como error un 404 o un 500 (hay que revisar `respuesta.ok`).
- **Debounce**, para no saturar la API con una petición por cada letra.
- **`localStorage`** con `JSON.stringify` y `JSON.parse`, para guardar datos en el navegador.
- **`AbortController`**, para cancelar una petición que tarda demasiado.
- La diferencia entre **`textContent` e `innerHTML`**, y por qué usar `innerHTML` con texto del usuario puede abrir la puerta a ataques **XSS**.
- **CSS Grid** con `repeat(auto-fill, minmax(...))` para un diseño adaptable sin escribir muchos *media queries*.

También aprendí que **la IA se puede equivocar**. Sus respuestas no siempre coinciden con mi proyecto (como los nombres de archivo) y a veces tienen errores (como el botón que no se ocultaba). Por eso es indispensable **probar todo en el navegador**, usar las herramientas de desarrollador (F12) y entender el código en lugar de copiarlo. La IA acelera el trabajo, pero la responsabilidad de que funcione y de entenderlo sigue siendo mía.

Lo que más disfruté fue el comparador, porque fue algo que salió de mí. Ya no solo seguía instrucciones: tuve que pensar qué quería, explicárselo con claridad a la IA y después entender y revisar lo que me proponía. Me di cuenta de que la IA es más útil cuando yo tengo claro qué quiero construir.

---

Datos proporcionados por [The Rick and Morty API](https://rickandmortyapi.com). Proyecto con fines educativos.
