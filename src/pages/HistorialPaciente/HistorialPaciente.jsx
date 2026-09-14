import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import axios from "axios";
import "./HistorialPaciente.css";
import { getPacienteById } from "../../services/pacienteService";
import { getInformeByPaciente } from "../../services/informeService";
import { getAnalisisByInforme } from "../../services/analisisService";
import { getDocumentosByInforme } from "../../services/documentService";
import { GeneratedDownloadUrl } from "../../services/documentCloudService";

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatearHora = (fechaISO) => {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return "";
  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function HistorialPaciente() {
  const navigate = useNavigate();
  const idPaciente = localStorage.getItem("idPaciente");
  const [paciente, setPaciente] = useState(null);
  const [informes, setInformes] = useState(null);

  useEffect(() => {
    const cargarInfo = async (id) => {
      try {
        const paciente = await getPacienteById(id);
        setPaciente(paciente);
        const informes = await getInformeByPaciente(id);
        setInformes(informes);
      } catch (e) {
        console.error("No se pudo conseguir al paciente: " + e);
        navigate("/lista-pacientes");
      }
    };
    cargarInfo(idPaciente);
  }, []);

  if (!paciente || !informes) {
    return null;
  }

  console.log(paciente, informes);
  return (
    <div className="historial-page">
      <header className="historial-header">
        <h2>StepIA</h2>

        <div className="historial-user">
          <span>USUARIO</span>
          <div className="user-icon">👤</div>
        </div>
      </header>

      <main className="historial-main">
        <section className="historial-card">
          <div className="historial-top">
            <div>
              <h3>Historial del Paciente</h3>
              <p>{paciente.nombre}</p>
            </div>

            <button type="button" onClick={() => navigate("/lista-pacientes")}>
              Volver
            </button>
          </div>

          {informes.content === 0 ? (
            <div className="historial-vacio">
              Este paciente aún no tiene cambios guardados en el historial.
            </div>
          ) : (
            <div className="historial-lista">
              {informes.content.map((informe) => (
                <HistorialRow
                  key={informe.idInforme}
                  informe={informe}
                  paciente={paciente}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function HistorialRow({ informe, paciente }) {
  const [documentos, setDocumentos] = useState([]);
  const [analisisIa, setAnalisisIa] = useState([]);
  // Cada elemento: { idAnalisis, pieType, className, confidence, url }
  const [imagenesIA, setImagenesIA] = useState(null);

  useEffect(() => {
    const obtenerDocumentos = async (idInforme) => {
      try {
        const data_analisis = await getAnalisisByInforme(idInforme);
        setAnalisisIa(data_analisis);
        const data_documentos = await getDocumentosByInforme(idInforme);
        setDocumentos(data_documentos);

        const imagenes = await Promise.all(
          data_analisis.map(async (analisis) => {
            const doc = data_documentos.find(
              (d) =>
                d.idAnalisis === analisis.idAnalisis &&
                d.mimeType?.startsWith("image/"),
            );

            if (!doc) return { ...analisis, url: null };

            try {
              const res = await GeneratedDownloadUrl(doc.storageKey);
              console.log(res);
              return { ...analisis, url: res.downloadUrl };
            } catch (e) {
              console.error("No se pudo obtener la imagen del análisis: " + e);
              return { ...analisis, url: null };
            }
          }),
        );

        setImagenesIA(imagenes);
      } catch (e) {
        console.error("No se pudieron cargar los recursos" + e);
      }
    };

    obtenerDocumentos(informe.idInforme);
  }, []);

  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Convierte la imagen descargada (vía URL prefirmada) a base64,
  // que es lo único que jsPDF puede insertar con addImage.
  const fetchImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo descargar la imagen");
          return res.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const formatoDeImagen = (mimeType) => {
    if (!mimeType) return "JPEG";
    if (mimeType.includes("png")) return "PNG";
    if (mimeType.includes("webp")) return "WEBP";
    return "JPEG";
  };

  const descargarRegistroPDF = async (informe) => {
    if (generandoPDF) return;
    setGenerandoPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const x = 15;
      const marginRight = 15;
      const contentWidth = pageWidth - x - marginRight;
      let y = 20;

      const saltoDePaginaSiHaceFalta = (espacioNecesario = 20) => {
        if (y + espacioNecesario > pageHeight - 15) {
          pdf.addPage();
          y = 20;
        }
      };

      const agregarTexto = (titulo, texto) => {
        saltoDePaginaSiHaceFalta(16);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(titulo, x, y);
        y += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const contenido =
          texto === null || texto === undefined || texto === ""
            ? "Sin dato"
            : String(texto);
        const lineas = pdf.splitTextToSize(contenido, contentWidth);

        lineas.forEach((linea) => {
          saltoDePaginaSiHaceFalta(8);
          pdf.text(linea, x, y);
          y += 6;
        });

        y += 6;
      };

      const agregarSubtitulo = (titulo) => {
        saltoDePaginaSiHaceFalta(16);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(67, 173, 118);
        pdf.text(titulo, x, y);
        pdf.setTextColor(0, 0, 0);
        y += 9;
      };

      // --- Encabezado ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(67, 173, 118);
      pdf.text("StepIA", x, y);
      pdf.setTextColor(0, 0, 0);
      y += 12;

      pdf.setFontSize(16);
      pdf.text("Historial del Paciente", x, y);
      y += 10;

      pdf.setDrawColor(67, 173, 118);
      pdf.line(x, y, pageWidth - marginRight, y);
      y += 12;

      // --- Datos del paciente y del informe ---
      agregarTexto("Paciente:", paciente.nombre);
      agregarTexto("CURP:", paciente.curp);
      agregarTexto(
        "Fecha de registro:",
        formatearFecha(informe.fechaRegistro) +
          " " +
          formatearHora(informe.fechaRegistro),
      );
      agregarTexto("Peso (kg):", informe.pesoKg);
      agregarTexto("Estado General:", informe.estadoGeneral);

      agregarSubtitulo("Evaluación clínica");
      agregarTexto("Observaciones Manuales:", informe.observaciones);
      agregarTexto("Diagnóstico:", informe.diagnostico);
      agregarTexto("Síntomas:", informe.sintomas);
      agregarTexto("Tratamiento:", informe.tratamiento);
      agregarTexto("Evolución:", informe.evolucion);

      // --- Análisis de IA (texto) ---
      agregarSubtitulo("Análisis de IA");
      if (analisisIa && analisisIa.length > 0) {
        analisisIa.forEach((a) => {
          agregarTexto(
            `Pie ${a.pieType}:`,
            `${a.className} — confianza ${a.confidence}%`,
          );
        });
      } else {
        agregarTexto("Resultado IA:", "Sin análisis de IA registrado");
      }

      // --- Otros estudios (listado) ---
      agregarSubtitulo("Otros Estudios");
      if (documentos && documentos.length > 0) {
        documentos.forEach((d, i) => {
          agregarTexto(`${i + 1}.`, d.nombreDocumento);
        });
      } else {
        agregarTexto("", "Sin estudios adicionales");
      }

      // --- Descarga y conversión de las imágenes plantares ---
      const imagenesPie = [];
      for (const analisis of analisisIa || []) {
        const doc = documentos.find(
          (d) => d.idAnalisis === analisis.idAnalisis,
        );

        if (doc && doc.mimeType && doc.mimeType.startsWith("image/")) {
          try {
            const res = await GeneratedDownloadUrl(doc.storageKey);
            const base64 = await fetchImageAsBase64(res.downloadUrl);
            imagenesPie.push({
              pieType: analisis.pieType,
              base64,
              formato: formatoDeImagen(doc.mimeType),
            });
          } catch (e) {
            console.error("No se pudo cargar la imagen plantar: " + e);
          }
        }
      }

      // --- Página de imágenes (una por fila, centrada, sin deformar) ---
      if (imagenesPie.length > 0) {
        pdf.addPage();
        y = 20;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(67, 173, 118);
        pdf.text("Imágenes del Análisis Plantar", x, y);
        pdf.setTextColor(0, 0, 0);
        y += 15;

        // Tamaño máximo disponible: la imagen se ajusta dentro de esta caja
        // conservando su proporción real (nunca se estira ni se achata).
        const maxAncho = contentWidth;
        const maxAlto = 130;

        imagenesPie.forEach((img) => {
          let anchoImg = maxAncho;
          let altoImg = maxAlto;

          try {
            const props = pdf.getImageProperties(img.base64);
            const proporcion = props.width / props.height;

            anchoImg = maxAncho;
            altoImg = anchoImg / proporcion;

            if (altoImg > maxAlto) {
              altoImg = maxAlto;
              anchoImg = altoImg * proporcion;
            }
          } catch (e) {
            console.error(
              "No se pudieron leer las dimensiones de la imagen: " + e,
            );
          }

          saltoDePaginaSiHaceFalta(altoImg + 25);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.text(`Pie ${img.pieType}`, x, y);
          y += 6;

          const xImagen = x + (contentWidth - anchoImg) / 2; // centrada horizontalmente

          try {
            pdf.addImage(
              img.base64,
              img.formato,
              xImagen,
              y,
              anchoImg,
              altoImg,
              undefined,
              "FAST",
            );
          } catch (e) {
            console.log(e);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("No se pudo cargar esta imagen.", x, y + 10);
          }

          y += altoImg + 20;
        });
      }

      const nombreArchivo = `Historial-${paciente.nombre || "Paciente"}-${
        formatearFecha(informe.fechaRegistro) || informe.idInforme
      }.pdf`;

      pdf.save(nombreArchivo);
    } catch (e) {
      console.error("Error generando el PDF del historial: " + e);
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (!imagenesIA) return;

  return (
    <details className="historial-item" key={informe.idInforme}>
      <summary className="historial-resumen">
        <div>
          <h4>Cambio guardado {formatearFecha(informe.fechaRegistro)}</h4>
        </div>

        <button
          type="button"
          disabled={generandoPDF}
          onClick={async (e) => {
            e.preventDefault();
            await descargarRegistroPDF(informe);
          }}
        >
          {generandoPDF ? "Generando..." : "Descargar PDF"}
        </button>
      </summary>

      <div className="historial-contenido">
        <div className="historial-grid">
          <div className="historial-campo">
            <label>Nombre</label>
            <input value={paciente.nombre || ""} readOnly />
          </div>

          <div className="historial-campo">
            <label>CURP</label>
            <input value={paciente.curp || ""} readOnly />
          </div>

          <div className="historial-campo">
            <label>Fecha</label>
            <input
              value={formatearFecha(informe.fechaRegistro) || ""}
              readOnly
            />
          </div>

          <div className="historial-campo">
            <label>Hora</label>
            <input
              value={formatearHora(informe.fechaRegistro) || ""}
              readOnly
            />
          </div>

          <div className="historial-campo">
            <label>Peso</label>
            <input value={`${informe.pesoKg}Kg`} readOnly />
          </div>
        </div>

        <div className="historial-campo">
          <label>Estado General</label>
          <textarea value={informe.estadoGeneral || ""} readOnly />
        </div>

        <section className="historial-ai-panel">
          <div className="historial-ai-header">
            <span>Análisis AI</span>
          </div>

          <div className="historial-ai">
            <div>
              <div className="historial-imagenes">
                {imagenesIA.length > 0 ? (
                  imagenesIA.map((img) => (
                    <ImagenIA
                      key={img.idAnalisis}
                      analisisIA={img}
                      url={img.url}
                    />
                  ))
                ) : (
                  <span>Sin imágenes de análisis</span>
                )}
              </div>
            </div>
            <div className="historial-campo resultado-historial">
              <label>Resultado dado por IA</label>
              <textarea
                value={
                  analisisIa.length > 0
                    ? analisisIa
                        .map(
                          (a) =>
                            `Pie ${a.pieType} (${a.className}): confianza ${a.confidence}%`,
                        )
                        .join("\n")
                    : "Sin análisis de IA registrado"
                }
                readOnly
              />
            </div>
          </div>
        </section>

        <div className="historial-campo observacion-historial">
          <label>Observaciones Manuales</label>

          <textarea value={informe.observaciones || ""} readOnly />
        </div>

        <div className="historial-campo diagnostico-historial">
          <label>Diagnóstico</label>

          <textarea value={informe.diagnostico || ""} readOnly />
        </div>

        <div className="historial-campo">
          <label>Síntomas</label>
          <textarea value={informe.sintomas || ""} readOnly />
        </div>

        <div className="historial-campo">
          <label>Tratamiento</label>
          <textarea value={informe.tratamiento || ""} readOnly />
        </div>

        <div className="historial-campo">
          <label>Evoluciones</label>
          <textarea value={informe.evolucion || ""} readOnly />
        </div>

        {/*PRÓXIMA CONSULTA */}

        <div className="historial-proxima-consulta">
          <h4>Próxima consulta</h4>

          <div className="historial-grid">
            <div className="historial-campo">
              <label>Fecha de la próxima consulta</label>

              <input type="date" value={""} readOnly />
            </div>

            <div className="historial-campo">
              <label>Hora de la próxima consulta</label>

              <input type="time" value={""} readOnly />
            </div>
          </div>
        </div>

        {/* OTROS ESTUDIOS */}

        <div className="historial-otros-estudios">
          <h4>Otros Estudios</h4>

          {documentos.length > 0 ? (
            <div className="historial-lista-estudios">
              {documentos.map((d) => (
                <Estudio key={d.idDocumento} doc={d} />
              ))}
            </div>
          ) : (
            <div className="historial-sin-estudios">
              📁 No hay estudios adicionales guardados en este registro.
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

function ImagenIA({ analisisIA, url }) {
  return (
    <div>
      <label>Pie {analisisIA.pieType.toLowerCase()}</label>

      <div className="historial-imagen">
        {url ? (
          <img src={url} alt={`Pie ${analisisIA.pieType.toLowerCase()}`} />
        ) : (
          <span>Sin imagen</span>
        )}
      </div>
    </div>
  );
}

function VisorDocumento({ presignedUrl }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [headers, setHeaders] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelado = false;

    axios
      .get(presignedUrl, { responseType: "blob" })
      .then((response) => {
        if (cancelado) return;
        objectUrl = URL.createObjectURL(response.data);
        setHeaders(response.headers);
        setBlobUrl(objectUrl);
      })
      .catch((e) => console.error("No se pudo cargar el documento: " + e));

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [presignedUrl]);

  if (!blobUrl || !headers) return <p>Cargando...</p>;

  const contentType = headers["content-type"] || "";

  if (contentType.startsWith("image/")) {
    return <img src={blobUrl} alt="documento" style={{ maxWidth: "100%" }} />;
  }

  if (contentType === "application/pdf") {
    return (
      <iframe src={blobUrl} width="100%" height="600px" title="documento" />
    );
  }

  // tipo no soportado para preview — ofrecer descarga
  return (
    <a href={blobUrl} download>
      Descargar archivo
    </a>
  );
}

function Estudio({ doc }) {
  const [url, setUrl] = useState();
  const [mostrarVisor, setMostrarVisor] = useState(false);

  useEffect(() => {
    const getArchivo = async (storageKey) => {
      try {
        const res = await GeneratedDownloadUrl(storageKey);
        setUrl(res.downloadUrl);
      } catch (e) {
        console.error("No se pudo obtener el archivo: " + e);
      }
    };

    getArchivo(doc.storageKey);
  }, [doc.storageKey]);

  const icono =
    doc.mimeType === "application/pdf"
      ? "📄"
      : doc.mimeType?.startsWith("image/")
        ? "🖼️"
        : "📁";

  return (
    <div className="historial-estudio-item">
      <div className="historial-estudio-fila">
        <div className="historial-estudio-icono">{icono}</div>

        <div className="historial-estudio-info">
          <strong>{doc.nombreDocumento}</strong>

          <span>{formatearFecha(doc.fechaDocumento) || ""}</span>

          {doc.tamanoBytes ? (
            <span>{(doc.tamanoBytes / 1024 / 1024).toFixed(2)} MB</span>
          ) : null}
        </div>

        <button
          type="button"
          className="historial-btn-ver-estudio"
          disabled={!url}
          onClick={() => setMostrarVisor((visible) => !visible)}
        >
          {mostrarVisor ? "Ocultar" : "Ver"}
        </button>
      </div>

      {mostrarVisor && url && (
        <div className="historial-estudio-visor">
          <VisorDocumento presignedUrl={url} />
        </div>
      )}
    </div>
  );
}

export default HistorialPaciente;
