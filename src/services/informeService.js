import api from "../api/api.js";
import { Informe } from "../models/informes/informe.js";

const BASE_URL = "/core-service/informes";

export const createInforme = async (informe) => {
  const response = await api.post(BASE_URL, informe);
  return Informe(response.data);
};

export const getInformeByPaciente = async (idPaciente, page = 0, size = 5) => {
  const response = await api.get(
    `${BASE_URL}/paciente?idPaciente=${idPaciente}&page=${page}&size=${size}`,
  );

  const content = response.data.content.map((informe) => Informe(informe));
  return {
    ...response.data,
    content,
  };
};
