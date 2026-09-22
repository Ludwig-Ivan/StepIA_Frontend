import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registrarActividad } from "../../utils/historial";
import { convertirABase64 } from "../../utils/archivos.js";
import { registrarAnalisisConDocumentos } from "../../utils/analisis.js";
import {
  getPacienteById,
  getPacientes,
} from "../../services/pacienteService.js";
import { createPredict } from "../../services/predictService.js";
import { PredictModel } from "../../models/analisis/PredictModel.js";
import { createInforme } from "../../services/informeService.js";
import { InformeCreateUpdateModel } from "../../models/informes/InformeCreateUpdateModel.js";

const TAMANO_PACIENTES = 5;

const idPacienteDe = (paciente) =>
  paciente?.curp || paciente?.idPaciente || "";

const construirResultadoIA = (izquierdo, derecho) => {
  const formatear = (predict, etiqueta) => {
    const tipo = predict?.className || "";
    const confianza = predict?.confidence;
    const detalle =
      confianza !== undefined && confianza !== null
        ? ` (${confianza}%)`
        : "";
    return `${etiqueta}: ${tipo}${detalle}`;
  };

  return [
    formatear(izquierdo, "Pie izquierdo"),
    formatear(derecho, "Pie derecho"),
  ].join("\n");
};

function useAnalisisPlantar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pacientes, setPacientes] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [pieIzquierdo, setPieIzquierdo] = useState(null);
  const [pieDerecho, setPieDerecho] = useState(null);

  const [previewIzquierdo, setPreviewIzquierdo] = useState("");
  const [previewDerecho, setPreviewDerecho] = useState("");

  const [analisisIzquierdo, setAnalisisIzquierdo] = useState(() =>
    PredictModel(),
  );
  const [analisisDerecho, setAnalisisDerecho] = useState(() => PredictModel());

  const [resultadoIA, setResultadoIA] = useState("");
  const [tipoPie, setTipoPie] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const hayPacientes = totalElementos > 0;

  useEffect(() => {
    let activo = true;

    const temporizador = setTimeout(
      () => {
        getPacientes(busqueda, pagina, TAMANO_PACIENTES)
          .then((data) => {
            if (!activo) return;

            setPacientes(data.content || []);
            setTotalPaginas(data.totalPages || 1);
            setTotalElementos(data.totalElements ?? 0);

            const paginaSegura = Math.max(
              0,
              Math.min(pagina, (data.totalPages || 1) - 1),
            );

            if (paginaSegura !== pagina) {
              setPagina(paginaSegura);
            }
          })
          .catch(() => {
            if (!activo) return;

            setPacientes([]);
            setTotalPaginas(1);
            setTotalElementos(0);
            setPagina(0);
            setMensaje({
              texto:
                "No se pudo cargar la lista de pacientes. Verifica tu conexión e inténtalo de nuevo.",
              severidad: "error",
            });
          })
          .finally(() => {
            if (activo) setCargandoPacientes(false);
          });
      },
      busqueda ? 300 : 0,
    );

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [busqueda, pagina]);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => setMensaje(null), 5000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const seleccionarPaciente = useCallback(
    async (idPaciente) => {
      if (!idPaciente) {
        setPacienteSeleccionado(null);
        return;
      }

      const enPagina = pacientes.find(
        (paciente) => idPacienteDe(paciente) === idPaciente,
      );

      if (enPagina) {
        setPacienteSeleccionado(enPagina);
        return;
      }

      try {
        const paciente = await getPacienteById(idPaciente);
        setPacienteSeleccionado(paciente);
      } catch {
        setPacienteSeleccionado(null);
        setMensaje({
          texto:
            "No se encontró al paciente. Regístralo antes de continuar.",
          severidad: "error",
        });
      }
    },
    [pacientes],
  );

  useEffect(() => {
    const curp = searchParams.get("paciente");

    if (!curp) {
      return undefined;
    }

    let activo = true;

    getPacienteById(curp)
      .then((paciente) => {
        if (activo) setPacienteSeleccionado(paciente);
      })
      .catch(() => {
        if (activo) {
          setPacienteSeleccionado(null);
          setMensaje({
            texto:
              "No se encontró al paciente. Regístralo antes de continuar.",
            severidad: "error",
          });
        }
      });

    return () => {
      activo = false;
    };
  }, [searchParams]);

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(0);
    setPacienteSeleccionado(null);
    setCargandoPacientes(true);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPagina(0);
    setPacienteSeleccionado(null);
    setCargandoPacientes(true);
  };

  const irAPagina = (nuevaPagina) => {
    if (
      cargandoPacientes ||
      nuevaPagina === pagina ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setPagina(nuevaPagina);
    setCargandoPacientes(true);
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

  const analizarPies = async () => {
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

    try {
      const [derecho, izquierdo] = await Promise.all([
        createPredict(pieDerecho),
        createPredict(pieIzquierdo),
      ]);

      setAnalisisIzquierdo(izquierdo);
      setAnalisisDerecho(derecho);
      setResultadoIA(construirResultadoIA(izquierdo, derecho));
      setTipoPie(
        `Izquierdo: ${izquierdo.className} • Derecho: ${derecho.className}`,
      );

      setCargando(false);
      setMensaje({
        texto: "Análisis completado. Revisa el resultado antes de guardar.",
        severidad: "success",
      });
    } catch (error) {
      setCargando(false);
      setMensaje({
        texto:
          error?.message ||
          "No se pudo analizar con IA. Verifica tu conexión e inténtalo de nuevo.",
        severidad: "error",
      });
    }
  };

  const guardarAnalisis = async () => {
    if (guardando) return;

    if (!pacienteSeleccionado) {
      setMensaje({ texto: "Selecciona un paciente.", severidad: "error" });
      return;
    }

    if (!previewIzquierdo || !previewDerecho) {
      setMensaje({ texto: "Carga ambas imágenes.", severidad: "error" });
      return;
    }

    if (!analisisIzquierdo.className || !analisisDerecho.className) {
      setMensaje({ texto: "Primero presiona Analizar.", severidad: "error" });
      return;
    }

    setGuardando(true);

    const idPaciente = idPacienteDe(pacienteSeleccionado);
    const idProfesional = Number(localStorage.getItem("idProfesional"));

    localStorage.setItem("idPaciente", idPaciente);

    try {
      const { idInforme } = await createInforme(
        InformeCreateUpdateModel({
          idPaciente,
          idProfesional,
          estadoGeneral: "",
          pesoKg: null,
          sintomas: "",
          descripcion: resultadoIA,
          diagnostico: `Con base en el análisis plantar realizado por IA, el paciente presenta: ${tipoPie}.`,
          tratamiento: "",
          evolucion: "",
          observaciones: resultadoIA,
        }),
      );

      await registrarAnalisisConDocumentos({
        idInforme,
        idPaciente,
        idProfesional,
        pieType: "DERECHA",
        analisis: analisisDerecho,
        file: pieDerecho,
      });

      await registrarAnalisisConDocumentos({
        idInforme,
        idPaciente,
        idProfesional,
        pieType: "IZQUIERDA",
        analisis: analisisIzquierdo,
        file: pieIzquierdo,
      });

      registrarActividad({
        tipo: "Análisis plantar",
        descripcion: "Se creó un análisis plantar y su informe",
        paciente:
          pacienteSeleccionado.nombre ||
          `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellidoPaterno}`,
        detalles: `Tipo de pie: ${tipoPie}`,
      });

      setGuardando(false);
      setMensaje({
        texto: "Análisis e informe guardados correctamente.",
        severidad: "success",
      });

      setTimeout(() => navigate("/informe-paciente"), 900);
    } catch (error) {
      setGuardando(false);
      setMensaje({
        texto:
          error?.message ||
          "No se pudo guardar el análisis. Verifica tu conexión e inténtalo de nuevo.",
        severidad: "error",
      });
    }
  };

  return {
    navigate,
    pacientes,
    cargandoPacientes,
    busqueda,
    paginaSegura: pagina,
    hayPacientes,
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
    pacientesPagina: pacientes,
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