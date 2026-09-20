import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Soporte.css";
import { FaUserAlt } from "react-icons/fa";
import {
  FaBookOpen,
  FaChevronLeft,
  FaChevronRight,
  FaCircleInfo,
  FaCircleQuestion,
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";

const CORREO_SOPORTE = "estefaniamoon6@gmail.com";

const NUMERO_SOPORTE = "13531018343";

const TAMANO_PAGINA_FAQ = 4;

const REPORTE_INICIAL = {
  tipo: "",
  pantalla: "",
  asunto: "",
  descripcion: "",
};

const TIPOS_PROBLEMA = [
  "Error del sistema",
  "Problema de visualización",
  "Problema con pacientes",
  "Problema con análisis",
  "Problema con informes",
  "Problema con agenda",
  "Otro",
];

const PANTALLAS = [
  "Panel Principal",
  "Registro Paciente",
  "Datos Médicos",
  "Análisis Plantar",
  "Informe Paciente",
  "Agenda",
  "Historial",
  "Ajustes",
  "Otra",
];

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

const PASOS_GUIA = [
  {
    titulo: "Registrar paciente",
    descripcion: "Captura los datos generales del paciente.",
    ruta: "/registro-paciente",
    etiquetaAccion: "Ir",
  },
  {
    titulo: "Datos médicos",
    descripcion: "Completa la información médica.",
  },
  {
    titulo: "Análisis plantar",
    descripcion: "Realiza un nuevo análisis.",
    ruta: "/analisis-plantar",
    etiquetaAccion: "Ir",
  },
  {
    titulo: "Informe médico",
    descripcion: "Guarda diagnóstico, tratamiento y observaciones.",
  },
  {
    titulo: "Agenda",
    descripcion: "Consulta las próximas citas programadas.",
    ruta: "/agenda-consultas",
    etiquetaAccion: "Agenda",
  },
  {
    titulo: "Historial",
    descripcion: "Consulta las actividades realizadas.",
    ruta: "/historial",
    etiquetaAccion: "Historial",
  },
];

const convertirTexto = (valor) => `${valor || ""}`.toLowerCase().trim();

const crearPaginas = (paginaActual, total) => {
  const paginas = [];
  const incluidas = new Set();

  const incluir = (valor) => {
    if (valor < 0 || valor > total - 1 || incluidas.has(valor)) return;

    const ultima = paginas[paginas.length - 1];

    if (ultima && valor - ultima.valor > 1) {
      paginas.push({ valor: null, elipsis: true });
    }

    incluidas.add(valor);
    paginas.push({ valor, elipsis: false });
  };

  incluir(0);
  if (total > 3) {
    incluir(paginaActual - 1);
    incluir(paginaActual);
    incluir(paginaActual + 1);
  }
  incluir(total - 1);

  return paginas;
};

const leerApariencia = () => {
  try {
    const guardada = JSON.parse(localStorage.getItem("configuracionApariencia"));

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

function HeaderSoporte({ onMenu }) {
  return (
    <header className="soporte-header">
      <button type="button" className="soporte-logo" onClick={onMenu}>
        StepIA
      </button>

      <div className="soporte-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="soporte-user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

function TarjetaSoporte({ icono, titulo, descripcion, etiquetaAccion, onAccion }) {
  return (
    <article className="soporte-card">
      <span className="soporte-card-icono" aria-hidden="true">
        {icono}
      </span>

      <h3>{titulo}</h3>

      <p>{descripcion}</p>

      <ButtonComponent
        config={{
          name: `accion-${titulo}`,
          text: etiquetaAccion,
          type: "button",
          variant: "green",
        }}
        onClick={onAccion}
      />
    </article>
  );
}

function AcordeonPreguntas({ preguntas, abierta, onAlternar }) {
  return (
    <div className="faq-lista">
      {preguntas.map((item, indice) => {
        const abierto = abierta === item.pregunta;
        const idBoton = `faq-pregunta-${indice}`;
        const idRespuesta = `faq-respuesta-${indice}`;

        return (
          <div className="faq-item" key={item.pregunta}>
            <button
              type="button"
              id={idBoton}
              className="faq-pregunta"
              aria-expanded={abierto}
              aria-controls={idRespuesta}
              onClick={() => onAlternar(item.pregunta)}
            >
              <span>{item.pregunta}</span>

              <span className="faq-icono" aria-hidden="true">
                {abierto ? <FaMinus /> : <FaPlus />}
              </span>
            </button>

            <Collapse in={abierto} timeout={220}>
              <div
                id={idRespuesta}
                className="faq-respuesta"
                role="region"
                aria-labelledby={idBoton}
              >
                {item.respuesta}
              </div>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
}

function PaginacionFaq({ pagina, totalPaginas, onIrAPagina }) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="faq-paginacion" aria-label="Paginación de preguntas frecuentes">
      <button
        type="button"
        className="faq-pagina-boton"
        aria-label="Página anterior"
        onClick={() => onIrAPagina(pagina - 1)}
        disabled={pagina <= 0}
      >
        <FaChevronLeft aria-hidden="true" />
      </button>

      {crearPaginas(pagina, totalPaginas).map((item, indice) =>
        item.elipsis ? (
          <span
            key={`elipsis-${indice}`}
            className="faq-pagina-elipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item.valor}
            type="button"
            className={`faq-pagina-boton${item.valor === pagina ? " faq-pagina-boton--activa" : ""}`}
            aria-label={`Página ${item.valor + 1}`}
            aria-current={item.valor === pagina ? "page" : undefined}
            onClick={() => onIrAPagina(item.valor)}
          >
            {item.valor + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className="faq-pagina-boton"
        aria-label="Página siguiente"
        onClick={() => onIrAPagina(pagina + 1)}
        disabled={pagina >= totalPaginas - 1}
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

function InformacionSistema({ apariencia, onCopiar }) {
  return (
    <>
      <div className="sistema-info">
        <div className="sistema-fila">
          <span>Aplicación</span>
          <strong>StepAI</strong>
        </div>

        <div className="sistema-fila">
          <span>Versión</span>
          <strong>1.0.0</strong>
        </div>

        <div className="sistema-fila">
          <span>Estado</span>
          <strong className="sistema-activo">Funcionando</strong>
        </div>

        <div className="sistema-fila">
          <span>Tema</span>
          <strong>{apariencia.tema}</strong>
        </div>

        <div className="sistema-fila">
          <span>Tamaño</span>
          <strong>{apariencia.tamano}</strong>
        </div>
      </div>

      <div className="sistema-acciones">
        <ButtonComponent
          config={{
            name: "copiar-info",
            text: "Copiar información",
            type: "button",
            variant: "blue",
          }}
          onClick={onCopiar}
        />
      </div>
    </>
  );
}

function ModalReporte({
  abierto,
  reporte,
  errores,
  onCambio,
  onCerrar,
  onGuardar,
  onCorreo,
  onWhatsApp,
  dialogRef,
}) {
  const hayErrores = Object.keys(errores).length > 0;

  useEffect(() => {
    const dialogo = dialogRef.current;

    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      dialogo.showModal();
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto, dialogRef]);

  return (
    <dialog
      className="soporte-modal"
      aria-labelledby="reporte-titulo"
      aria-describedby="reporte-intro"
      ref={dialogRef}
      onClose={onCerrar}
    >
      <div className="soporte-modal-contenido">
        <div className="soporte-modal-header">
          <div>
            <h2 id="reporte-titulo">Reportar un problema</h2>
            <p id="reporte-intro">Describe el problema encontrado.</p>
          </div>

          <button
            type="button"
            className="soporte-modal-cerrar"
            aria-label="Cerrar reporte"
            onClick={onCerrar}
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <div className="soporte-privacidad" role="note">
          <FaTriangleExclamation aria-hidden="true" />
          <span>
            No incluyas información médica, diagnósticos ni datos sensibles de
            pacientes.
          </span>
        </div>

        <div className="soporte-form">
          <Collapse in={hayErrores}>
            <Alert
              variant="filled"
              severity="error"
              sx={{ fontWeight: 600, borderRadius: 1.5, marginBottom: "16px" }}
            >
              {errores.general ||
                "Revisa los campos marcados antes de continuar."}
            </Alert>
          </Collapse>

          <div className="soporte-form-group">
            <label htmlFor="reporte-tipo">Tipo de problema</label>

            <select
              id="reporte-tipo"
              name="tipo"
              value={reporte.tipo}
              onChange={onCambio}
              aria-invalid={Boolean(errores.tipo) || undefined}
              aria-describedby={errores.tipo ? "error-tipo" : undefined}
            >
              <option value="">Seleccionar...</option>

              {TIPOS_PROBLEMA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            {errores.tipo && (
              <span className="soporte-error" id="error-tipo">
                {errores.tipo}
              </span>
            )}
          </div>

          <div className="soporte-form-group">
            <label htmlFor="reporte-pantalla">Pantalla donde ocurrió</label>

            <select
              id="reporte-pantalla"
              name="pantalla"
              value={reporte.pantalla}
              onChange={onCambio}
              aria-invalid={Boolean(errores.pantalla) || undefined}
              aria-describedby={errores.pantalla ? "error-pantalla" : undefined}
            >
              <option value="">Seleccionar...</option>

              {PANTALLAS.map((pantalla) => (
                <option key={pantalla} value={pantalla}>
                  {pantalla}
                </option>
              ))}
            </select>

            {errores.pantalla && (
              <span className="soporte-error" id="error-pantalla">
                {errores.pantalla}
              </span>
            )}
          </div>

          <div className="soporte-form-group">
            <label htmlFor="reporte-asunto">Asunto</label>

            <input
              id="reporte-asunto"
              type="text"
              name="asunto"
              maxLength={120}
              placeholder="Ejemplo: No aparece la cita"
              value={reporte.asunto}
              onChange={onCambio}
              aria-invalid={Boolean(errores.asunto) || undefined}
              aria-describedby={errores.asunto ? "error-asunto" : undefined}
            />

            {errores.asunto && (
              <span className="soporte-error" id="error-asunto">
                {errores.asunto}
              </span>
            )}
          </div>

          <div className="soporte-form-group">
            <label htmlFor="reporte-descripcion">Describe el problema</label>

            <textarea
              id="reporte-descripcion"
              name="descripcion"
              rows="6"
              maxLength={800}
              placeholder="Describe qué estabas haciendo y qué problema apareció..."
              value={reporte.descripcion}
              onChange={onCambio}
              aria-invalid={Boolean(errores.descripcion) || undefined}
              aria-describedby={
                errores.descripcion ? "error-descripcion" : undefined
              }
            />

            {errores.descripcion && (
              <span className="soporte-error" id="error-descripcion">
                {errores.descripcion}
              </span>
            )}
          </div>
        </div>

        <div className="soporte-modal-footer">
          <ButtonComponent
            config={{
              name: "cancelar",
              text: "Cancelar",
              type: "button",
              variant: "white",
            }}
            onClick={onCerrar}
          />

          <ButtonComponent
            config={{
              name: "guardar",
              text: "Guardar",
              type: "button",
              variant: "blue",
            }}
            onClick={onGuardar}
          />

          <ButtonComponent
            config={{
              name: "whatsapp",
              text: "WhatsApp",
              type: "button",
              variant: "green",
            }}
            onClick={onWhatsApp}
          />

          <ButtonComponent
            config={{
              name: "correo",
              text: "Correo",
              type: "button",
              variant: "purple",
            }}
            onClick={onCorreo}
          />
        </div>
      </div>
    </dialog>
  );
}

function Soporte() {
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const hayBusqueda = busqueda.trim() !== "";
  const esError = mensaje?.severidad === "error";

  return (
    <div className="soporte-page">
      <HeaderSoporte onMenu={() => navigate("/menu")} />

      <main className="soporte-main">
        <div className="soporte-titulo">
          <h1>Soporte Técnico</h1>
          <p>Encuentra ayuda, consulta la guía de uso o reporta un problema.</p>
        </div>

        <Collapse in={Boolean(mensaje)}>
          <div
            className="soporte-mensaje"
            role={esError ? "alert" : "status"}
            aria-live="polite"
          >
            <Alert
              variant="filled"
              severity={mensaje?.severidad || "info"}
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            >
              {mensaje?.texto}
            </Alert>
          </div>
        </Collapse>

        <search className="soporte-buscador">
          <label className="sr-only" htmlFor="soporte-busqueda">
            Buscar en preguntas frecuentes
          </label>

          <FaMagnifyingGlass
            className="soporte-buscador-icono"
            aria-hidden="true"
          />

          <input
            id="soporte-busqueda"
            type="search"
            placeholder="Buscar una pregunta o problema..."
            value={busqueda}
            onChange={(event) => cambiarBusqueda(event.target.value)}
          />

          {hayBusqueda && (
            <button
              type="button"
              className="soporte-clear"
              aria-label="Limpiar búsqueda"
              onClick={limpiarBusqueda}
            >
              <FaXmark aria-hidden="true" />
            </button>
          )}
        </search>

        <section className="soporte-grid" aria-label="Opciones de soporte">
          <TarjetaSoporte
            icono={<FaCircleQuestion />}
            titulo="Preguntas frecuentes"
            descripcion="Encuentra respuestas rápidas sobre el funcionamiento de StepAI."
            etiquetaAccion="Ver preguntas"
            onAccion={() => irASeccion("preguntas-frecuentes")}
          />

          <TarjetaSoporte
            icono={<FaBookOpen />}
            titulo="Guía de uso"
            descripcion="Aprende a utilizar las principales funciones de StepAI."
            etiquetaAccion="Ver guía"
            onAccion={() => irASeccion("guia-uso")}
          />

          <TarjetaSoporte
            icono={<FaTriangleExclamation />}
            titulo="Reportar un problema"
            descripcion="Envía un reporte directamente por correo o WhatsApp."
            etiquetaAccion="Reportar problema"
            onAccion={abrirReporte}
          />

          <TarjetaSoporte
            icono={<FaCircleInfo />}
            titulo="Información del sistema"
            descripcion="Consulta información útil para identificar problemas."
            etiquetaAccion="Ver información"
            onAccion={() => irASeccion("informacion-sistema")}
          />
        </section>

        <section
          id="preguntas-frecuentes"
          className="soporte-seccion"
          aria-labelledby="faq-titulo"
        >
          <div className="soporte-seccion-titulo">
            <h2 id="faq-titulo">Preguntas frecuentes</h2>

            <p>Selecciona una pregunta para ver su respuesta.</p>

            {hayBusqueda && (
              <span className="soporte-resultado" role="status" aria-live="polite">
                {preguntasFiltradas.length === 0
                  ? "Sin resultados"
                  : `${preguntasFiltradas.length} ${
                      preguntasFiltradas.length === 1
                        ? "pregunta encontrada"
                        : "preguntas encontradas"
                    }`}
              </span>
            )}
          </div>

          {preguntasFiltradas.length === 0 ? (
            <div className="faq-vacio" role="status" aria-live="polite">
              <FaCircleQuestion className="faq-vacio-icono" aria-hidden="true" />

              <h3>Sin resultados</h3>

              <p>No se encontraron preguntas con esa búsqueda.</p>

              <ButtonComponent
                config={{
                  name: "limpiar-busqueda-faq",
                  text: "Limpiar búsqueda",
                  type: "button",
                  variant: "blue",
                }}
                onClick={limpiarBusqueda}
              />
            </div>
          ) : (
            <>
              <AcordeonPreguntas
                preguntas={preguntasPagina}
                abierta={preguntaAbierta}
                onAlternar={alternarPregunta}
              />

              <PaginacionFaq
                pagina={paginaSegura}
                totalPaginas={totalPaginas}
                onIrAPagina={irAPaginaFaq}
              />
            </>
          )}
        </section>

        <section
          id="guia-uso"
          className="soporte-seccion"
          aria-labelledby="guia-titulo"
        >
          <div className="soporte-seccion-titulo">
            <h2 id="guia-titulo">Guía de uso</h2>
            <p>Flujo principal del sistema.</p>
          </div>

          <ol className="guia-lista">
            {PASOS_GUIA.map((paso, indice) => (
              <li className="guia-paso" key={paso.titulo}>
                <div className="guia-numero" aria-hidden="true">
                  {indice + 1}
                </div>

                <div className="guia-texto">
                  <h3>{paso.titulo}</h3>
                  <p>{paso.descripcion}</p>
                </div>

                {paso.ruta && (
                  <ButtonComponent
                    config={{
                      name: `guia-${indice + 1}`,
                      text: paso.etiquetaAccion,
                      type: "button",
                      variant: "green",
                    }}
                    onClick={() => navigate(paso.ruta)}
                  />
                )}
              </li>
            ))}
          </ol>
        </section>

        <section
          id="informacion-sistema"
          className="soporte-seccion"
          aria-labelledby="sistema-titulo"
        >
          <div className="soporte-seccion-titulo">
            <h2 id="sistema-titulo">Información del sistema</h2>
            <p>Información útil para soporte.</p>
          </div>

          <InformacionSistema
            apariencia={apariencia}
            onCopiar={copiarInformacion}
          />
        </section>
      </main>

      <ModalReporte
        abierto={mostrarReporte}
        reporte={reporte}
        errores={errores}
        onCambio={cambiarReporte}
        onCerrar={cerrarReporte}
        onGuardar={guardarReporte}
        onCorreo={enviarCorreo}
        onWhatsApp={enviarWhatsApp}
        dialogRef={dialogRef}
      />
    </div>
  );
}

export default Soporte;
