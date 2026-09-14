export const PacienteCreateModel = (data = {}) => ({
  curp: data.curp ?? "",
  nombre: data.nombre ?? "",
  apellidoPaterno: data.apellidoPaterno ?? "",
  apellidoMaterno: data.apellidoMaterno ?? "",
  fechaNacimiento: data.fechaNacimiento ?? "",
  sexo: data.sexo ?? "",
  telefono: data.telefono ?? "",
  domicilio: data.domicilio ?? "",
});
