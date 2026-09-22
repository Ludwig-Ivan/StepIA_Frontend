import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { ExpedienteModel } from "../schema/ExpedienteSchema.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createExpediente = (expediente) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(
        ENDPOINTS.EXPEDIENTE.CREATE,
        ExpedienteModel(expediente),
      );
      return ExpedienteModel(response.data);
    },
    "No se pudo crear el expediente",
  );
