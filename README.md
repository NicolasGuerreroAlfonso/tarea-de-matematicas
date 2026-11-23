# Clasificador de Funciones — Lineal y Afín

Aplicación web educativa de una sola página que genera funciones de primer grado $$f(x) = bx + c$$ con coeficientes aleatorios y clasifica el resultado según el valor de $$c$$. Incluye modelación gráfica en vivo con GeoGebra.

Pensada como material de apoyo para el estudio de funciones algebraicas, pendiente, ordenada al origen y traslaciones verticales.

---

## Características

- Generación aleatoria de $$b$$ y $$c$$ en el rango $$[-3, 3]$$ (enteros).
- Clasificación automática en cuatro casos: función lineal, función afín, función constante y ausencia de función.
- Visualización formateada de la expresión (`1x` → `x`, `-1x` → `-x`).
- Listado de propiedades por caso: pendiente, corte con el eje Y, traslación vertical, paso por el origen.
- Gráfica de la recta en un applet de GeoGebra embebido, con color distinto según el tipo detectado.
- Botón para copiar la función generada al portapapeles.
- Carga de archivos `.ggb` desde el repositorio o desde el disco local.
- Interfaz responsive, sin dependencias de build ni frameworks.

---

## Clasificación matemática

| Condición | Clasificación | Resultado en la interfaz |
|---|---|---|
| $$c = 0$$ | Función lineal | Caja **F.L.** activa, recta por el origen |
| $$c \neq 0$$ | Función afín | Caja **F.A.** activa, corte en $$(0, c)$$ |
| $$b = 0,\ c \neq 0$$ | Función constante | Aviso de recta horizontal, ambas cajas inactivas |
| $$b = 0,\ c = 0$$ | Sin función | Aviso, ambas cajas inactivas |

La clasificación se basa únicamente en el coeficiente de posición: **una función de primer grado es lineal solo si pasa por el origen**.
