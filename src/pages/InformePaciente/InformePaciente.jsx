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
import InputComponent from "../../components/inputs/InputComponent.jsx";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import { InformeCreateUpdateModel } from "../../models/informes/InformeCreateUpdateModel.js";

function InformePaciente() {
  const navigate = useNavigate();
  const informeRef = useRef(null);
  const idProfesional = localStorage.getItem("idProfesional");
  const idPaciente = localStorage.getItem("idPaciente");

  const [paciente, setPaciente] = useState(null);
  const [analisisPieIzq, setAnalisisPieIzq] = useState(PredictModel());
  const [analisisPieDer, setAnalisisPieDer] = useState(PredictModel());
  const [imgPieIzq64, setImgPieIzq64] = useState();
  const [imgPieDer64, setImgPieDer64] = useState();
  const [estudios, setEstudios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [carga, setCarga] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
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
      } catch (error) {
        console.log("Error, no se encontro al paciente", error);
        navigate("/registro-paciente");
      } finally {
        setCarga(false);
      }
    };

    obtenerPaciente();
  }, [idPaciente]);

  const calcularSHA256 = async (archivo) => {
    const buffer = await archivo.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    // Convertir ArrayBuffer a string hexadecimal
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

  const cargarImagen = async (e, tipo) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    const imagenBase64 = await convertirABase64(archivo);

    if (tipo === "izquierdo") {
      // setImgPieIzq(archivo);
      setImgPieIzq64(imagenBase64);
    } else {
      // setImgPieDer(archivo);
      setImgPieDer64(imagenBase64);
    }
  };

  const analizarDesdeInforme = async () => {
    const imgPieDer = watch("pieDerecho");
    const imgPieIzq = watch("pieIzquierdo");

    if (!imgPieDer || !imgPieDer) {
      alert("Debes cargar ambas imágenes de los pies");
      return;
    }

    setCargando(true);
    var predict = await createPredict(imgPieDer);
    setAnalisisPieDer(predict);
    predict = await createPredict(imgPieIzq);
    setAnalisisPieIzq(predict);
    setCargando(false);
  };

  const subirOtroEstudio = async (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      alert("Solo puedes subir archivos PDF, JPG, PNG o WEBP");
      e.target.value = "";
      return;
    }

    const tamañoMaximo = 5 * 1024 * 1024;

    if (archivo.size > tamañoMaximo) {
      alert("El archivo no puede superar los 5 MB");
      e.target.value = "";
      return;
    }

    try {
      const archivoBase64 = await convertirABase64(archivo);

      const nuevoEstudio = {
        nombre: archivo.name,
        tipo: archivo.type,
        tamaño: archivo.size,
        archivo: archivoBase64,
      };

      setEstudios([...estudios, estudio(nuevoEstudio)]);

      registrarActividad({
        tipo: "Estudio adicional",
        descripcion: "Se agregó un estudio al informe del paciente",
        paciente: paciente.nombre || "Paciente",
        detalles: `Archivo: ${archivo.name}`,
      });

      alert("Estudio agregado correctamente");
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el archivo");
    }

    e.target.value = "";
  };

  const eliminarEstudio = (idEstudio) => {
    const confirmar = window.confirm("¿Deseas eliminar este estudio?");

    if (!confirmar) return;

    const estudioEliminado = estudios.find(
      (estudio) => estudio.id === idEstudio,
    );

    const nuevosEstudios = estudios.filter(
      (estudio) => estudio.id !== idEstudio,
    );

    setEstudios(nuevosEstudios);

    registrarActividad({
      tipo: "Estudio adicional",
      descripcion: "Se eliminó un estudio del informe del paciente",
      paciente: paciente.nombre || "Paciente",
      detalles: estudioEliminado
        ? `Archivo eliminado: ${estudioEliminado.nombre}`
        : "Se eliminó un archivo",
    });
  };

  const verEstudio = (estudio) => {
    if (!estudio || !estudio.archivo) {
      alert("No se encontró el archivo");
      return;
    }

    try {
      const partes = estudio.archivo.split(",");

      if (partes.length < 2) {
        alert("El archivo guardado no es válido");
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
        alert(
          "El navegador bloqueó la ventana. Permite ventanas emergentes para esta página.",
        );
        URL.revokeObjectURL(url);
        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Error al abrir estudio:", error);
      alert("No se pudo abrir el estudio");
    }
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
    registrarActividad({
      tipo: "Informe médico",
      descripcion: "Se guardaron cambios en el informe médico",
      paciente: paciente.nombre,
      detalles: paciente.diagnostico
        ? `Diagnóstico: ${paciente.diagnostico}`
        : "Sin diagnóstico registrado",
    });

    if (!paciente) {
      alert("No hay paciente seleccionado");
      return;
    }

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

    await subirAnalisis(idInforme, "DERECHA", analisisPieDer, data.imgPieDer);
    await subirAnalisis(idInforme, "IZQUIERDA", analisisPieIzq, data.imgPieIzq);

    await estudios.forEach(async (estudio) => {
      await subirDocumentos(estudio, idInforme);
    });

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

    alert("Cambios guardados y agregados al historial del paciente");
    navigate("/lista-pacientes");
  };

  const descargarPDF = async () => {
    if (!informeRef.current) return;

    const botones = document.querySelector(".informe-buttons");
    const botonesSubir = document.querySelectorAll(".btn-subir-imagen");
    const botonAnalizar = document.querySelector(".boton-analizar-informe");
    const controlesEstudios = document.querySelectorAll(
      ".controles-estudio-pdf",
    );

    if (botones) botones.style.display = "none";
    if (botonAnalizar) botonAnalizar.style.display = "none";

    botonesSubir.forEach((boton) => {
      boton.style.display = "none";
    });

    controlesEstudios.forEach((control) => {
      control.style.display = "none";
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

    if (botones) botones.style.display = "";
    if (botonAnalizar) botonAnalizar.style.display = "";

    botonesSubir.forEach((boton) => {
      boton.style.display = "";
    });

    controlesEstudios.forEach((control) => {
      control.style.display = "";
    });

    const nombreArchivo = paciente.nombre
      ? `Informe-${paciente.nombre}.pdf`
      : "Informe-Paciente.pdf";

    pdf.save(nombreArchivo);
  };

  if (carga)
    return (
      <div className="loading-screen">
        <h2>Cargando...</h2>
        <p>Obteniendo información del paciente</p>
      </div>
    );

  return (
    <div className="informe-page" ref={informeRef}>
      <header className="informe-header">
        <h2>StepIA</h2>

        <div className="informe-user">
          <span>USUARIO</span>
          <div className="user-icon">
            <FaUserAlt />
          </div>
        </div>
      </header>

      <main className="informe-main">
        <div className="informe-top">
          <h3>Informe sobre Paciente</h3>
          <input
            className="fecha-input"
            type="text"
            name="fecha"
            placeholder="Fecha"
            disabled
            defaultValue={new Date().toDateString()}
          />
        </div>

        <form
          id="formInforme"
          className="informe-card"
          onSubmit={handleSubmit(guardarCambios)}
        >
          <div className="datos-basicos">
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    name: "nombre",
                    label: "Nombre del Paciente",
                    placeholder: "Nombre del Paciente",
                    value: field.value,
                    func: field.onChange,
                    type: "text",
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
                    name: "pesoKg",
                    label: "Peso",
                    placeholder: "Peso",
                    type: "number",
                    value: field.value,
                    func: field.onChange,
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
                  name: "estadoGeneral",
                  label: "Estado General",
                  placeholder: "Estado General",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "15vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
                }}
                rows={3}
              />
            )}
          />

          <section className="ai-panel">
            <div className="ai-panel-header">
              <span>Análisis AI</span>
            </div>

            <div className="ai-layout">
              <div className="ai-pies-columna">
                <div className="pies-grid">
                  <div className="upload-pie-card">
                    <label>Pie Izquierdo</label>

                    <div className="imagen-pie">
                      {imgPieIzq64 ? (
                        <img src={imgPieIzq64} alt="Pie izquierdo" />
                      ) : (
                        <span>Sin imagen</span>
                      )}
                    </div>
                    <Controller
                      name="pieIzquierdo"
                      control={control}
                      render={({ field }) => (
                        <label className="btn-subir-imagen">
                          Subir imagen
                          <input
                            type="file"
                            accept="image/*"
                            testid="input-pie-izquierdo"
                            onChange={(e) => {
                              field.onChange(e.target.files[0]);
                              cargarImagen(e, "izquierdo");
                            }}
                          />
                        </label>
                      )}
                    />
                  </div>

                  <div className="upload-pie-card">
                    <label>Pie Derecho</label>

                    <div className="imagen-pie">
                      {imgPieDer64 ? (
                        <img src={imgPieDer64} alt="Pie derecho" />
                      ) : (
                        <span>Sin imagen</span>
                      )}
                    </div>
                    <Controller
                      name="pieDerecho"
                      control={control}
                      render={({ field }) => (
                        <label className="btn-subir-imagen">
                          Subir imagen
                          <input
                            type="file"
                            accept="image/*"
                            testid="input-pie-derecho"
                            onChange={(e) => {
                              field.onChange(e.target.files[0]);
                              cargarImagen(e, "derecho");
                            }}
                          />
                        </label>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="ai-resultados-columna">
                <div className="campo resultado-ia-box">
                  <label>Resultado dado por IA</label>

                  <textarea
                    className="lista-box campo-bloqueado"
                    name="resultadoIA"
                    placeholder="Resultado generado por IA..."
                    value={`Pie Izq (${analisisPieIzq.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieIzq.confidence ?? "?"} 
                    \nPie Der (${analisisPieDer.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieDer.confidence ?? "?"}`}
                    readOnly
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="boton-analizar-informe">
              <button
                type="button"
                testid="boton-analizar-informe"
                onClick={analizarDesdeInforme}
                disabled={cargando}
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
                  name: "observaciones",
                  label: "Observaciones Manuales",
                  placeholder: "Observaciones Manuales",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "20vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
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
                  name: "diagnostico",
                  label: "Diagnostico",
                  placeholder: "Diagnostico",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "20vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
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
                  name: "sintomas",
                  label: "Sintomas",
                  placeholder: "Sintomas",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "20vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
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
                  name: "tratamiento",
                  label: "Tratamiento",
                  placeholder: "Tratamiento",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "20vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
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
                  name: "evolucion",
                  label: "Evoluciones",
                  placeholder: "Evoluciones",
                  type: "text",
                  value: field.value,
                  func: field.onChange,
                }}
                multiline
                containerStyle={{
                  maxWidth: "none",
                  width: "100%",
                  height: "fit-content",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "20vh",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: "18px",
                  },
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

              <label className="btn-subir-estudio controles-estudio-pdf">
                Subir otro estudio
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={subirOtroEstudio}
                />
              </label>
            </div>

            {estudios.length === 0 ? (
              <div className="sin-estudios">
                <div className="sin-estudios-icono">
                  <FcOpenedFolder />
                </div>
                <strong>No hay otros estudios</strong>
                <span>Los archivos que agregues aparecerán aquí.</span>
              </div>
            ) : (
              <div className="lista-estudios">
                {estudios.map((estudio) => (
                  <div className="estudio-item" key={estudio.id}>
                    <div className="estudio-icono">
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

                      <button
                        type="button"
                        className="btn-eliminar-estudio"
                        onClick={() => eliminarEstudio(estudio.id)}
                      >
                        <FaTrashCan />
                      </button>
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
                      name: "proximaFechaConsulta",
                      label: "Fecha de la proxima consulta",
                      type: "date",
                      value: field.value,
                      func: field.onChange,
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
                      name: "proximaHoraConsulta",
                      label: "Hora de la proxima consulta",
                      type: "time",
                      value: field.value,
                      func: field.onChange,
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
              }}
              form="formInforme"
            />
            <ButtonComponent
              config={{
                name: "pdf",
                text: "PDF",
                type: "button",
                variant: "purple",
              }}
              onClick={descargarPDF}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default InformePaciente;
