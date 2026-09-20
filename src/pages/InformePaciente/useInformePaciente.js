import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { registrarActividad } from "../../utils/historial";
import { AnalisisCreateModel } from "../../models/analisis/AnalisisCreateModel.js";
import { createAnalisis } from "../../services/analisisService.js";
import { createPredict } from "../../services/predictService.js";
import { PredictModel } from "../../models/analisis/PredictModel.js";
import { getPacienteById } from "../../services/pacienteService.js";
import { estudio } from "../../models/estudios/estudio.js";
import { createInforme } from "../../services/informeService.js";
import {
  CompleteUpload,
  GenerateUploadUrl,
  UploadFile,
} from "../../services/documentCloudService.js";
import { createDocumento } from "../../services/documentService.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InformeCreateUpdateModel } from "../../models/informes/InformeCreateUpdateModel.js";

const tiposArchivoEstudio = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const tamanoMaximoEstudio = 5 * 1024 * 1024;
const FECHA_INICIO_MODULO = Date.now();

export const PIES = [
  {
    key: "pieIzquierdo",
    tipo: "izquierdo",
    etiqueta: "Pie Izquierdo",
    alt: "Pie izquierdo",
  },
  {
    key: "pieDerecho",
    tipo: "derecho",
    etiqueta: "Pie Derecho",
    alt: "Pie derecho",
  },
];

const informeFormSchema = z.object({
  nombre: z.string().max(100, "Máximo 100 caracteres"),
  peso: z
    .coerce
    .number()
    .min(0, "El peso no puede ser negativo")
    .max(500, "El peso está fuera del rango permitido"),
  estadoGeneral: z.string().max(1000, "Máximo 1000 caracteres"),
  observaciones: z.string().max(1000, "Máximo 1000 caracteres"),
  diagnostico: z.string().max(1000, "Máximo 1000 caracteres"),
  sintomas: z.string().max(1000, "Máximo 1000 caracteres"),
  tratamiento: z.string().max(1000, "Máximo 1000 caracteres"),
  evolucion: z.string().max(1000, "Máximo 1000 caracteres"),
  proximaFechaConsulta: z.string().max(10),
  proximaHoraConsulta: z.string().max(5),
  pieDerecho: z.any().optional(),
  pieIzquierdo: z.any().optional(),
});

