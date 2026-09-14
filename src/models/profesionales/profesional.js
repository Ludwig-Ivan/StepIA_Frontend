export const Profesional = (data = {}) => ({
  idProfesional: data.idProfesional ?? "",
  especialidad: data.especialidad ?? "",
  nombre: data.nombre ?? "",
  apellidoPaterno: data.apellidoPaterno ?? "",
  apellidoMaterno: data.apellidoMaterno ?? "",
  cedulaProfesional: data.cedulaProfesional ?? "",
  cedulaEspecializada: data.cedulaEspecializada ?? "",
  institucion: data.institucion ?? "",
  telefono: data.telefono ?? "",
  email: data.email ?? "",
  activo: data.activo ?? "",
});
