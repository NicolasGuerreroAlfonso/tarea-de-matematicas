/* ============================================================
   CLASIFICADOR DE FUNCIONES — Lógica principal
   f(x) = bx + c
   - c = 0  → función lineal
   - c ≠ 0  → función afín
   - b = 0  → constante (o nula si además c = 0)
   ============================================================ */

// --- Estado actual de la función y del visor ---
let bActual = 0;
let cActual = 0;
let ggbApi = null;          // API de GeoGebra una vez cargado el applet
let archivoRepoBlob = null; // Blob de funcion.ggb descargado del repo

// --- Referencias al DOM (se cachean una sola vez) ---
const dom = {
    valorB: document.getElementById("valor-b"),
    valorC: document.getElementById("valor-c"),
    expresion: document.getElementById("expresion-funcion"),
    miniEstado: document.getElementById("mini-estado"),
    cajaLineal: document.getElementById("caja-lineal"),
    cajaAfin: document.getElementById("caja-afin"),
    contLineal: document.getElementById("contenido-lineal"),
    contAfin: document.getElementById("contenido-afin"),
    badgeLineal: document.getElementById("badge-lineal"),
    badgeAfin: document.getElementById("badge-afin"),
    repoStatusText: document.getElementById("repo-status-text"),
    btnCargarRepo: document.getElementById("btn-cargar-repo"),
    btnGenerar: document.getElementById("btn-generar"),
    btnCopiar: document.getElementById("btn-copiar"),
    inputGgb: document.getElementById("input-ggb"),
    ggbContainer: document.getElementById("ggb-container")
};

// Colores de la recta según el tipo de función
const COLORES = {
    nula: [71, 85, 105],
    constante: [217, 119, 6],
    lineal: [13, 148, 136],
    afin: [225, 29, 72]
};

// Entero aleatorio dentro de [min, max]
function randomEntero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Arma la expresión f(x) con formato limpio (1x → x, -1x → -x)
function formatearExpresion(b, c) {
    if (b === 0) return `f(x) = ${c}`;
    const parteB = b === 1 ? "x" : b === -1 ? "-x" : `${b}x`;
    if (c === 0) return `f(x) = ${parteB}`;
    return `f(x) = ${parteB} ${c > 0 ? "+" : "-"} ${Math.abs(c)}`;
}

// Describe la pendiente en lenguaje matemático
function describirPendiente(b) {
    if (b > 0) return `Creciente (b = ${b} > 0, sube de izquierda a derecha).`;
    if (b < 0) return `Decreciente (b = ${b} < 0, baja de izquierda a derecha).`;
    return `Constante (b = 0, recta horizontal con pendiente nula).`;
}

// Marca ambas cajas como inactivas con el mismo mensaje
function mostrarInactivas(mensaje) {
    dom.cajaLineal.classList.remove("active-lineal");
    dom.cajaAfin.classList.remove("active-afin");
    dom.badgeLineal.textContent = "Inactiva";
    dom.badgeAfin.textContent = "Inactiva";
    dom.contLineal.innerHTML = `<p class="empty-msg">${mensaje}</p>`;
    dom.contAfin.innerHTML = `<p class="empty-msg">${mensaje}</p>`;
}

// Genera coeficientes aleatorios, clasifica la función y la dibuja
function generarYClasificar() {
    bActual = randomEntero(-3, 3);
    cActual = randomEntero(-3, 3);

    dom.valorB.textContent = bActual;
    dom.valorC.textContent = cActual;

    const expresion = formatearExpresion(bActual, cActual);
    dom.expresion.textContent = expresion;

    // --- Caso 1: sin función (b = 0, c = 0) o constante (b = 0) ---
    if (bActual === 0) {
        const nula = cActual === 0;
        dom.miniEstado.className = nula ? "mini-panel is-none" : "mini-panel is-constante";
        dom.miniEstado.innerHTML = nula
            ? `<span><strong>No hay función:</strong> b = 0 y c = 0 (f(x) = 0).</span>
               <span class="mini-badge">b = 0, c = 0</span>`
            : `<span><strong>Función Constante:</strong> Recta horizontal en y = ${cActual}.</span>
               <span class="mini-badge">b = 0, c ≠ 0</span>`;

        mostrarInactivas(
            nula
                ? "No corresponde (no hay función)."
                : "No corresponde (b = 0: función constante)."
        );
    }

    // --- Caso 2: función lineal (c = 0) ---
    else if (cActual === 0) {
        dom.miniEstado.className = "mini-panel hidden";
        dom.miniEstado.innerHTML = "";

        dom.cajaLineal.classList.add("active-lineal");
        dom.cajaAfin.classList.remove("active-afin");
        dom.badgeLineal.textContent = "ACTIVA (c = 0)";
        dom.badgeAfin.textContent = "Inactiva (c ≠ 0)";

        dom.contLineal.innerHTML = `
            <ul class="props-list">
                <li><strong>Expresión:</strong> ${expresion}</li>
                <li><strong>Gráfica:</strong> Línea recta continua.</li>
                <li><strong>Paso Obligatorio:</strong> Pasa por el origen de coordenadas <strong>(0, 0)</strong>.</li>
                <li><strong>Pendiente (b = ${bActual}):</strong> ${describirPendiente(bActual)}</li>
            </ul>`;
        dom.contAfin.innerHTML = `<p class="empty-msg">No corresponde (el coeficiente c es igual a 0).</p>`;
    }

    // --- Caso 3: función afín (c ≠ 0) ---
    else {
        dom.miniEstado.className = "mini-panel hidden";
        dom.miniEstado.innerHTML = "";

        dom.cajaAfin.classList.add("active-afin");
        dom.cajaLineal.classList.remove("active-lineal");
        dom.badgeAfin.textContent = `ACTIVA (c = ${cActual} ≠ 0)`;
        dom.badgeLineal.textContent = "Inactiva (c = 0)";

        const traslacion = cActual > 0
            ? `${cActual} unidades hacia arriba`
            : `${Math.abs(cActual)} unidades hacia abajo`;

        dom.contAfin.innerHTML = `
            <ul class="props-list">
                <li><strong>Expresión:</strong> ${expresion}</li>
                <li><strong>Gráfica:</strong> Línea recta que no pasa por el origen.</li>
                <li><strong>Corte Eje Y:</strong> Interseca al eje Y en <strong>(0, ${cActual})</strong>.</li>
                <li><strong>Inclinación:</strong> Regulada por la pendiente b = ${bActual} → ${describirPendiente(bActual)}</li>
                <li><strong>Traslación:</strong> Traslación vertical de f(x) = ${bActual}x en <strong>${traslacion}</strong>.</li>
            </ul>`;
        dom.contLineal.innerHTML = `<p class="empty-msg">No corresponde (el coeficiente c es distinto de 0).</p>`;
    }

    graficarEnGeoGebra(bActual, cActual);
}

