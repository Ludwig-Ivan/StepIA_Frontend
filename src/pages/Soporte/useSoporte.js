import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CORREO_SOPORTE = "estefaniamoon6@gmail.com";
const NUMERO_SOPORTE = "13531018343";
const TAMANO_PAGINA_FAQ = 4;

const REPORTE_INICIAL = {
  tipo: "",
  pantalla: "",
  asunto: "",
  descripcion: "",
};

const PREGUNTAS = [
  {
    pregunta: "¿Cómo registro un paciente?",
    respuesta:
      "Desde el Panel Principal selecciona Nuevo Paciente. Captura los datos generales y presiona Siguiente para continuar con los datos médicos.",
  },
  {
    pregunta: "¿Cómo realizo un análisis plantar?",
    respuesta:
      "Desde el Panel Principal selecciona Nuevo Análisis y sigue el proceso correspondiente al paciente.",
  },
  {
    pregunta: "¿Cómo guardo un informe médico?",
    respuesta:
      "Dentro del informe del paciente completa la información requerida y presiona el botón Guardar.",
  },
  {
    pregunta: "¿Cómo programo una próxima consulta?",
    respuesta:
      "Dentro del informe del paciente selecciona la fecha y hora de la próxima consulta y guarda los cambios.",
  },
  {
    pregunta: "¿Dónde veo las próximas consultas?",
    respuesta:
      "Selecciona Agenda de Consultas en el menú superior. Los pacientes aparecerán marcados en el calendario según su fecha y hora.",
  },
  {
    pregunta: "¿Dónde veo el historial de actividades?",
    respuesta:
      "Selecciona Historial de Actividades en el menú superior para consultar las acciones realizadas dentro de StepAI.",
  },
  {
    pregunta: "¿Cómo cambio la apariencia?",
    respuesta:
      "Ve a Ajustes y entra al apartado Apariencia. Puedes seleccionar tema Claro, Oscuro o Automático.",
  },
  {
    pregunta: "¿Qué hago si aparece un error?",
    respuesta:
      "Puedes utilizar la opción Reportar un problema dentro de esta misma pantalla y enviar el reporte por correo o WhatsApp.",
  },
];

const convertirTexto = (valor) => `${valor || ""}`.toLowerCase().trim();

const leerApariencia = () => {
  try {
    const guardada = JSON.parse(
      localStorage.getItem("configuracionApariencia"),
    );

    return {
      tema: guardada?.tema || "automatico",
      tamano: guardada?.tamano || "normal",
    };
  } catch {
    return { tema: "automatico", tamano: "normal" };
  }
};

const guardarReporteEnLocal = (reporte) => {
  try {
    const guardados = JSON.parse(localStorage.getItem("reportesSoporte"));
    const reportes = Array.isArray(guardados) ? guardados : [];

    reportes.unshift({
      id: Date.now(),
      tipo: reporte.tipo,
      pantalla: reporte.pantalla,
      asunto: reporte.asunto,
      descripcion: reporte.descripcion,
      fecha: new Date().toLocaleDateString("es-MX"),
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      estado: "Pendiente",
    });

    localStorage.setItem("reportesSoporte", JSON.stringify(reportes));

    return true;
  } catch {
    return null;
  }
};

