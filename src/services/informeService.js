import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Informe } from "../models/informes/informe.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createInforme = (informe) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.INFORME.CREATE, informe);
      return Informe(response.data);
    },
    "No se pudo crear el informe",
  );

export const getInformeByPaciente = (idPaciente, page = 0, size = 5) =>
  ejecutarServicio(
    async () => {
      const response = await api.get(
        ENDPOINTS.INFORME.GET_BY_PACIENTE(idPaciente, page, size),
      );

      const content = response.data.content.map((registro) =>
        Informe(registro),
      );

      return {
        ...response.data,
        content,
      };
    },
    "No se pudieron obtener los informes del paciente",
  );
