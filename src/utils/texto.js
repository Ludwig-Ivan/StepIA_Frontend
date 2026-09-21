/**
 * Utilidades compartidas de normalización de texto.
 * Centraliza el patrón `convertirTexto`/`normalizarTexto` que estaba duplicado
 * en varias páginas (listaPacientes, useAnalisisPlantar, useSoporte, Agenda,
 * Historial, HistorialPaciente).
 */

/**
 * Convierte un valor a texto en minúsculas y sin espacios sobrantes,
 * con manejo seguro de nulos/indefinidos.
 * @param {unknown} valor
 * @returns {string}
 */
export const normalizarTexto = (valor) =>
  `${valor || ""}`.toLowerCase().trim();

/**
 * Devuelve `true` si el campo contiene el texto de búsqueda normalizado.
 * Reúne el patrón `incluye(…)/incluirCampo(…)` repetido en buscadores.
 * @param {unknown} campo
 * @param {string} textoBusqueda texto ya normalizado con `normalizarTexto`
 * @returns {boolean}
 */
export const incluyeTexto = (campo, textoBusqueda) =>
  textoBusqueda === "" ||
  `${campo || ""}`.toLowerCase().trim().includes(textoBusqueda);

/**
 * Devuelve la primera coincidencia no vacía entre varios valores candidatos.
 * Sustituye cadenas del tipo `paciente.x || paciente.y || "defecto"`.
 * @param {...unknown} valores
 * @returns {string}
 */
export const primerValorNoVacio = (...valores) => {
  for (const valor of valores) {
    if (valor !== null && valor !== undefined && `${valor}`.trim() !== "") {
      return `${valor}`;
    }
  }
  return "";
};

/**
 * Pone en mayúscula la primera letra de cada palabra (títulos/encabezados).
 * @param {string} texto
 * @returns {string}
 */
export const convertirTitulo = (texto) =>
  `${texto || ""}`
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (letra) => letra.toUpperCase());
