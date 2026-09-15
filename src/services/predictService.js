import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { PredictModel } from "../models/analisis/PredictModel.js";

export const createPredict = async (img) => {
  console.log("img:", img);
  console.log("tipo:", img?.constructor?.name);
  console.log("mime type:", img.type);

  const response = await api.post(ENDPOINTS.IA.CREATE_PREDICT, img, {
    headers: {
      "Content-Type": img.type, // ej. "image/png", "image/jpeg"
    },
  });

  return PredictModel(response.data);
};
