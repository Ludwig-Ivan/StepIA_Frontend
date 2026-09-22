import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Analisis } from "../models/analisis/analisis.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createAnalisis = (analisis) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.ANALISIS.CREATE, analisis);
      return Analisis(response.data);
    },
    "No se pudo crear el análisis",
  );

export const getAnalisisByInforme = (idInforme) =>
  ejecutarServicio(
    async () => {
      const response = await api.get(
        ENDPOINTS.ANALISIS.GET_BY_INFORME(idInforme),
      );
      return response.data.map((analisis) => Analisis(analisis));
    },
    "No se pudieron obtener los análisis del informe",
  );
