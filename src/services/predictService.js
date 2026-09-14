import api from "../api/api.js";
import { PredictModel } from "../models/analisis/PredictModel.js";

const BASE_URL = "/ia-service";

export const createPredict = async (img) => {
  console.log("img:", img);
  console.log("tipo:", img?.constructor?.name);
  console.log("mime type:", img.type);

  const response = await api.post(`${BASE_URL}/predict`, img, {
    headers: {
      "Content-Type": img.type, // ej. "image/png", "image/jpeg"
    },
  });

  return PredictModel(response.data);
};
