import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Informe } from "../models/informes/informe.js";

export const createInforme = async (informe) => {
  const response = await api.post(ENDPOINTS.INFORME.CREATE, informe);
  return Informe(response.data);
};

export const getInformeByPaciente = async (idPaciente, page = 0, size = 5) => {
  const response = await api.get(
    ENDPOINTS.INFORME.GET_BY_PACIENTE(idPaciente, page, size),
  );

  const content = response.data.content.map((informe) => Informe(informe));
  return {
    ...response.data,
    content,
  };
};
