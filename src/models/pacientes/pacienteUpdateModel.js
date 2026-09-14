export const pacienteUpdateModel = (data = {}) => ({
  nombre: data.nombre ?? "",
  apellidoPaterno: data.apellidoPaterno ?? "",
  apellidoMaterno: data.apellidoMaterno ?? "",
  fechaNacimiento: data.fechaNacimiento ?? "",
  sexo: data.sexo ?? "",
  telefono: data.telefono ?? "",
  domicilio: data.domicilio ?? "",
});
