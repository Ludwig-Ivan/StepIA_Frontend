import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { ProfesionalModel } from "../schema/ProfesionalSchema.js";
import { z } from "zod";
export const obtenerByEmail = async (email) => {
  try {
    email = z.email().parse(email);
    const response = await api.get(ENDPOINTS.PROFESIONALES.GET_BY_ID(email));
    return ProfesionalModel(response.data);
  } catch (e) {
    throw new Error("No se pudo encontrar al profesional", { cause: e });
  }
};
