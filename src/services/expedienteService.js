import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { ExpedienteModel } from "../schema/ExpedienteSchema.js";

export const createExpediente = async (expediente) => {
  try {
    const response = await api.post(
      ENDPOINTS.EXPEDIENTE.CREATE,
      ExpedienteModel(expediente),
    );
    return ExpedienteModel(response.data);
  } catch (e) {
    throw new Error("No se logro crear el expediente", { cause: e });
  }
};
