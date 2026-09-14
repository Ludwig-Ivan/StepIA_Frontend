export const expedienteCreateModel = (data = {}) => ({
  idPaciente: data.idPaciente ?? "",
  numeroExpediente: data.numeroExpediente ?? "",
  antecedentes: data.antecedentes ?? "",
  estado: data.estado ?? "",
});
