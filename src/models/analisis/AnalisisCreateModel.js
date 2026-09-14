export const AnalisisCreateModel = (data = {}) => ({
  idInforme: data.idInforme ?? "",
  pieType: data.pieType ?? "",
  className: data.className ?? "",
  confidence: data.confidence ?? "",
});
