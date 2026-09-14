export const estudio = (data = {}) => ({
  id: Date.now(),
  nombre: data.name,
  tipo: data.type,
  tamaño: data.size,
  archivo: data.archivoBase64,
  fecha: new Date().toLocaleDateString(),
  hora: new Date().toLocaleTimeString(),
});
