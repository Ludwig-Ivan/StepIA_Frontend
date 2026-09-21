import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import {
  PacienteModel,
  parsePacienteTolerante,
} from "../schema/PacienteSchema.js";
import { z } from "zod";
import CURP_REGEX from "../schema/ExpReg.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createPaciente = (paciente) =>
  ejecutarServicio(async () => {
    const response = await api.post(
      ENDPOINTS.PACIENTES.CREATE,
      PacienteModel(paciente),
    );
    return parsePacienteTolerante(response.data);
  }, "No se pudo crear el paciente");

export const getPacienteById = (id) =>
  ejecutarServicio(async () => {
    const curp = z.string().regex(CURP_REGEX).parse(id);
    const response = await api.get(ENDPOINTS.PACIENTES.GET_BY_ID(curp));
    return parsePacienteTolerante(response.data);
  }, "No se pudo obtener el paciente");

export const getPacientes = (searchTerm, page = 0, size = 10) =>
  ejecutarServicio(async () => {
    const response = await api.get(
      ENDPOINTS.PACIENTES.GET_ALL(searchTerm, page, size),
    );

    const content = response.data.content.map((paciente) =>
      parsePacienteTolerante(paciente),
    );

    return {
      ...response.data,
      content,
    };
  }, "No se pudo obtener la lista de pacientes");
