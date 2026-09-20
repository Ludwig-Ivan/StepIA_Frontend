import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createElement } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./HistorialPaciente.css";
import { getPacienteById } from "../../services/pacienteService";
import { getInformeByPaciente } from "../../services/informeService";
import { getAnalisisByInforme } from "../../services/analisisService";
import { getDocumentosByInforme } from "../../services/documentService";
import { GeneratedDownloadUrl } from "../../services/documentCloudService";
import { FaUserAlt } from "react-icons/fa";
import {
  FaDownload,
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFolderOpen,
  FaMagnifyingGlass,
  FaXmark,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";

const TAMANO_PAGINA = 5;

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatearHora = (fechaISO) => {
  if (!fechaISO) return "";
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchImagenComoBase64 = (url) => {
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

const obtenerIconoDocumento = (mimeType) => {
  if (mimeType === "application/pdf") return FaFilePdf;
  if (mimeType?.startsWith("image/")) return FaFileImage;
  return FaFile;
};

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

const generarPdfHistorial = async (informe, paciente, analisis, documentos) => {
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

  agregarSubtitulo("Análisis de IA");
  if (analisis && analisis.length > 0) {
    analisis.forEach((a) => {
      agregarTexto(
        `Pie ${a.pieType}:`,
        `${a.className} — confianza ${a.confidence}%`,
      );
    });
  } else {
    agregarTexto("Resultado IA:", "Sin análisis de IA registrado");
  }

  agregarSubtitulo("Otros Estudios");
  if (documentos && documentos.length > 0) {
    documentos.forEach((d, i) => {
      agregarTexto(`${i + 1}.`, d.nombreDocumento);
    });
  } else {
    agregarTexto("", "Sin estudios adicionales");
  }

  const docsPorAnalisis = new Map();

  (documentos || []).forEach((d) => {
    if (d.idAnalisis && !docsPorAnalisis.has(d.idAnalisis)) {
      docsPorAnalisis.set(d.idAnalisis, d);
    }
  });

  const imagenesPie = (
    await Promise.all(
      (analisis || []).map(async (analisisItem) => {
        const doc = docsPorAnalisis.get(analisisItem.idAnalisis);

        if (!doc || !doc.mimeType || !doc.mimeType.startsWith("image/")) {
          return null;
        }

        try {
          const res = await GeneratedDownloadUrl(doc.storageKey);
          const base64 = await fetchImagenComoBase64(res.downloadUrl);
          return {
            pieType: analisisItem.pieType,
            base64,
            formato: formatoDeImagen(doc.mimeType),
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter(Boolean);

  if (imagenesPie.length > 0) {
    pdf.addPage();
    y = 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(67, 173, 118);
    pdf.text("Imágenes del Análisis Plantar", x, y);
    pdf.setTextColor(0, 0, 0);
    y += 15;

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
      } catch {
        // Se conservan las dimensiones máximas de la caja
      }

      saltoDePaginaSiHaceFalta(altoImg + 25);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(`Pie ${img.pieType}`, x, y);
      y += 6;

      const xImagen = x + (contentWidth - anchoImg) / 2;

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
      } catch {
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
};

function HeaderHistorialPaciente({ onMenu }) {
  return (
    <header className="historial-header">
      <button type="button" className="historial-logo" onClick={onMenu}>
        StepIA
      </button>

      <div className="historial-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="historial-user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

function EstadoCarga() {
  return (
    <div className="historial-carga" role="status" aria-live="polite">
      <span className="historial-spinner" aria-hidden="true" />
      <p>Cargando historial del paciente…</p>
    </div>
  );
}

function EstadoVacio({ onRegistrarInforme, onVolver }) {
  return (
    <section className="historial-vacio">
      <div className="historial-vacio-icono" aria-hidden="true">
        <FaFolderOpen />
      </div>

      <h2>Sin informes registrados</h2>

      <p>
        Este paciente aún no tiene cambios guardados en el historial. Registra
        su primer informe para comenzar a construir su expediente.
      </p>

      <div className="historial-vacio-botones">
        <ButtonComponent
          config={{
            name: "registrar-informe",
            text: "Registrar informe",
            type: "button",
            variant: "green",
          }}
          onClick={onRegistrarInforme}
        />

        <ButtonComponent
          config={{
            name: "volver-lista",
            text: "Volver a la lista",
            type: "button",
            variant: "blue",
          }}
          onClick={onVolver}
        />
      </div>
    </section>
  );
}

function EstadoSinResultados({ onLimpiarBusqueda }) {
  return (
    <section className="historial-vacio">
      <div className="historial-vacio-icono" aria-hidden="true">
        <FaMagnifyingGlass />
      </div>

      <h2>Sin coincidencias</h2>

      <p>
        No se encontraron registros con el término buscado en esta página.
        Prueba con otras palabras o limpia la búsqueda.
      </p>

      <ButtonComponent
        config={{
          name: "limpiar-busqueda",
          text: "Limpiar búsqueda",
          type: "button",
          variant: "blue",
        }}
        onClick={onLimpiarBusqueda}
      />
    </section>
  );
}

function EstadoError({ onReintentar, onVolver }) {
  return (
    <section className="historial-error">
      <Alert
        variant="filled"
        severity="error"
        role="alert"
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      >
        No se pudo cargar el historial del paciente. Verifica tu conexión e
        inténtalo de nuevo.
      </Alert>

      <div className="historial-error-botones">
        <ButtonComponent
          config={{ name: "reintentar", text: "Reintentar", type: "button", variant: "green" }}
          onClick={onReintentar}
        />

        <ButtonComponent
          config={{ name: "volver-lista", text: "Volver a la lista", type: "button", variant: "blue" }}
          onClick={onVolver}
        />
      </div>
    </section>
  );
}

function CampoHistorial({ etiqueta, valor, multiline }) {
  return (
    <div className="historial-campo">
      <span className="historial-campo-rotulo">{etiqueta}</span>
      <div className={`historial-valor${multiline ? " historial-valor--leer" : ""}`}>
        {valor || "Sin dato"}
      </div>
    </div>
  );
}

function ImagenIA({ analisisIA, url }) {
  const textoPie = `Pie ${(analisisIA.pieType || "desconocido").toLowerCase()}`;

  return (
    <figure className="historial-imagen-caja">
      <figcaption>{textoPie}</figcaption>

      <div className="historial-imagen">
        {url ? (
          <img src={url} alt={textoPie} />
        ) : (
          <span>Sin imagen</span>
        )}
      </div>
    </figure>
  );
}

function PanelAiHistorial({ cargando, error, analisisIa, imagenesIA }) {
  const textoResultado =
    analisisIa.length > 0
      ? analisisIa
          .map(
            (a) =>
              `Pie ${a.pieType} (${a.className}): confianza ${a.confidence}%`,
          )
          .join("\n")
      : "Sin análisis de IA registrado";

  return (
    <section className="historial-ai-panel" aria-label="Análisis de IA">
      <div className="historial-ai-header">
        <span>Análisis AI</span>
      </div>

      {cargando ? (
        <div className="historial-carga-recursos" role="status" aria-live="polite">
          <span className="historial-spinner historial-spinner--mini" aria-hidden="true" />
          Cargando análisis…
        </div>
      ) : error ? (
        <p className="historial-recursos-error" role="status">
          No se pudieron cargar los análisis de este informe.
        </p>
      ) : (
        <div className="historial-ai">
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
              <p className="historial-sin-imagenes">Sin imágenes de análisis</p>
            )}
          </div>

          <CampoHistorial
            etiqueta="Resultado dado por IA"
            valor={textoResultado}
            multiline
          />
        </div>
      )}
    </section>
  );
}

function VisorDocumento({ presignedUrl, alt }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [error, setError] = useState("");

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
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar el documento.");
      });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [presignedUrl]);

  if (error) return <p className="historial-recursos-error">{error}</p>;

  if (!blobUrl || !headers) {
    return (
      <div className="historial-carga-recursos" role="status" aria-live="polite">
        <span className="historial-spinner historial-spinner--mini" aria-hidden="true" />
        Cargando documento…
      </div>
    );
  }

  const contentType = headers["content-type"] || "";

  if (contentType.startsWith("image/")) {
    return <img src={blobUrl} alt={alt || "Documento adjunto"} style={{ maxWidth: "100%" }} />;
  }

  if (contentType === "application/pdf") {
    return (
      <iframe
        src={blobUrl}
        width="100%"
        height="600px"
        title={alt || "Documento adjunto"}
        sandbox="allow-same-origin"
      />
    );
  }

  return (
    <a href={blobUrl} download>
      Descargar archivo
    </a>
  );
}

function Estudio({ doc }) {
  const [url, setUrl] = useState(null);
  const [mostrarVisor, setMostrarVisor] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const getArchivo = async (storageKey) => {
      try {
        const res = await GeneratedDownloadUrl(storageKey);
        if (!cancelado) setUrl(res.downloadUrl);
      } catch {
        if (!cancelado) setUrl(null);
      }
    };

    getArchivo(doc.storageKey);

    return () => {
      cancelado = true;
    };
  }, [doc.storageKey]);

  return (
    <div className="historial-estudio-item">
      <div className="historial-estudio-fila">
        <div className="historial-estudio-icono" aria-hidden="true">
          {createElement(obtenerIconoDocumento(doc.mimeType))}
        </div>

        <div className="historial-estudio-info">
          <strong>{doc.nombreDocumento}</strong>

          <span>{formatearFecha(doc.fechaDocumento)}</span>

          {doc.tamanoBytes ? (
            <span>{(doc.tamanoBytes / 1024 / 1024).toFixed(2)} MB</span>
          ) : null}
        </div>

        <button
          type="button"
          className="historial-btn-ver-estudio"
          disabled={!url}
          aria-expanded={mostrarVisor}
          onClick={() => setMostrarVisor((visible) => !visible)}
        >
          {!url ? "Cargando…" : mostrarVisor ? "Ocultar" : "Ver"}
        </button>
      </div>

      {mostrarVisor && url && (
        <div className="historial-estudio-visor">
          <VisorDocumento presignedUrl={url} alt={doc.nombreDocumento} />
        </div>
      )}
    </div>
  );
}

function EstudiosHistorial({ cargando, error, documentos }) {
  return (
    <section className="historial-otros-estudios" aria-label="Otros estudios">
      <h4>Otros Estudios</h4>

      {cargando ? (
        <div className="historial-carga-recursos" role="status" aria-live="polite">
          <span className="historial-spinner historial-spinner--mini" aria-hidden="true" />
          Cargando estudios…
        </div>
      ) : error ? (
        <p className="historial-recursos-error" role="status">
          No se pudieron cargar los estudios de este informe.
        </p>
      ) : documentos.length > 0 ? (
        <div className="historial-lista-estudios">
          {documentos.map((d) => (
            <Estudio key={d.idDocumento} doc={d} />
          ))}
        </div>
      ) : (
        <div className="historial-sin-estudios">
          No hay estudios adicionales guardados en este registro.
        </div>
      )}
    </section>
  );
}

function HistorialRow({ informe, paciente }) {
  const [documentos, setDocumentos] = useState([]);
  const [analisisIa, setAnalisisIa] = useState([]);
  const [imagenesIA, setImagenesIA] = useState([]);
  const [cargandoRecursos, setCargandoRecursos] = useState(true);
  const [errorRecursos, setErrorRecursos] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [errorPdf, setErrorPdf] = useState("");

  useEffect(() => {
    let cancelado = false;

    const obtenerDocumentos = async (idInforme) => {
      try {
        const dataAnalisis = await getAnalisisByInforme(idInforme);
        if (cancelado) return;
        setAnalisisIa(dataAnalisis);

        const dataDocumentos = await getDocumentosByInforme(idInforme);
        if (cancelado) return;
        setDocumentos(dataDocumentos);

        const docsPorAnalisis = new Map();

        dataDocumentos.forEach((d) => {
          if (d.idAnalisis && !docsPorAnalisis.has(d.idAnalisis)) {
            docsPorAnalisis.set(d.idAnalisis, d);
          }
        });

        const imagenes = await Promise.all(
          dataAnalisis.map(async (analisis) => {
            const doc = docsPorAnalisis.get(analisis.idAnalisis);

            if (!doc || !doc.mimeType?.startsWith("image/")) {
              return { ...analisis, url: null };
            }

            try {
              const res = await GeneratedDownloadUrl(doc.storageKey);
              return { ...analisis, url: res.downloadUrl };
            } catch {
              return { ...analisis, url: null };
            }
          }),
        );

        if (cancelado) return;
        setImagenesIA(imagenes);
      } catch {
        if (!cancelado) setErrorRecursos(true);
      } finally {
        if (!cancelado) setCargandoRecursos(false);
      }
    };

    obtenerDocumentos(informe.idInforme);

    return () => {
      cancelado = true;
    };
  }, [informe.idInforme]);

  const descargarPDF = async () => {
    if (generandoPDF) return;

    setGenerandoPDF(true);
    setErrorPdf("");

    try {
      await generarPdfHistorial(informe, paciente, analisisIa, documentos);
    } catch {
      setErrorPdf(
        "No se pudo generar el PDF del historial. Inténtalo de nuevo.",
      );
    } finally {
      setGenerandoPDF(false);
    }
  };

  const fechaRegistro = formatearFecha(informe.fechaRegistro);
  const horaRegistro = formatearHora(informe.fechaRegistro);

  return (
    <details className="historial-item">
      <summary className="historial-resumen">
        <div>
          <h4>Cambio guardado {fechaRegistro || ""}</h4>
          {horaRegistro && <span>{horaRegistro} hrs</span>}
        </div>

        <button
          type="button"
          className="historial-btn-pdf"
          disabled={generandoPDF}
          aria-label={`Descargar PDF del informe del ${fechaRegistro || "paciente"}`}
          onClick={(e) => {
            e.preventDefault();
            descargarPDF();
          }}
        >
          <FaDownload aria-hidden="true" />
          {generandoPDF ? "Generando…" : "Descargar PDF"}
        </button>
      </summary>

      <div className="historial-contenido">
        <Collapse in={Boolean(errorPdf)}>
          <div className="historial-mensaje" role="status">
            <Alert
              variant="filled"
              severity="error"
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            >
              {errorPdf}
            </Alert>
          </div>
        </Collapse>

        <div className="historial-grid">
          <CampoHistorial etiqueta="Nombre" valor={paciente.nombre} />
          <CampoHistorial etiqueta="CURP" valor={paciente.curp} />
          <CampoHistorial etiqueta="Fecha" valor={fechaRegistro} />
          <CampoHistorial etiqueta="Hora" valor={horaRegistro} />
          <CampoHistorial
            etiqueta="Peso"
            valor={informe.pesoKg ? `${informe.pesoKg} Kg` : ""}
          />
        </div>

        <CampoHistorial etiqueta="Estado General" valor={informe.estadoGeneral} multiline />

        <PanelAiHistorial
          cargando={cargandoRecursos}
          error={errorRecursos}
          analisisIa={analisisIa}
          imagenesIA={imagenesIA}
        />

        <CampoHistorial etiqueta="Observaciones Manuales" valor={informe.observaciones} multiline />
        <CampoHistorial etiqueta="Diagnóstico" valor={informe.diagnostico} multiline />

        <div className="historial-grid">
          <CampoHistorial etiqueta="Síntomas" valor={informe.sintomas} multiline />
          <CampoHistorial etiqueta="Tratamiento" valor={informe.tratamiento} multiline />
          <CampoHistorial etiqueta="Evoluciones" valor={informe.evolucion} multiline />
        </div>

        <section className="historial-proxima-consulta" aria-label="Próxima consulta">
          <h4>Próxima consulta</h4>

          <div className="historial-grid">
            <CampoHistorial etiqueta="Fecha de la próxima consulta" valor="" />
            <CampoHistorial etiqueta="Hora de la próxima consulta" valor="" />
          </div>
        </section>

        <EstudiosHistorial
          cargando={cargandoRecursos}
          error={errorRecursos}
          documentos={documentos}
        />
      </div>
    </details>
  );
}

function ListaInformes({ informes, paciente }) {
  return (
    <div className="historial-lista">
      {informes.map((informe) => (
        <HistorialRow
          key={informe.idInforme}
          informe={informe}
          paciente={paciente}
        />
      ))}
    </div>
  );
}

function PaginacionHistorial({ pagina, totalPaginas, onIrAPagina, deshabilitado }) {
  return (
    <nav className="historial-paginacion" aria-label="Paginación del historial">
      <button
        type="button"
        className="historial-pagina-boton"
        aria-label="Página anterior"
        onClick={() => onIrAPagina(pagina - 1)}
        disabled={deshabilitado || pagina <= 0}
      >
        ‹
      </button>

      {crearPaginas(pagina, totalPaginas).map((itemPagina, indice) =>
        itemPagina.elipsis ? (
          <span
            key={`elipsis-${indice}`}
            className="historial-pagina-elipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={itemPagina.valor}
            type="button"
            className={`historial-pagina-boton${itemPagina.valor === pagina ? " historial-pagina-boton--activa" : ""}`}
            aria-label={`Página ${itemPagina.valor + 1}`}
            aria-current={itemPagina.valor === pagina ? "page" : undefined}
            onClick={() => onIrAPagina(itemPagina.valor)}
            disabled={deshabilitado}
          >
            {itemPagina.valor + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className="historial-pagina-boton"
        aria-label="Página siguiente"
        onClick={() => onIrAPagina(pagina + 1)}
        disabled={deshabilitado || pagina >= totalPaginas - 1}
      >
        ›
      </button>
    </nav>
  );
}

function HistorialPaciente() {
  const navigate = useNavigate();
  const solicitudActual = useRef(0);
  const pacienteRef = useRef(null);

  const [paciente, setPaciente] = useState(null);
  const [informes, setInformes] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = useCallback((id, paginaNueva) => {
    const idSolicitud = ++solicitudActual.current;

    setCargando(true);
    setError("");

    const peticionPaciente =
      pacienteRef.current === null
        ? getPacienteById(id).then((p) => {
            pacienteRef.current = p;
            return p;
          })
        : Promise.resolve(pacienteRef.current);

    peticionPaciente
      .then((pac) =>
        Promise.all([
          pac,
          getInformeByPaciente(id, paginaNueva, TAMANO_PAGINA),
        ]),
      )
      .then(([pac, info]) => {
        if (idSolicitud !== solicitudActual.current) return;

        setPaciente(pac);
        setInformes(info);
        setPagina(info.number ?? paginaNueva);
        setTotalElementos(info.totalElements ?? 0);
        setTotalPaginas(info.totalPages || 1);
        setCargando(false);
      })
      .catch(() => {
        if (idSolicitud !== solicitudActual.current) return;

        setError(
          "No se pudo cargar el historial del paciente. Verifica tu conexión e inténtalo de nuevo.",
        );
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("idPaciente");

    if (!id) {
      navigate("/lista-pacientes");
      return;
    }

    Promise.resolve().then(() => cargarDatos(id, 0));
  }, [cargarDatos, navigate]);

  const informesFiltrados = useMemo(() => {
    const contenido = informes?.content || [];
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return contenido;

    return contenido.filter((informe) =>
      [
        informe.diagnostico,
        informe.estadoGeneral,
        informe.observaciones,
        formatearFecha(informe.fechaRegistro),
      ].some(
        (valor) => typeof valor === "string" && valor.toLowerCase().includes(texto),
      ),
    );
  }, [informes, busqueda]);

  const tieneInformes = totalElementos > 0;
  const hayBusqueda = busqueda.trim() !== "";
  const inicio = tieneInformes ? pagina * TAMANO_PAGINA + 1 : 0;
  const fin = Math.min((pagina + 1) * TAMANO_PAGINA, totalElementos);

  const irAPagina = (nuevaPagina) => {
    const id = localStorage.getItem("idPaciente");

    if (
      !id ||
      cargando ||
      nuevaPagina === pagina ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    cargarDatos(id, nuevaPagina);
  };

  const reintentar = () => {
    const id = localStorage.getItem("idPaciente");
    if (id) cargarDatos(id, pagina);
  };

  const renderContenido = () => {
    if (cargando && !informes) return <EstadoCarga />;

    if (error || !tieneInformes) {
      return error ? (
        <EstadoError
          onReintentar={reintentar}
          onVolver={() => navigate("/lista-pacientes")}
        />
      ) : (
        <EstadoVacio
          onRegistrarInforme={() => navigate("/informe-paciente")}
          onVolver={() => navigate("/lista-pacientes")}
        />
      );
    }

    if (informesFiltrados.length === 0) {
      return (
        <EstadoSinResultados onLimpiarBusqueda={() => setBusqueda("")} />
      );
    }

    return (
      <>
        <ListaInformes informes={informesFiltrados} paciente={paciente} />

        {totalPaginas > 1 && (
          <PaginacionHistorial
            pagina={pagina}
            totalPaginas={totalPaginas}
            onIrAPagina={irAPagina}
            deshabilitado={cargando}
          />
        )}
      </>
    );
  };

  return (
    <div className="historial-page">
      <HeaderHistorialPaciente onMenu={() => navigate("/menu")} />

      <main className="historial-main">
        <section className="historial-card" aria-labelledby="historial-titulo">
          <div className="historial-top">
            <div>
              <h3 id="historial-titulo">Historial del Paciente</h3>
              <p>{paciente ? `${paciente.nombre}${paciente.curp ? ` • ${paciente.curp}` : ""}` : "Cargando…"}</p>
            </div>

            <ButtonComponent
              config={{
                name: "volver",
                text: "Volver",
                type: "button",
                variant: "blue",
              }}
              onClick={() => navigate("/lista-pacientes")}
            />
          </div>

          {tieneInformes && !error && (
            <search className="historial-buscador">
              <label className="sr-only" htmlFor="historial-input-busqueda">
                Buscar en el historial
              </label>

              <FaMagnifyingGlass className="historial-buscador-icono" aria-hidden="true" />

              <input
                id="historial-input-busqueda"
                type="search"
                placeholder="Buscar por diagnóstico, estado general, observaciones…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              {busqueda && (
                <button
                  type="button"
                  className="historial-clear"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setBusqueda("")}
                >
                  <FaXmark aria-hidden="true" />
                </button>
              )}
            </search>
          )}

          {cargando && informes ? (
            <p className="historial-carga-ligera" role="status" aria-live="polite">
              <span className="historial-spinner historial-spinner--mini" aria-hidden="true" />
              Cargando…
            </p>
          ) : null}

          {tieneInformes && !error && informesFiltrados.length > 0 && (
            <p className="historial-meta" role="status" aria-live="polite">
              Mostrando {inicio}–{fin} de {totalElementos} registro
              {totalElementos === 1 ? "" : "s"}
              {hayBusqueda
                ? ` · ${informesFiltrados.length} coincidencia${informesFiltrados.length === 1 ? "" : "s"} en esta página`
                : ""}
            </p>
          )}

          {renderContenido()}
        </section>
      </main>
    </div>
  );
}

export default HistorialPaciente;