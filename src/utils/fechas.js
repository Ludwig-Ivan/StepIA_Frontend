/**
 * Utilidades compartidas de fechas.
 * Centraliza `formatearFecha`/`formatearFechaLocal`/`obtenerFechaDia`
 * duplicados (P08/P09).
 */

/**
 * Formatea una fecha ISO a `DD/MM/YYYY`.
 * @param {string|Date} valor
 * @param {string} [separador="/"]
 * @returns {string}
 */
export const formatearFecha = (valor, separador = "/") => {
  if (!valor) return "";

  const fecha = typeof valor === "string" ? new Date(valor) : valor;

  if (Number.isNaN(fecha.getTime())) return "";

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return [dia, mes, anio].join(separador);
};

/**
 * Formatea los componentes año-mes-día de un objeto `Date` a `YYYY-MM-DD`
 * (formato usado en inputs `type="date"` y como clave de agenda).
 * @param {Date} fecha
 * @returns {string}
 */
export const formatearFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

/**
 * Construye una fecha local (mediadía, sin desfase UTC) a partir de
 * año/mes/día numéricos.
 * @param {number} anio
 * @param {number} mes índice de mes (0-11)
 * @param {number} dia
 * @returns {Date}
 */
export const crearFechaDia = (anio, mes, dia) =>
  new Date(anio, mes, dia, 12, 0, 0, 0);

/**
 * Da formato legible a un mes: `"junio 2026"`.
 * @param {string} nombreMes
 * @param {number} anio
 * @returns {string}
 */
export const tituloMes = (nombreMes, anio) => `${nombreMes} ${anio}`;
