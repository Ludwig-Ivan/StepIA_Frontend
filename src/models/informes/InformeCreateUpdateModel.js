export const InformeCreateUpdateModel = (data = {}) => ({
  idPaciente: data.idPaciente ?? "",
  idProfesional: data.idProfesional ?? "",
  estadoGeneral: data.estadoGeneral ?? "",
  pesoKg: data.pesoKg ?? null,
  sintomas: data.sintomas ?? "",
  descripcion: data.descripcion ?? "",
  diagnostico: data.diagnostico ?? "",
  codigoCie10: data.codigoCie10 ?? "M79.67",
  tratamiento: data.tratamiento ?? "",
  evolucion: data.evolucion ?? "",
  observaciones: data.observaciones ?? "",
});
