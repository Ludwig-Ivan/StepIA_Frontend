import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { PredictModel } from "../models/analisis/PredictModel.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createPredict = (img) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.IA.CREATE_PREDICT, img, {
        headers: {
          "Content-Type": img.type,
        },
      });

      return PredictModel(response.data);
    },
    "No se pudo procesar el análisis con IA",
  );
