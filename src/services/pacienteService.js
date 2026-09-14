import api from "../api/api.js";
import { Paciente } from "../models/pacientes/paciente.js";

const BASE_URL = "/core-service/pacientes";

export const createPaciente = async (paciente) => {
  const response = await api.post(BASE_URL, paciente);
  return Paciente(response.data);
};

export const getPacienteById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return Paciente(response.data);
};

export const getPacientes = async (searchTerm, page = 0, limit = 10) => {
  const response = await api.get(
    `${BASE_URL}?search=${searchTerm}&page=${page}&limit=${limit}`,
  );

  const content = response.data.content.map((paciente) => Paciente(paciente));
  return {
    ...response.data,
    content,
  };
};
