import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { LiaEyeSolid } from "react-icons/lia";
import { FaUserAlt } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { FcOpenedFolder } from "react-icons/fc";
import "./InformePaciente.css";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { InformeCreateUpdateModel } from "../../models/informes/InformeCreateUpdateModel.js";

const tiposArchivoEstudio = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const tamanoMaximoEstudio = 5 * 1024 * 1024;
const FECHA_INICIO_MODULO = Date.now();

const PIES = [
  { key: "pieIzquierdo", tipo: "izquierdo", etiqueta: "Pie Izquierdo", alt: "Pie izquierdo" },
  { key: "pieDerecho", tipo: "derecho", etiqueta: "Pie Derecho", alt: "Pie derecho" },
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

function InformePaciente() {
  const navigate = useNavigate();
  const informeRef = useRef(null);
  const timeoutMensaje = useRef(null);
  const idProfesional = localStorage.getItem("idProfesional");
  const idPaciente = localStorage.getItem("idPaciente");

  const [paciente, setPaciente] = useState(null);
  const [analisisPieIzq, setAnalisisPieIzq] = useState(PredictModel());
  const [analisisPieDer, setAnalisisPieDer] = useState(PredictModel());
  const [imgPieIzq64, setImgPieIzq64] = useState();
  const [imgPieDer64, setImgPieDer64] = useState();
  const [estudios, setEstudios] = useState([]);
  const [archivosPie, setArchivosPie] = useState({ izquierdo: null, derecho: null });
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
    const obtenerPaciente = async () => {
      try {
        const paciente = await getPacienteById(idPaciente);
        setPaciente(paciente);
      } catch {
        setMensajeEstudios({
          tipo: "error",
          texto: "No se encontró al paciente. Serás redirigido al registro.",
        });
        navigate("/registro-paciente");
      } finally {
        setCarga(false);
      }
    };

    obtenerPaciente();
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
      setMensajeIA("Solo se permiten imágenes. Elige un archivo .jpg, .png o .webp.");
      e.target.value = "";
      return;
    }

    try {
      const imagenBase64 = await convertirABase64(archivo);
      setArchivosPie((prev) => ({ ...prev, [tipo]: archivo }));
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
    const imgPieDer = archivosPie.derecho;
    const imgPieIzq = archivosPie.izquierdo;

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
      mostrarMensajeEstudios(
        "error",
        "El archivo no puede superar los 5 MB.",
      );
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

    if (!archivosPie.izquierdo || !archivosPie.derecho) {
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
        archivosPie.derecho,
      );
      await subirAnalisis(
        idInforme,
        "IZQUIERDA",
        analisisPieIzq,
        archivosPie.izquierdo,
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

  if (carga)
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h2>Cargando…</h2>
        <p>Obteniendo información del paciente</p>
      </div>
    );

  return (
    <div className="informe-page" ref={informeRef}>
      <header className="informe-header">
        <button
          type="button"
          className="informe-logo"
          onClick={() => navigate("/menu")}
        >
          StepIA
        </button>

        <div className="informe-user" title="Profesional en sesión">
          <span>USUARIO</span>
          <div className="user-icon" aria-hidden="true">
            <FaUserAlt />
          </div>
        </div>
      </header>

      <main className="informe-main">
        <div className="informe-top">
          <div className="informe-titulo">
            <h3>Informe de paciente</h3>
            {paciente && (
              <p>
                {paciente.nombre} {paciente.apellidoPaterno}{" "}
                {paciente.apellidoMaterno}
              </p>
            )}
          </div>

          <input
            className="fecha-input"
            type="text"
            name="fecha"
            placeholder="Fecha"
            disabled
            aria-label="Fecha de generación del informe"
            defaultValue={new Date().toDateString()}
          />
        </div>

        <form
          id="formInforme"
          className="informe-card"
          noValidate
          onSubmit={manejarSubmit}
        >
          <Collapse in={Boolean(errorGeneral)}>
            <Alert
              variant="filled"
              severity="error"
              role="alert"
              sx={{ my: 2, fontWeight: 600, borderRadius: 1.5 }}
            >
              {errorGeneral}
            </Alert>
          </Collapse>

          <div className="datos-basicos">
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "informe-nombre",
                    name: "nombre",
                    label: "Nombre del Paciente",
                    placeholder: "Nombre del Paciente",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    type: "text",
                    error: errors.nombre?.message,
                  }}
                  containerStyle={{ maxWidth: "400px" }}
                />
              )}
            />

            <Controller
              name="peso"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "informe-peso",
                    name: "pesoKg",
                    label: "Peso",
                    placeholder: "Peso",
                    type: "number",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    error: errors.peso?.message,
                    inputProps: { min: 0, max: 500, step: 0.1 },
                  }}
                  containerStyle={{ maxWidth: "150px" }}
                />
              )}
            />
          </div>

          <Controller
            name="estadoGeneral"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-estado-general",
                  name: "estadoGeneral",
                  label: "Estado General",
                  placeholder: "Estado General",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.estadoGeneral?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={3}
              />
            )}
          />

          <section className="ai-panel" aria-label="Análisis con IA">
            <div className="ai-panel-header">
              <span>Análisis AI</span>
            </div>

            <div className="ai-layout">
              <div className="ai-pies-columna">
                <div className="pies-grid">
                  {PIES.map((pie) => {
                    const imagenPreview =
                      pie.tipo === "izquierdo" ? imgPieIzq64 : imgPieDer64;

                    return (
                      <div className="upload-pie-card" key={pie.key}>
                        <label htmlFor={`input-${pie.key}`}>
                          {pie.etiqueta}
                        </label>

                        <div className="imagen-pie">
                          {imagenPreview ? (
                            <img src={imagenPreview} alt={pie.alt} />
                          ) : (
                            <span>Sin imagen</span>
                          )}
                        </div>

                        <Controller
                          name={pie.key}
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                type="button"
                                className="btn-subir-imagen"
                                onClick={() =>
                                  document
                                    .getElementById(`input-${pie.key}`)
                                    ?.click()
                                }
                              >
                                Subir imagen
                              </button>
                              <input
                                id={`input-${pie.key}`}
                                className="input-archivo-oculto"
                                type="file"
                                accept="image/*"
                                testid={
                                  pie.tipo === "izquierdo"
                                    ? "input-pie-izquierdo"
                                    : "input-pie-derecho"
                                }
                                onChange={(e) => {
                                  cargarImagen(e, pie.tipo, field.onChange);
                                }}
                              />
                            </>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ai-resultados-columna">
                <div className="campo resultado-ia-box">
                  <label htmlFor="resultadoIA">
                    Resultado dado por IA
                  </label>

                  <textarea
                    id="resultadoIA"
                    className="lista-box campo-bloqueado"
                    name="resultadoIA"
                    placeholder="Resultado generado por IA..."
                    value={`Pie Izq (${analisisPieIzq.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieIzq.confidence ?? "?"} 
                    \nPie Der (${analisisPieDer.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieDer.confidence ?? "?"}`}
                    readOnly
                  ></textarea>
                </div>

                {mensajeIA && (
                  <p className="ai-aviso" role="alert">
                    {mensajeIA}
                  </p>
                )}
              </div>
            </div>

            <div className="boton-analizar-informe">
              <button
                type="button"
                testid="boton-analizar-informe"
                onClick={analizarDesdeInforme}
                disabled={cargando}
                aria-busy={cargando}
              >
                {cargando ? "Analizando..." : "Analizar con IA"}
              </button>
            </div>
          </section>

          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-observaciones",
                  name: "observaciones",
                  label: "Observaciones Manuales",
                  placeholder: "Observaciones Manuales",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.observaciones?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={4}
              />
            )}
          />

          <Controller
            name="diagnostico"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-diagnostico",
                  name: "diagnostico",
                  label: "Diagnóstico",
                  placeholder: "Diagnóstico",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.diagnostico?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={4}
              />
            )}
          />

          <Controller
            name="sintomas"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-sintomas",
                  name: "sintomas",
                  label: "Síntomas",
                  placeholder: "Síntomas",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.sintomas?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={4}
              />
            )}
          />

          <Controller
            name="tratamiento"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-tratamiento",
                  name: "tratamiento",
                  label: "Tratamiento",
                  placeholder: "Tratamiento",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.tratamiento?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={4}
              />
            )}
          />

          <Controller
            name="evolucion"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  id: "informe-evolucion",
                  name: "evolucion",
                  label: "Evoluciones",
                  placeholder: "Evoluciones",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                  onBlur: field.onBlur,
                  error: errors.evolucion?.message,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                rows={4}
              />
            )}
          />

          {/* OTROS ESTUDIOS */}

          <div className="otros-estudios">
            <div className="otros-estudios-header">
              <div>
                <h4>Otros Estudios</h4>
                <p>
                  Agrega estudios adicionales del paciente, como radiografías,
                  análisis clínicos, resonancias u otros documentos.
                </p>
              </div>

              <button
                type="button"
                className="btn-subir-estudio controles-estudio-pdf"
                onClick={() =>
                  document.getElementById("input-estudio-adicional")?.click()
                }
              >
                Subir otro estudio
              </button>
              <input
                id="input-estudio-adicional"
                className="input-archivo-oculto"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={subirOtroEstudio}
              />
            </div>

            {mensajeEstudios && (
              <p
                className={`mensaje-estudios mensaje-estudios--${mensajeEstudios.tipo}`}
                role={mensajeEstudios.tipo === "error" ? "alert" : "status"}
              >
                {mensajeEstudios.texto}
              </p>
            )}

            {estudios.length === 0 ? (
              <div className="sin-estudios">
                <div className="sin-estudios-icono" aria-hidden="true">
                  <FcOpenedFolder />
                </div>
                <strong>No hay otros estudios</strong>
                <span>Los archivos que agregues aparecerán aquí.</span>
              </div>
            ) : (
              <div className="lista-estudios">
                {estudios.map((estudio) => (
                  <div className="estudio-item" key={estudio.id}>
                    <div className="estudio-icono" aria-hidden="true">
                      {estudio.tipo === "application/pdf" ? "📄" : "🖼️"}
                    </div>

                    <div className="estudio-datos">
                      <strong>{estudio.nombre}</strong>
                      <span>
                        {estudio.fecha}
                        {" • "}
                        {estudio.hora}
                      </span>
                      <span>
                        {(estudio.tamaño / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="estudio-acciones controles-estudio-pdf">
                      <button
                        type="button"
                        className="btn-ver-estudio"
                        onClick={() => verEstudio(estudio)}
                      >
                        <LiaEyeSolid /> Ver
                      </button>

                      {confirmaEliminarId === estudio.id ? (
                        <div className="confirma-estudio">
                          <span>¿Eliminar?</span>
                          <button
                            type="button"
                            className="btn-confirmar-eliminar"
                            onClick={() => eliminarEstudio(estudio.id)}
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            className="btn-cancelar-eliminar"
                            onClick={() => setConfirmaEliminarId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-eliminar-estudio"
                          aria-label={`Eliminar ${estudio.nombre}`}
                          onClick={() => setConfirmaEliminarId(estudio.id)}
                        >
                          <FaTrashCan />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRÓXIMA CONSULTA */}

          <div className="proxima-consulta">
            <h4>Próxima consulta</h4>
            <p>Selecciona la fecha y hora de la siguiente cita del paciente.</p>

            <div className="proxima-consulta-grid">
              <Controller
                name="proximaFechaConsulta"
                control={control}
                render={({ field }) => (
                  <InputComponent
                    config={{
                      id: "informe-proxima-fecha",
                      name: "proximaFechaConsulta",
                      label: "Fecha de la próxima consulta",
                      type: "date",
                      value: field.value,
                      func: field.onChange,
                      onBlur: field.onBlur,
                    }}
                    containerStyle={{ maxWidth: "none" }}
                  />
                )}
              />
              <Controller
                name="proximaHoraConsulta"
                control={control}
                render={({ field }) => (
                  <InputComponent
                    config={{
                      id: "informe-proxima-hora",
                      name: "proximaHoraConsulta",
                      label: "Hora de la próxima consulta",
                      type: "time",
                      value: field.value,
                      func: field.onChange,
                      onBlur: field.onBlur,
                    }}
                    containerStyle={{ maxWidth: "none" }}
                  />
                )}
              />
            </div>
          </div>
        </form>

        <div className="informe-buttons">
          <ButtonComponent
            config={{
              name: "cerrar",
              text: "Cerrar",
              type: "button",
              variant: "blue",
              disabled: isSubmitting || descargando,
            }}
            onClick={() => navigate("/menu")}
          />
          <div>
            <ButtonComponent
              config={{
                name: "guardar",
                text: "Guardar",
                type: "submit",
                variant: "green",
                loading: isSubmitting,
                loadingText: "Guardando…",
                disabled: descargando,
              }}
              form="formInforme"
            />
            <ButtonComponent
              config={{
                name: "pdf",
                text: "PDF",
                type: "button",
                variant: "purple",
                loading: descargando,
                loadingText: "Generando…",
                disabled: isSubmitting,
              }}
              onClick={descargarPDF}
            />
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {isSubmitting ? "Guardando informe" : ""}
        </span>
      </main>
    </div>
  );
}

export default InformePaciente;