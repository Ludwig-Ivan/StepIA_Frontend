import { z } from "zod";
import CURP_REGEX from "./ExpReg.js";

const PacienteSchema = z.object({
  curp: z.string().max(20).regex(CURP_REGEX),
  nombre: z.string().max(100),
  apellidoPaterno: z.string().max(100),
  apellidoMaterno: z.string().max(100),
  fechaNacimiento: z.iso.date(),
  sexo: z.enum(["MASCULINO", "FEMENINO", "INTERSEXUAL", "NO_ESPECIFICADO"]),
  telefono: z.e164(),
  domicilio: z.string().max(255),
});

export const PacienteModel = (data) => PacienteSchema.parse(data);

export { PacienteSchema };
