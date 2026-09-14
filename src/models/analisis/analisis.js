export const Analisis = (data = {}) => ({
  idAnalisis: data.idAnalisis ?? "",
  idInforme: data.idInforme ?? "",
  pieType: data.pieType ?? "",
  className: data.className ?? "",
  confidence: data.confidence ?? "",
  fechaRegistro: data.fechaRegistro ?? "",
  fechaActualizacion: data.fechaActualizacion ?? "",
});
