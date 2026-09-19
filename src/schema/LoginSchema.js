import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(64, "La contraseña no puede superar los 64 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial"),
});

export default loginSchema;
