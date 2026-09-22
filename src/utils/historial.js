const CLAVE_HISTORIAL = "historialActividades";

const leerHistorial = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
};

export const registrarActividad = ({
  tipo,
  descripcion,
  paciente = "",
  detalles = "",
}) => {
  try {
    const historial = leerHistorial();

    const nuevaActividad = {
      id: Date.now(),
      tipo,
      descripcion,
      paciente,
      detalles,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fechaCompleta: new Date().toISOString(),
    };

    historial.unshift(nuevaActividad);

    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));

    return nuevaActividad;
  } catch {
    return null;
  }
};
