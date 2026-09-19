import { z } from "zod";

const ProfesionalSchema = z.object({
  idProfesional: z.coerce.number().int().nonnegative().optional(),
  especialidad: z.string().max(150),
  nombre: z.string().max(100),
  apellidoPaterno: z.string().max(100).trim(),
  apellidoMaterno: z.string().max(100).trim(),
  cedulaProfesional: z.string().max(20),
  institucion: z.string().max(200),
  telefono: z.string().max(20),
  email: z.email().max(100),
  activo: z.boolean().optional(),
});

export const ProfesionalModel = (data) => ProfesionalSchema.parse(data);
