export const registrarActividad = ({
  tipo,
  descripcion,
  paciente = '',
  detalles = ''
}) => {

  const historial =
    JSON.parse(
      localStorage.getItem('historialActividades')
    ) || []

  const nuevaActividad = {

    id: Date.now(),

    tipo,

    descripcion,

    paciente,

    detalles,

    fecha: new Date().toLocaleDateString('es-MX'),

    hora: new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    }),

    fechaCompleta:
      new Date().toISOString()

  }

  historial.unshift(nuevaActividad)

  localStorage.setItem(
    'historialActividades',
    JSON.stringify(historial)
  )

}