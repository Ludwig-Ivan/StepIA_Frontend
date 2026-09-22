import { z } from "zod";
import CURP_REGEX from "./ExpReg.js";

const ExpedienteSchema = z.object({
  idPaciente: z.string().regex(CURP_REGEX).length(18),
  numeroExpediente: z.string().max(30),
  antecedentes: z.string().max(255),
  estado: z.enum(["ACTIVO", "INACTIVO", "CERRADO"]),
});

export const ExpedienteModel = (data) => ExpedienteSchema.parse(data);
