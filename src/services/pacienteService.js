import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { PacienteModel } from "../schema/PacienteSchema.js";
import { z } from "zod";
import CURP_REGEX from "../schema/ExpReg.js";

export const createPaciente = async (paciente) => {
  try {
    console.log(paciente);
    const response = await api.post(
      ENDPOINTS.PACIENTES.CREATE,
      PacienteModel(paciente),
    );
    console.log(response.data);
    return PacienteModel(response.data);
  } catch (e) {
    throw new Error("No se logro crear al paciente", { cause: e });
  }
};

export const getPacienteById = async (id) => {
  try {
    const curp = z.string().regex(CURP_REGEX).parse(id);
    const response = await api.get(ENDPOINTS.PACIENTES.GET_BY_ID(curp));
    return PacienteModel(response.data);
  } catch (e) {
    throw new Error("No se logro obtener al paciente", { cause: e });
  }
};

export const getPacientes = async (searchTerm, page = 0, limit = 10) => {
  try {
    const response = await api.get(
      ENDPOINTS.PACIENTES.GET_ALL(searchTerm, page, limit),
    );

    const content = response.data.content.map((paciente) =>
      PacienteModel(paciente),
    );
    return {
      ...response.data,
      content,
    };
  } catch (e) {
    throw new Error("No se pudo obtener la lista de pacientes", { cause: e });
  }
};
