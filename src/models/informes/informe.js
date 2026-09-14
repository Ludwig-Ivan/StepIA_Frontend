export const Informe = (data = {}) => ({
  idInforme: data.idInforme ?? "",
  idPaciente: data.idPaciente ?? "",
  idProfesional: data.idProfesional ?? "",
  estadoGeneral: data.estadoGeneral ?? "",
  pesoKg: data.pesoKg ?? "",
  sintomas: data.sintomas ?? "",
  diagnostico: data.diagnostico ?? "",
  codigoCie10: data.codigoCie10 ?? "",
  tratamiento: data.tratamiento ?? "",
  evolucion: data.evolucion ?? "",
  observaciones: data.observaciones ?? "",
  fechaRegistro: data.fechaRegistro ?? "",
});
