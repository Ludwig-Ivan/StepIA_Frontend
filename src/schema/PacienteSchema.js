import { z } from "zod";
import CURP_REGEX from "./ExpReg.js";

const PacienteSchema = z.object({
  curp: z.string().min(18).max(20).regex(CURP_REGEX),
  nombre: z.string().min(1).max(100),
  apellidoPaterno: z.string().min(1).max(100),
  apellidoMaterno: z.string().min(1).max(100),
  fechaNacimiento: z.iso.date().nullish(),
  sexo: z.enum(["MASCULINO", "FEMENINO", "INTERSEXUAL", "NO_ESPECIFICADO"]),
  telefono: z.union([z.e164(), z.string().max(20)]).nullish(),
  domicilio: z.string().max(255).nullish(),
});

export const parsePacienteTolerante = (data) => {
  const resultado = PacienteSchema.safeParse(data);
  return resultado.success ? resultado.data : data;
};

export const PacienteModel = (data) => PacienteSchema.parse(data);

export { PacienteSchema };