function useInformePaciente() {
  const navigate = useNavigate();
  const informeRef = useRef(null);
  const timeoutMensaje = useRef(null);
  const idProfesional = localStorage.getItem("idProfesional");
  const idPaciente = localStorage.getItem("idPaciente");

  const [paciente, setPaciente] = useState(null);
  const [analisisPieIzq, setAnalisisPieIzq] = useState(() => PredictModel());
  const [analisisPieDer, setAnalisisPieDer] = useState(() => PredictModel());
  const [imgPieIzq64, setImgPieIzq64] = useState();
  const [imgPieDer64, setImgPieDer64] = useState();
  const [estudios, setEstudios] = useState([]);
  const archivosPieRef = useRef({ izquierdo: null, derecho: null });
  const [cargando, setCargando] = useState(false);
  const [carga, setCarga] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajeIA, setMensajeIA] = useState("");
  const [mensajeEstudios, setMensajeEstudios] = useState(null);
  const [confirmaEliminarId, setConfirmaEliminarId] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(informeFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      nombre: "",
      peso: 0,
      estadoGeneral: "",
      observaciones: "",
      diagnostico: "",
      sintomas: "",
      tratamiento: "",
      evolucion: "",
      proximaFechaConsulta: "0001-01-01",
      proximaHoraConsulta: "00:00",
      pieDerecho: null,
      pieIzquierdo: null,
    },
  });

  useEffect(() => {
    let activo = true;

    const obtenerPaciente = async () => {
      try {
        const paciente = await getPacienteById(idPaciente);
        if (activo) setPaciente(paciente);
      } catch {
        if (activo) {
          setMensajeEstudios({
            tipo: "error",
            texto: "No se encontró al paciente. Serás redirigido al registro.",
          });
          navigate("/registro-paciente");
        }
      } finally {
        if (activo) setCarga(false);
      }
    };

    obtenerPaciente();

    return () => {
      activo = false;
    };
  }, [idPaciente, navigate]);

  const calcularSHA256 = async (archivo) => {
    const buffer = await archivo.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  };

  const convertirABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => resolve(lector.result);
      lector.onerror = (error) => reject(error);

      lector.readAsDataURL(archivo);
    });
  };

  const mostrarMensajeEstudios = (tipo, texto) => {
    setMensajeEstudios({ tipo, texto });
    if (timeoutMensaje.current) clearTimeout(timeoutMensaje.current);
    timeoutMensaje.current = setTimeout(() => {
      setMensajeEstudios(null);
      timeoutMensaje.current = null;
    }, 4000);
  };

  const cargarImagen = async (e, tipo, onChange) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setMensajeIA(
        "Solo se permiten imágenes. Elige un archivo .jpg, .png o .webp.",
      );
      e.target.value = "";
      return;
    }

    try {
      const imagenBase64 = await convertirABase64(archivo);
      archivosPieRef.current = { ...archivosPieRef.current, [tipo]: archivo };
      onChange(archivo);

      if (tipo === "izquierdo") {
        setImgPieIzq64(imagenBase64);
      } else {
        setImgPieDer64(imagenBase64);
      }

      setMensajeIA("");
    } catch {
      setMensajeIA("No se pudo cargar la imagen. Inténtalo de nuevo.");
    }
  };

  const analizarDesdeInforme = async () => {
    const imgPieDer = archivosPieRef.current.derecho;
    const imgPieIzq = archivosPieRef.current.izquierdo;

    if (!imgPieDer || !imgPieIzq) {
      setMensajeIA(
        "Debes cargar la imagen de ambos pies antes de analizar.",
      );
      return;
    }

    setMensajeIA("");
    setCargando(true);
    try {
      const prediccionDer = await createPredict(imgPieDer);
      setAnalisisPieDer(prediccionDer);

      const prediccionIzq = await createPredict(imgPieIzq);
      setAnalisisPieIzq(prediccionIzq);

      mostrarMensajeEstudios(
        "exito",
        "Análisis con IA completado correctamente.",
      );
    } catch (error) {
      setMensajeIA(
        error?.message ||
          "No se pudo analizar con IA. Verifica tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

  const subirOtroEstudio = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = "";

    if (!archivo) return;

    if (!tiposArchivoEstudio.includes(archivo.type)) {
      mostrarMensajeEstudios(
        "error",
        "Solo puedes subir archivos PDF, JPG, PNG o WEBP.",
      );
      return;
    }

    if (archivo.size > tamanoMaximoEstudio) {
      mostrarMensajeEstudios("error", "El archivo no puede superar los 5 MB.");
      return;
    }

    try {
      const archivoBase64 = await convertirABase64(archivo);

      const nuevoEstudio = estudio({
        name: archivo.name,
        type: archivo.type,
        size: archivo.size,
        archivoBase64: archivoBase64,
      });

      setEstudios([...estudios, nuevoEstudio]);

      registrarActividad({
        tipo: "Estudio adicional",
        descripcion: "Se agregó un estudio al informe del paciente",
        paciente: paciente?.nombre || "Paciente",
        detalles: `Archivo: ${archivo.name}`,
      });

      mostrarMensajeEstudios("exito", "Estudio agregado correctamente.");
    } catch {
      mostrarMensajeEstudios("error", "No se pudo cargar el archivo.");
    }
  };

  const eliminarEstudio = (idEstudio) => {
    const estudioEliminado = estudios.find(
      (estudio) => estudio.id === idEstudio,
    );

    const nuevosEstudios = estudios.filter(
      (estudio) => estudio.id !== idEstudio,
    );

    setEstudios(nuevosEstudios);
    setConfirmaEliminarId(null);

    registrarActividad({
      tipo: "Estudio adicional",
      descripcion: "Se eliminó un estudio del informe del paciente",
      paciente: paciente?.nombre || "Paciente",
      detalles: estudioEliminado
        ? `Archivo eliminado: ${estudioEliminado.nombre}`
        : "Se eliminó un archivo",
    });

    mostrarMensajeEstudios("exito", "Estudio eliminado.");
  };

  const verEstudio = (estudio) => {
    if (!estudio || !estudio.archivo) {
      mostrarMensajeEstudios("error", "No se encontró el archivo.");
      return;
    }

    try {
      const partes = estudio.archivo.split(",");

      if (partes.length < 2) {
        mostrarMensajeEstudios("error", "El archivo guardado no es válido.");
        return;
      }

      const encabezado = partes[0];
      const contenidoBase64 = partes[1];
      const tipoEncontrado = encabezado.match(/data:(.*?);base64/);

      const tipo = tipoEncontrado
        ? tipoEncontrado[1]
        : estudio.tipo || "application/octet-stream";

      const contenidoBinario = atob(contenidoBase64);
      const bytes = new Uint8Array(contenidoBinario.length);

      for (let i = 0; i < contenidoBinario.length; i++) {
        bytes[i] = contenidoBinario.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: tipo });
      const url = URL.createObjectURL(blob);

      const nuevaVentana = window.open(url, "_blank");

      if (!nuevaVentana) {
        mostrarMensajeEstudios(
          "error",
          "El navegador bloqueó la ventana. Permite ventanas emergentes para esta página.",
        );
        URL.revokeObjectURL(url);
        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch {
      mostrarMensajeEstudios("error", "No se pudo abrir el estudio.");
    }
  };

  const base64AFile = (estudio) => {
    const partes = estudio.archivo.split(",");
    const encabezado = partes[0] || "";
    const contenidoBase64 = partes[1] || "";
    const tipoEncontrado = encabezado.match(/data:(.*?);base64/);

    const tipo =
      tipoEncontrado?.[1] || estudio.tipo || "application/octet-stream";

    const contenidoBinario = atob(contenidoBase64);
    const bytes = new Uint8Array(contenidoBinario.length);

    for (let i = 0; i < contenidoBinario.length; i++) {
      bytes[i] = contenidoBinario.charCodeAt(i);
    }

    return new File([bytes], estudio.nombre || "estudio", {
      type: tipo,
      lastModified: FECHA_INICIO_MODULO,
    });
  };

  const subirAnalisis = async (idInforme, pieType, analisis, img) => {
    const { idAnalisis } = await createAnalisis(
      AnalisisCreateModel({
        idInforme: idInforme,
        pieType: pieType,
        className: analisis.className,
        confidence: analisis.confidence,
      }),
    );

    subirDocumentos(img, idInforme, idAnalisis);
  };

  const subirDocumentos = async (file, idInforme, idAnalisis = null) => {
    const { storageKey, uploadUrl } = await GenerateUploadUrl(
      paciente.curp,
      file.name,
      file.type,
    );

    await UploadFile(uploadUrl, file);

    await CompleteUpload(paciente.curp, storageKey);

    const hash = await calcularSHA256(file);
    await createDocumento({
      idPaciente: paciente.curp,
      idProfesional: idProfesional,
      idInforme: idInforme,
      idAnalisis: idAnalisis,
      storageUri: uploadUrl,
      storageKey: storageKey,
      nombreDocumento: file.name,
      mimeType: file.type,
      tamanoBytes: file.size,
      hashSha256: hash,
      version: 1,
      fechaDocumento: new Date(file.lastModified).toISOString(),
    });
  };

  const guardarCambios = async (data) => {
    if (!paciente) {
      setErrorGeneral(
        "No hay paciente seleccionado. Regresa al registro para continuar.",
      );
      return;
    }

    if (!archivosPieRef.current.izquierdo || !archivosPieRef.current.derecho) {
      setErrorGeneral(
        "Debes cargar las imágenes de ambos pies antes de guardar el informe.",
      );
      return;
    }

    setErrorGeneral("");
    try {
      registrarActividad({
        tipo: "Informe médico",
        descripcion: "Se guardaron cambios en el informe médico",
        paciente: paciente?.nombre,
        detalles: paciente.diagnostico
          ? `Diagnóstico: ${paciente.diagnostico}`
          : "Sin diagnóstico registrado",
      });

      const { idInforme } = await createInforme(
        InformeCreateUpdateModel({
          idPaciente: paciente.curp,
          idProfesional: idProfesional,
          estadoGeneral: data.estadoGeneral,
          pesoKg: data.peso,
          sintomas: data.sintomas,
          descripcion: data.descripcion,
          diagnostico: data.diagnostico,
          tratamiento: data.tratamiento,
          evolucion: data.evolucion,
          observaciones: data.observaciones,
        }),
      );

      await subirAnalisis(
        idInforme,
        "DERECHA",
        analisisPieDer,
        archivosPieRef.current.derecho,
      );
      await subirAnalisis(
        idInforme,
        "IZQUIERDA",
        analisisPieIzq,
        archivosPieRef.current.izquierdo,
      );

      await Promise.all(
        estudios.map(async (estudioItem) => {
          if (estudioItem?.archivo) {
            await subirDocumentos(base64AFile(estudioItem), idInforme);
          }
        }),
      );

      const historialKey = `historial_${paciente.curp}`;
      const historialActual =
        JSON.parse(localStorage.getItem(historialKey)) || [];

      const nuevoRegistroHistorial = {
        proximaFechaConsulta: data.proximaFechaConsulta || "",
        proximaHoraConsulta: data.proximaHoraConsulta || "",
        otrosEstudios: estudios || [],

        idHistorial: Date.now(),
        fechaHistorial: new Date().toLocaleString(),
        tipoRegistro: "Cambio guardado",
      };

      localStorage.setItem(
        historialKey,
        JSON.stringify([...historialActual, nuevoRegistroHistorial]),
      );

      mostrarMensajeEstudios(
        "exito",
        "Cambios guardados y agregados al historial del paciente.",
      );
      navigate("/lista-pacientes");
    } catch (error) {
      setErrorGeneral(
        error?.message ||
          "No se pudo guardar el informe. Verifica tu conexión e inténtalo de nuevo.",
      );
    }
  };

  const descargarPDF = async () => {
    if (!informeRef.current || descargando) return;

    const controlesOcultables = [
      ...document.querySelectorAll(
        ".informe-buttons, .btn-subir-imagen, .boton-analizar-informe, .controles-estudio-pdf",
      ),
    ];

    setDescargando(true);
    try {
      controlesOcultables.forEach((elemento) => {
        elemento.style.display = "none";
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(informeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const nombreArchivo = paciente?.nombre
        ? `Informe-${paciente.nombre}.pdf`
        : "Informe-Paciente.pdf";

      pdf.save(nombreArchivo);
    } catch {
      setErrorGeneral(
        "No se pudo generar el PDF. Verifica tu conexión e inténtalo de nuevo.",
      );
    } finally {
      controlesOcultables.forEach((elemento) => {
        elemento.style.display = "";
      });
      setDescargando(false);
    }
  };

  const manejarSubmit = (event) => {
    handleSubmit(guardarCambios)(event);
  };

  return {
    navigate,
    informeRef,
    paciente,
    analisisPieIzq,
    analisisPieDer,
    imgPieIzq64,
    imgPieDer64,
    estudios,
    cargando,
    carga,
    errorGeneral,
    mensajeIA,
    mensajeEstudios,
    confirmaEliminarId,
    setConfirmaEliminarId,
    descargando,
    control,
    errors,
    isSubmitting,
    cargarImagen,
    analizarDesdeInforme,
    subirOtroEstudio,
    eliminarEstudio,
    verEstudio,
    manejarSubmit,
    descargarPDF,
  };
}

export default useInformePaciente;
