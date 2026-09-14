export const Expediente = (data = {}) => ({
  idPaciente: data.idPaciente ?? "",
  numeroExpediente: data.numeroExpediente ?? "",
  antecedentes: data.antecedentes ?? "",
  estado: data.estado ?? "",
});