// Dibuja/actualiza la recta en GeoGebra y la colorea según su tipo
function graficarEnGeoGebra(b, c) {
    if (!ggbApi) return;
    try {
        if (ggbApi.exists("b") && ggbApi.exists("c")) {
            ggbApi.setValue("b", b);
            ggbApi.setValue("c", c);
        } else {
            ggbApi.evalCommand(`b = ${b}`);
            ggbApi.evalCommand(`c = ${c}`);
        }

        if (!ggbApi.exists("f")) ggbApi.evalCommand(`f(x) = b * x + c`);
        if (!ggbApi.exists("CorteY")) ggbApi.evalCommand(`CorteY = (0, c)`);

        const tipo = b === 0 ? (c === 0 ? "nula" : "constante") : (c === 0 ? "lineal" : "afin");
        ggbApi.setColor("f", ...COLORES[tipo]);
        ggbApi.setLineThickness("f", 4);
    } catch (err) {
        console.warn("Error al actualizar el gráfico en GeoGebra:", err);
    }
}

// Carga un .ggb (local o del repo) dentro del visor
function cargarArchivoGGBEnVisor(blob) {
    if (!ggbApi || !blob) return;
    const reader = new FileReader();
    reader.onload = (e) => ggbApi.setBase64(e.target.result.split(",")[1]);
    reader.readAsDataURL(blob);
}

// Comprueba si funcion.ggb existe en el repositorio publicado
async function verificarArchivoEnGitHubPages() {
    try {
        const response = await fetch("./funcion.ggb");
        if (!response.ok) {
            dom.repoStatusText.innerHTML =
                `No se encontró <code>./funcion.ggb</code> en la raíz del repositorio (puedes cargarlo manualmente arriba).`;
            return;
        }
        archivoRepoBlob = await response.blob();
        dom.repoStatusText.innerHTML =
            `Archivo <strong>funcion.ggb</strong> conectado correctamente desde GitHub Pages.`;
        dom.btnCargarRepo.style.display = "inline-flex";
    } catch (error) {
        dom.repoStatusText.innerHTML =
            `Modo local: al subir todos los archivos a GitHub Pages se conectarán solos.`;
    }
}

// Copia el texto al portapapeles con fallback para contextos no seguros
function copiarTexto(texto, boton) {
    const confirmar = () => {
        boton.textContent = "Copiada";
        setTimeout(() => { boton.textContent = "Copiar función"; }, 1500);
    };

    const fallback = () => {
        const area = document.createElement("textarea");
        area.value = texto;
        area.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand("copy");
            confirmar();
        } catch (err) {
            console.warn("No se pudo copiar el texto:", err);
        }
        document.body.removeChild(area);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(confirmar).catch(fallback);
    } else {
        fallback();
    }
}

/* ============================================================
   ARRANQUE
   ============================================================ */

window.addEventListener("load", () => {
    // Inicializa el applet de GeoGebra si la librería cargó
    if (typeof GGBApplet !== "undefined") {
        const applet = new GGBApplet({
            appName: "classic",
            width: dom.ggbContainer.clientWidth || 718,
            height: 420,
            showToolBar: true,
            showAlgebraInput: true,
            showMenuBar: false,
            enableRightClick: true,
            language: "es",
            appletOnLoad: (api) => {
                ggbApi = api;
                generarYClasificar();
            }
        }, true);
        applet.inject("ggb-container");
    } else {
        dom.ggbContainer.innerHTML =
            "<p style='color:#18181b;padding:20px;'>No se pudo cargar el visor embebido de GeoGebra. Revisa tu conexión a internet o usa el botón superior.</p>";
        generarYClasificar();
    }

    verificarArchivoEnGitHubPages();
});

/* ============================================================
   EVENTOS
   ============================================================ */

dom.btnGenerar.addEventListener("click", generarYClasificar);

dom.btnCopiar.addEventListener("click", (event) => {
    copiarTexto(dom.expresion.textContent, event.currentTarget);
});

dom.inputGgb.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    dom.repoStatusText.innerHTML = `Archivo cargado en el visor: <strong>${file.name}</strong>`;
    cargarArchivoGGBEnVisor(file);
});

dom.btnCargarRepo.addEventListener("click", () => {
    if (!archivoRepoBlob) return;
    cargarArchivoGGBEnVisor(archivoRepoBlob);
    dom.repoStatusText.innerHTML = `Mostrando <strong>funcion.ggb</strong> desde tu repositorio.`;
});