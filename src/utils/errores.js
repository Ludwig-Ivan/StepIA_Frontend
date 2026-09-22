export const ejecutarServicio = async (operacion, mensajeError) => {
  try {
    return await operacion();
  } catch (error) {
    throw new Error(mensajeError, { cause: error });
  }
};
