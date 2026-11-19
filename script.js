let bActual = 0;
let cActual = 0;
let ggbApi = null;
let archivoRepoBlob = null;

function randomEntero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatearExpresion(b, c) {
    if (b === 0 && c === 0) return "f(x) = 0";
    if (b === 0) return `f(x) = ${c}`;

    let parteB = "";
    if (b === 1) parteB = "x";
    else if (b === -1) parteB = "-x";
    else parteB = `${b}x`;

    if (c === 0) return `f(x) = ${parteB}`;
    if (c > 0) return `f(x) = ${parteB} + ${c}`;
    return `f(x) = ${parteB} - ${Math.abs(c)}`;
}

function describirPendiente(b) {
    if (b > 0) return `Creciente (b = ${b} > 0, sube de izquierda a derecha).`;
    if (b < 0) return `Decreciente (b = ${b} < 0, baja de izquierda a derecha).`;
    return `Constante (b = 0, recta horizontal con pendiente nula).`;
}

function generarYClasificar() {
    bActual = randomEntero(-10, 10);
    cActual = randomEntero(-10, 10);

    document.getElementById("valor-b").textContent = bActual;
    document.getElementById("valor-c").textContent = cActual;

    const expresion = formatearExpresion(bActual, cActual);
    document.getElementById("expresion-funcion").textContent = expresion;

    const cajaLineal = document.getElementById("caja-lineal");
    const cajaAfin = document.getElementById("caja-afin");
    const contLineal = document.getElementById("contenido-lineal");
    const contAfin = document.getElementById("contenido-afin");
    const badgeLineal = document.getElementById("badge-lineal");
    const badgeAfin = document.getElementById("badge-afin");

    if (cActual === 0) {
        cajaLineal.classList.add("active-lineal");
        cajaAfin.classList.remove("active-afin");

        badgeLineal.textContent = "ACTIVA (c = 0)";
        badgeAfin.textContent = "Inactiva (c ≠ 0)";

        contLineal.innerHTML = `
      <ul class="props-list">
        <li><strong>Expresión:</strong> ${expresion}</li>
        <li><strong>Gráfica:</strong> Línea recta continua.</li>
        <li><strong>Paso Obligatorio:</strong> Pasa por el origen de coordenadas <strong>(0, 0)</strong>.</li>
        <li><strong>Pendiente (b = ${bActual}):</strong> ${describirPendiente(bActual)}</li>
      </ul>
    `;
        contAfin.innerHTML = `<p class="empty-msg">No corresponde (el coeficiente c es igual a 0).</p>`;
    } else {
        cajaAfin.classList.add("active-afin");
        cajaLineal.classList.remove("active-lineal");

        badgeAfin.textContent = `ACTIVA (c = ${cActual} ≠ 0)`;
        badgeLineal.textContent = "Inactiva (c = 0)";

        const direccionTraslacion =
            cActual > 0
                ? `${cActual} unidades hacia arriba`
                : `${Math.abs(cActual)} unidades hacia abajo`;

        contAfin.innerHTML = `
      <ul class="props-list">
        <li><strong>Expresión:</strong> ${expresion}</li>
        <li><strong>Gráfica:</strong> Línea recta que no pasa por el origen.</li>
        <li><strong>Corte Eje Y:</strong> Interseca al eje Y en las coordenadas <strong>(0, ${cActual})</strong>.</li>
        <li><strong>Inclinación:</strong> Regulada por la pendiente b = ${bActual} → ${describirPendiente(bActual)}</li>
        <li><strong>Traslación:</strong> Traslación vertical de la función lineal f(x) = ${bActual}x en <strong>${direccionTraslacion}</strong>.</li>
      </ul>
    `;
        contLineal.innerHTML = `<p class="empty-msg">No corresponde (el coeficiente c es distinto de 0).</p>`;
    }

    graficarEnGeoGebra(bActual, cActual);
}

function graficarEnGeoGebra(b, c) {
    if (!ggbApi) return;
    try {
        if (ggbApi.exists("b") && ggbApi.exists("c")) {
            ggbApi.setValue("b", b);
            ggbApi.setValue("c", c);
        } else {
            ggbApi.evalCommand(`b = ${b}`);
            ggbApi.evalCommand(`c = ${c}`);
            ggbApi.evalCommand(`f(x) = b * x + c`);
            ggbApi.evalCommand(`CorteY = (0, c)`);
        }
        ggbApi.setColor("f", c === 0 ? 21 : 180, c === 0 ? 128 : 83, c === 0 ? 61 : 9);
        ggbApi.setLineThickness("f", 4);
    } catch (err) {
        console.warn("Error al actualizar el gráfico en GeoGebra:", err);
    }
}

function cargarArchivoGGBEnVisor(blob) {
    if (!ggbApi || !blob) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result.split(",")[1];
        ggbApi.setBase64(base64);
    };
    reader.readAsDataURL(blob);
}


async function verificarArchivoEnGitHubPages() {
    const statusText = document.getElementById("repo-status-text");
    const btnCargarRepo = document.getElementById("btn-cargar-repo");

    try {
        const response = await fetch("./funcion.ggb");
        if (response.ok) {
            archivoRepoBlob = await response.blob();
            statusText.innerHTML = `Archivo <strong>funcion.ggb</strong> conectado correctamente desde GitHub Pages.`;
            btnCargarRepo.style.display = "inline-flex";
        } else {
            statusText.innerHTML = `No se encontró <code>./funcion.ggb</code> en la raíz del repositorio (puedes cargarlo manualmente arriba).`;
        }
    } catch (error) {
        statusText.innerHTML = `Modo local: al subir los archivos  se conectarán solos.`;
    }
}

window.addEventListener("load", () => {
    if (typeof GGBApplet !== "undefined") {
        const params = {
            appName: "classic",
            width: document.getElementById("ggb-container").clientWidth || 718,
            height: 420,
            showToolBar: true,
            showAlgebraInput: true,
            showMenuBar: false,
            enableRightClick: true,
            language: "es",
            appletOnLoad: function (api) {
                ggbApi = api;
                generarYClasificar();
            }
        };
        const applet = new GGBApplet(params, true);
        applet.inject("ggb-container");
    } else {
        document.getElementById("ggb-container").innerHTML =
            "<p style='color:#0f172a;padding:20px;'>No se pudo cargar el visor embebido de GeoGebra. Revisa tu conexión a internet o usa el botón superior.</p>";
        generarYClasificar();
    }

    verificarArchivoEnGitHubPages();
});

document.getElementById("btn-generar").addEventListener("click", generarYClasificar);

document.getElementById("btn-copiar").addEventListener("click", () => {
    const texto = document.getElementById("expresion-funcion").textContent;
    navigator.clipboard.writeText(texto);
    const btn = document.getElementById("btn-copiar");
    btn.textContent = "Copiada";
    setTimeout(() => (btn.textContent = "Copiar función"), 1500);
});

document.getElementById("input-ggb").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("repo-status-text").innerHTML =
        `Archivo cargado en el visor: <strong>${file.name}</strong>`;
    cargarArchivoGGBEnVisor(file);
});

document.getElementById("btn-cargar-repo").addEventListener("click", () => {
    if (archivoRepoBlob) {
        cargarArchivoGGBEnVisor(archivoRepoBlob);
        document.getElementById("repo-status-text").innerHTML =
            `Mostrando <strong>funcion.ggb</strong> desde tu repositorio de GitHub Pages.`;
    }
});