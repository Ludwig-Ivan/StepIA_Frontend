import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Paciente } from "../models/pacientes/paciente.js";

export const createPaciente = async (paciente) => {
  const response = await api.post(ENDPOINTS.PACIENTES.CREATE, paciente);
  return Paciente(response.data);
};

export const getPacienteById = async (id) => {
  const response = await api.get(ENDPOINTS.PACIENTES.GET_BY_ID(id));
  return Paciente(response.data);
};

export const getPacientes = async (searchTerm, page = 0, limit = 10) => {
  const response = await api.get(
    ENDPOINTS.PACIENTES.GET_ALL(searchTerm, page, limit),
  );

  const content = response.data.content.map((paciente) => Paciente(paciente));
  return {
    ...response.data,
    content,
  };
};
