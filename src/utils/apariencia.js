const CLAVE_APARIENCIA = "configuracionApariencia";

const configuracionInicial = {
  tema: "automatico",
  tamano: "normal",
};

// OBTENER CONFIGURACIÓN GUARDADA
export const obtenerApariencia = () => {
  const configuracionGuardada = localStorage.getItem(CLAVE_APARIENCIA);

  if (!configuracionGuardada) {
    return configuracionInicial;
  }

  try {
    const configuracion = JSON.parse(configuracionGuardada);

    return {
      tema: configuracion.tema || configuracionInicial.tema,

      tamano: configuracion.tamano || configuracionInicial.tamano,
    };
  } catch {
    return configuracionInicial;
  }
};

// APLICAR CONFIGURACIÓN
export const aplicarApariencia = (configuracion = obtenerApariencia()) => {
  const html = document.documentElement;

  // QUITAR TEMAS ANTERIORES
  html.classList.remove("tema-claro", "tema-oscuro", "tema-automatico");

  // QUITAR TAMAÑOS ANTERIORES
  html.classList.remove("tamano-pequeno", "tamano-normal", "tamano-grande");

  // AGREGAR TEMA
  html.classList.add(`tema-${configuracion.tema}`);

  // AGREGAR TAMAÑO
  html.classList.add(`tamano-${configuracion.tamano}`);
};

// GUARDAR CONFIGURACIÓN
export const guardarApariencia = (configuracion) => {
  localStorage.setItem(CLAVE_APARIENCIA, JSON.stringify(configuracion));

  aplicarApariencia(configuracion);
};

// RESTAURAR CONFIGURACIÓN
export const restaurarApariencia = () => {
  localStorage.removeItem(CLAVE_APARIENCIA);

  aplicarApariencia(configuracionInicial);

  return configuracionInicial;
};
