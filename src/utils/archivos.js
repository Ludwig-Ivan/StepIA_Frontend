/**
 * Utilidades compartidas de archivos/imágenes.
 * Centraliza la conversión a base64 mediante `FileReader` que estaba
 * duplicada en `useAnalisisPlantar.js`, `useInformePaciente.js` e
 * `HistorialPaciente.jsx`.
 */

/**
 * Convierte un archivo a una cadena base64 (data URL).
 * @param {File} archivo
 * @returns {Promise<string>}
 */
export const convertirABase64 = (archivo) =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => resolve(lector.result);
    lector.onerror = (error) => reject(error);

    lector.readAsDataURL(archivo);
  });

/**
 * Comprueba si un archivo es una imagen (por su tipo MIME).
 * @param {File} archivo
 * @returns {boolean}
 */
export const esImagen = (archivo) =>
  Boolean(archivo && archivo.type && archivo.type.startsWith("image/"));

/**
 * Valida que un archivo sea imagen y tenga un tamaño dentro del límite.
 * Reúne la comprobación `archivo.type.startsWith("image/")` repetida
 * en los cargadores de pies/pacientes.
 * @param {File} archivo
 * @param {number} [maxBytes=10_485_760] límite en bytes (10 MB por defecto)
 * @returns {{valido: boolean, razon?: string}}
 */
export const validarImagen = (archivo, maxBytes = 10_485_760) => {
  if (!archivo)
    return { valido: false, razon: "No se seleccionó ningún archivo." };
  if (!esImagen(archivo))
    return { valido: false, razon: "Solo se permiten imágenes." };
  if (archivo.size > maxBytes)
    return {
      valido: false,
      razon: "La imagen supera el tamaño máximo permitido.",
    };
  return { valido: true };
};
