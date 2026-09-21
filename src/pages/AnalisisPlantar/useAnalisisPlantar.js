import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarActividad } from "../../utils/historial";
import { convertirABase64 } from "../../utils/archivos.js";

const TAMANO_PACIENTES = 5;

const convertirTexto = (valor) => {
  return String(valor || "")
    .toLowerCase()
    .trim();
};

const generarIdPaciente = (pacienteData = {}, index = 0) => {
  const base =
    pacienteData.idPaciente ||
    `${
      pacienteData.nss ||
      pacienteData.numeroRegistroSocial ||
      pacienteData.nombre ||
      "paciente"
    }-${pacienteData.fecha || ""}-${pacienteData.hora || ""}-${index}`;

  return String(base)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

const leerPacientesLocal = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem("pacientes"));
    return Array.isArray(guardados) ? guardados : [];
  } catch {
    return [];
  }
};

const normalizarPacientes = (lista) => {
  return lista.map((paciente, index) => {
    const nssFinal =
      paciente.nss ||
      paciente.numeroRegistroSocial ||
      paciente.registroSocial ||
      "";

    return {
      ...paciente,
      nss: nssFinal,
      idPaciente: generarIdPaciente({ ...paciente, nss: nssFinal }, index),
    };
  });
};

function useAnalisisPlantar() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [pieIzquierdo, setPieIzquierdo] = useState(null);
  const [pieDerecho, setPieDerecho] = useState(null);

  const [previewIzquierdo, setPreviewIzquierdo] = useState("");
  const [previewDerecho, setPreviewDerecho] = useState("");

  const [resultadoIA, setResultadoIA] = useState("");
  const [tipoPie, setTipoPie] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const pacientesGuardados = leerPacientesLocal();
      const pacientesConId = normalizarPacientes(pacientesGuardados);

      localStorage.setItem("pacientes", JSON.stringify(pacientesConId));

      setPacientes(pacientesConId);
      setCargandoPacientes(false);
    });
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => setMensaje(null), 5000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const texto = convertirTexto(busqueda);

    if (texto === "") return true;

    const incluye = (valor) =>
      `${valor || ""}`.toLowerCase().trim().includes(texto);

    return (
      incluye(paciente.nombre) ||
      incluye(paciente.nss) ||
      incluye(paciente.numeroRegistroSocial) ||
      incluye(paciente.registroSocial) ||
      incluye(paciente.fecha) ||
      incluye(paciente.hora) ||
      incluye(paciente.analisis)
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(pacientesFiltrados.length / TAMANO_PACIENTES),
  );
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const pacientesPagina = pacientesFiltrados.slice(
    paginaSegura * TAMANO_PACIENTES,
    (paginaSegura + 1) * TAMANO_PACIENTES,
  );

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(0);
    setPacienteSeleccionado(null);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPagina(0);
    setPacienteSeleccionado(null);
  };

  const irAPagina = (nuevaPagina) => {
    if (
      cargandoPacientes ||
      nuevaPagina === paginaSegura ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setPagina(nuevaPagina);
  };

  const seleccionarPaciente = (idPaciente) => {
    const paciente = pacientes.find((p) => p.idPaciente === idPaciente);

    setPacienteSeleccionado(paciente || null);
  };

  const cargarImagen = async (e, tipo) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setMensaje({
        texto: "Solo se permiten imágenes. Selecciona un archivo de imagen.",
        severidad: "error",
      });
      e.target.value = "";
      return;
    }

    try {
      const imagenBase64 = await convertirABase64(archivo);

      if (tipo === "izquierdo") {
        setPieIzquierdo(archivo);
        setPreviewIzquierdo(imagenBase64);
      } else {
        setPieDerecho(archivo);
        setPreviewDerecho(imagenBase64);
      }
    } catch {
      setMensaje({
        texto: "Error al cargar la imagen. Inténtalo de nuevo.",
        severidad: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  const analizarPies = () => {
    if (!pacienteSeleccionado) {
      setMensaje({ texto: "Selecciona un paciente.", severidad: "error" });
      return;
    }

    if (!pieIzquierdo || !pieDerecho) {
      setMensaje({
        texto: "Debes cargar ambas imágenes de los pies.",
        severidad: "error",
      });
      return;
    }

    setMensaje(null);
    setCargando(true);

    setTimeout(() => {
      setResultadoIA(
        "Análisis generado por el modelo IA pendiente de conexión.",
      );

      setTipoPie("Tipo de pie pendiente");

      setCargando(false);

      setMensaje({
        texto: "Análisis completado. Revisa el resultado antes de guardar.",
        severidad: "success",
      });
    }, 1200);
  };

  const guardarAnalisis = () => {
    if (guardando) return;

    if (!pacienteSeleccionado) {
      setMensaje({ texto: "Selecciona un paciente.", severidad: "error" });
      return;
    }

    if (!previewIzquierdo || !previewDerecho) {
      setMensaje({ texto: "Carga ambas imágenes.", severidad: "error" });
      return;
    }

    if (resultadoIA.trim() === "" || tipoPie.trim() === "") {
      setMensaje({ texto: "Primero presiona Analizar.", severidad: "error" });
      return;
    }

    setGuardando(true);

    const pacienteActualizado = {
      ...pacienteSeleccionado,
      resultadoIA: resultadoIA,
      tipoPie: tipoPie,
      imagenPieIzquierdo: previewIzquierdo,
      imagenPieDerecho: previewDerecho,
      fechaAnalisis: new Date().toLocaleDateString(),
      analisis: pacienteSeleccionado.analisis || "A01",
      diagnostico:
        pacienteSeleccionado.diagnostico ||
        `Con base en el análisis plantar realizado por IA, el paciente presenta: ${tipoPie}. ${resultadoIA}`,
      ultimaModificacion: new Date().toLocaleString(),
    };

    const pacientesActualizados = pacientes.map((paciente) => {
      if (paciente.idPaciente === pacienteSeleccionado.idPaciente) {
        return pacienteActualizado;
      }

      return paciente;
    });

    localStorage.setItem("pacientes", JSON.stringify(pacientesActualizados));

    localStorage.setItem(
      "pacienteSeleccionado",
      JSON.stringify(pacienteActualizado),
    );

    registrarActividad({
      tipo: "Análisis plantar",
      descripcion: "Se realizó un análisis plantar",
      paciente: pacienteSeleccionado.nombre || "Paciente",
      detalles: resultadoIA || "Análisis realizado correctamente",
    });

    setPacientes(pacientesActualizados);
    setPacienteSeleccionado(pacienteActualizado);

    setMensaje({
      texto: "Análisis guardado en el informe del paciente.",
      severidad: "success",
    });

    setTimeout(() => navigate("/informe-paciente"), 900);
  };

  return {
    navigate,
    pacientes,
    cargandoPacientes,
    busqueda,
    paginaSegura,
    pacienteSeleccionado,
    pieIzquierdo,
    pieDerecho,
    previewIzquierdo,
    previewDerecho,
    resultadoIA,
    tipoPie,
    cargando,
    guardando,
    mensaje,
    totalPaginas,
    pacientesPagina,
    cambiarBusqueda,
    limpiarBusqueda,
    irAPagina,
    seleccionarPaciente,
    cargarImagen,
    analizarPies,
    guardarAnalisis,
  };
}

export default useAnalisisPlantar;
