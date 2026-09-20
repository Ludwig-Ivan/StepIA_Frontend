import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { ProfesionalModel } from "../schema/ProfesionalSchema.js";
import { z } from "zod";
import { ejecutarServicio } from "../utils/errores.js";

export const obtenerByEmail = (email) =>
  ejecutarServicio(
    async () => {
      const correo = z.email().parse(email);
      const response = await api.get(
        ENDPOINTS.PROFESIONALES.GET_BY_ID(correo),
      );
      return ProfesionalModel(response.data);
    },
    "No se pudo encontrar al profesional",
  );
