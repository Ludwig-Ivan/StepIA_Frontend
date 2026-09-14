export const PredictModel = (data = {}) => ({
  fileName: data.file_name ?? "",
  className: data.class_name ?? "",
  confidence: data.confidence ?? "",
});
