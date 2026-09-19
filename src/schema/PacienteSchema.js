import { z } from "zod";

const PacienteSchema = z.object({
  curp: z
    .string()
    .max(20)
    .regex(
      /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
    ),
  nombre: z.string().max(100),
  apellidoPaterno: z.string().max(100),
  apellidoMaterno: z.string().max(100),
  fechaNacimiento: z.iso.date(),
  sexo: z.enum(["MASCULINO", "FEMENINO", "INTERSEXUAL", "NO_ESPECIFICADO"]),
  telefono: z.e164(),
  domicilio: z.string().max(255),
});

export const PacienteModel = (data) => PacienteSchema.parse(data);
