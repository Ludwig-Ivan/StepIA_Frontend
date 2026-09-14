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
import { InformeCreateUpdateModel } from "../../models/informes/InformeCreateUpdateModel.js";
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

function InformePaciente() {
  const navigate = useNavigate();
  const informeRef = useRef(null);
  const idProfesional = localStorage.getItem("idProfesional");
  const idPaciente = localStorage.getItem("idPaciente");
  const [informe, setInforme] = useState(InformeCreateUpdateModel());
  const [analisisPieIzq, setAnalisisPieIzq] = useState(PredictModel());
  const [analisisPieDer, setAnalisisPieDer] = useState(PredictModel());
  const [imgPieIzq, setImgPieIzq] = useState();
  const [imgPieDer, setImgPieDer] = useState();
  const [imgPieIzq64, setImgPieIzq64] = useState();
  const [imgPieDer64, setImgPieDer64] = useState();
  const [estudios, setEstudios] = useState([]);
  const [fechaConsulta, setFechaConsulta] = useState("0000-00-00");
  const [horaConsulta, setHoraConsulta] = useState("00:00");
  const [cargando, setCargando] = useState(false);
  const [carga, setCarga] = useState(true);
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    const cargarInforme = async () => {
      setInforme({
        ...informe,
        idPaciente: idPaciente,
        idProfesional: idProfesional,
      });
    };
    const obtenerPaciente = async () => {
      try {
        const paciente = await getPacienteById(idPaciente);
        setPaciente(paciente);
        cargarInforme();
      } catch (error) {
        console.log("Error, no se encontro al paciente", error);
        navigate("/registro-paciente");
      } finally {
        setCarga(false);
      }
    };

    obtenerPaciente();
  }, [idPaciente]);

  const manejarCambioInforme = (e) => {
    const { name, value } = e.target;

    setInforme({
      ...informe,
      [name]: value,
    });
  };

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
      setImgPieIzq(archivo);
      setImgPieIzq64(imagenBase64);
    } else {
      setImgPieDer(archivo);
      setImgPieDer64(imagenBase64);
    }
  };

  const analizarDesdeInforme = async () => {
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

  const guardarCambios = async () => {
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

    const { idInforme } = await createInforme(informe);

    await subirAnalisis(idInforme, "DERECHA", analisisPieDer, imgPieDer);
    await subirAnalisis(idInforme, "IZQUIERDA", analisisPieIzq, imgPieIzq);

    await estudios.forEach(async (estudio) => {
      await subirDocumentos(estudio, idInforme);
    });

    const historialKey = `historial_${paciente.curp}`;
    const historialActual =
      JSON.parse(localStorage.getItem(historialKey)) || [];

    const nuevoRegistroHistorial = {
      proximaFechaConsulta: fechaConsulta || "",
      proximaHoraConsulta: fechaConsulta || "",
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
            value={new Date().toDateString()}
          />
        </div>

        <section className="informe-card">
          <div className="datos-basicos">
            <div className="campo campo-nombre">
              <label>Nombre Paciente</label>
              <input
                readOnly
                type="text"
                name="nombre"
                placeholder="Nombre Paciente"
                value={paciente.nombre}
              />
            </div>

            <div className="campo campo-peso">
              <label>Peso</label>
              <input
                type="number"
                name="pesoKg"
                placeholder="Peso"
                value={informe.pesoKg}
                onChange={manejarCambioInforme}
              />
            </div>
          </div>

          <div className="campo">
            <label>Estado General</label>
            <textarea
              name="estadoGeneral"
              placeholder="Estado General"
              value={informe.estadoGeneral}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

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

                    <label className="btn-subir-imagen">
                      Subir imagen
                      <input
                        type="file"
                        accept="image/*"
                        testid="input-pie-izquierdo"
                        onChange={(e) => cargarImagen(e, "izquierdo")}
                      />
                    </label>
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

                    <label className="btn-subir-imagen">
                      Subir imagen
                      <input
                        type="file"
                        accept="image/*"
                        testid="input-pie-derecho"
                        onChange={(e) => cargarImagen(e, "derecho")}
                      />
                    </label>
                  </div>
                </div>

                <div className="campo tipo-pie-box">
                  <label>Tipo de Pie</label>

                  <input
                    type="text"
                    name="tipoPie"
                    placeholder="Tipo de Pie"
                    value={``}
                    readOnly
                    className="campo-bloqueado"
                  />
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

          <div className="campo observaciones-manuales">
            <label>Observaciones Manuales</label>
            <textarea
              name="observaciones"
              placeholder="Observaciones"
              value={informe.observaciones}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

          <div className="campo diagnostico-final">
            <label>Diagnóstico</label>
            <textarea
              name="diagnostico"
              placeholder="Diagnóstico"
              value={informe.diagnostico}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

          <div className="campo">
            <label>Síntomas</label>

            <textarea
              name="sintomas"
              placeholder="Síntomas"
              value={informe.sintomas}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

          <div className="campo">
            <label>Tratamiento</label>

            <textarea
              name="tratamiento"
              placeholder="Tratamiento"
              value={informe.tratamiento}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

          <div className="campo">
            <label>Evoluciones</label>

            <textarea
              name="evolucion"
              placeholder="Evoluciones"
              value={informe.evolucion}
              onChange={manejarCambioInforme}
            ></textarea>
          </div>

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
              <div className="campo">
                <label>Fecha de la próxima consulta</label>

                <input
                  type="date"
                  name="proximaFechaConsulta"
                  value={fechaConsulta}
                  onChange={() => {
                    setFechaConsulta(fechaConsulta);
                  }}
                />
              </div>

              <div className="campo">
                <label>Hora de la próxima consulta</label>

                <input
                  type="time"
                  name="proximaHoraConsulta"
                  value={horaConsulta}
                  onChange={() => {
                    setHoraConsulta(horaConsulta);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="informe-buttons">
          <button type="button" onClick={() => navigate("/menu")}>
            Cerrar
          </button>

          <div>
            <button
              type="button"
              testid="boton-guardar-informe"
              onClick={guardarCambios}
            >
              Guardar
            </button>

            <button type="button" onClick={descargarPDF}>
              PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InformePaciente;