function useSoporte() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [paginaFaq, setPaginaFaq] = useState(0);
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const [apariencia, setApariencia] = useState({
    tema: "automatico",
    tamano: "normal",
  });

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [reporte, setReporte] = useState(REPORTE_INICIAL);
  const [errores, setErrores] = useState({});

  const [mensaje, setMensaje] = useState(null);

  const dialogRef = useRef(null);

  useEffect(() => {
    Promise.resolve().then(() => setApariencia(leerApariencia()));
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => setMensaje(null), 5000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  useEffect(() => {
    if (!mostrarReporte) return undefined;

    const overflowPrevio = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [mostrarReporte]);

  const preguntasFiltradas = useMemo(() => {
    const texto = convertirTexto(busqueda);

    if (texto === "") return PREGUNTAS;

    const incluye = (valor) => `${valor || ""}`.toLowerCase().includes(texto);

    return PREGUNTAS.filter(
      (item) => incluye(item.pregunta) || incluye(item.respuesta),
    );
  }, [busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(preguntasFiltradas.length / TAMANO_PAGINA_FAQ),
  );
  const paginaSegura = Math.min(paginaFaq, totalPaginas - 1);
  const preguntasPagina = preguntasFiltradas.slice(
    paginaSegura * TAMANO_PAGINA_FAQ,
    (paginaSegura + 1) * TAMANO_PAGINA_FAQ,
  );

  const irASeccion = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPaginaFaq(0);
    setPreguntaAbierta(null);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPaginaFaq(0);
    setPreguntaAbierta(null);
  };

  const irAPaginaFaq = (nuevaPagina) => {
    if (
      nuevaPagina === paginaSegura ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setPaginaFaq(nuevaPagina);
    setPreguntaAbierta(null);
  };

  const alternarPregunta = (pregunta) => {
    setPreguntaAbierta((actual) => (actual === pregunta ? null : pregunta));
  };

  const abrirReporte = () => {
    setReporte(REPORTE_INICIAL);
    setErrores({});
    setMensaje(null);
    setMostrarReporte(true);
  };

  const cerrarReporte = () => {
    setMostrarReporte(false);
    setReporte(REPORTE_INICIAL);
    setErrores({});
  };

  const cambiarReporte = (event) => {
    const { name, value } = event.target;

    setReporte((actual) => ({ ...actual, [name]: value }));

    setErrores((actual) => {
      if (!actual[name]) return actual;

      const copia = { ...actual };
      delete copia[name];

      return copia;
    });
  };

  const validarReporte = () => {
    const nuevos = {};

    if (!reporte.tipo) nuevos.tipo = "Selecciona el tipo de problema.";
    if (!reporte.pantalla) nuevos.pantalla = "Selecciona la pantalla.";
    if (!reporte.asunto.trim()) nuevos.asunto = "Escribe un asunto.";
    if (!reporte.descripcion.trim()) {
      nuevos.descripcion = "Describe el problema.";
    }

    return nuevos;
  };

  const prepararReporte = () => {
    const nuevos = validarReporte();

    if (Object.keys(nuevos).length > 0) {
      setErrores(nuevos);
      return false;
    }

    if (guardarReporteEnLocal(reporte) === null) {
      setErrores({
        general:
          "No se pudo guardar el reporte. Verifica el almacenamiento del navegador.",
      });
      return false;
    }

    setErrores({});
    return true;
  };

  const crearMensaje = () =>
    `
Hola, necesito soporte técnico con StepAI.

TIPO DE PROBLEMA:
${reporte.tipo}

PANTALLA DONDE OCURRIÓ:
${reporte.pantalla}

ASUNTO:
${reporte.asunto}

DESCRIPCIÓN:
${reporte.descripcion}

CONFIGURACIÓN DEL SISTEMA:

Tema:
${apariencia.tema}

Tamaño de interfaz:
${apariencia.tamano}

Fecha del reporte:
${new Date().toLocaleDateString("es-MX")}

Hora:
${new Date().toLocaleTimeString("es-MX")}
`;

  const guardarReporte = () => {
    if (!prepararReporte()) return;

    setMensaje({
      severidad: "success",
      texto: "Reporte guardado correctamente.",
    });
    cerrarReporte();
  };

  const enviarCorreo = () => {
    if (!prepararReporte()) return;

    const asunto = `Soporte StepAI - ${reporte.asunto}`;
    const enlace =
      `mailto:${CORREO_SOPORTE}` +
      `?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(crearMensaje())}`;

    setMensaje({
      severidad: "success",
      texto: "Reporte guardado. Se abrirá tu cliente de correo.",
    });
    cerrarReporte();
    window.location.href = enlace;
  };

  const enviarWhatsApp = () => {
    if (!prepararReporte()) return;

    const enlace =
      `https://wa.me/${NUMERO_SOPORTE}` +
      `?text=${encodeURIComponent(crearMensaje())}`;

    window.open(enlace, "_blank", "noopener,noreferrer");
    setMensaje({
      severidad: "success",
      texto: "Reporte guardado. Se abrió WhatsApp en una nueva pestaña.",
    });
    cerrarReporte();
  };

  const copiarInformacion = async () => {
    const texto = [
      "StepAI",
      "Versión: 1.0.0",
      "Estado: Funcionando",
      `Tema: ${apariencia.tema}`,
      `Tamaño: ${apariencia.tamano}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(texto);
      setMensaje({
        severidad: "success",
        texto: "Información del sistema copiada al portapapeles.",
      });
    } catch {
      setMensaje({
        severidad: "error",
        texto: "No se pudo copiar la información del sistema.",
      });
    }
  };

  return {
    navigate,
    busqueda,
    preguntaAbierta,
    apariencia,
    mostrarReporte,
    reporte,
    errores,
    mensaje,
    dialogRef,
    preguntasFiltradas,
    totalPaginas,
    paginaSegura,
    preguntasPagina,
    irASeccion,
    cambiarBusqueda,
    limpiarBusqueda,
    irAPaginaFaq,
    alternarPregunta,
    abrirReporte,
    cerrarReporte,
    cambiarReporte,
    guardarReporte,
    enviarCorreo,
    enviarWhatsApp,
    copiarInformacion,
  };
}

export default useSoporte;
