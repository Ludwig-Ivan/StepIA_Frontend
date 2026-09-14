import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AnalisisPlantar.css";
import { registrarActividad } from "../../utils/historial";

function AnalisisPlantar() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [pieIzquierdo, setPieIzquierdo] = useState(null);
  const [pieDerecho, setPieDerecho] = useState(null);

  const [previewIzquierdo, setPreviewIzquierdo] = useState("");
  const [previewDerecho, setPreviewDerecho] = useState("");

  const [resultadoIA, setResultadoIA] = useState("");
  const [tipoPie, setTipoPie] = useState("");
  const [cargando, setCargando] = useState(false);

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

  useEffect(() => {
    const pacientesGuardados =
      JSON.parse(localStorage.getItem("pacientes")) || [];

    const pacientesConId = pacientesGuardados.map((paciente, index) => {
      const nssFinal =
        paciente.nss ||
        paciente.numeroRegistroSocial ||
        paciente.registroSocial ||
        "";

      return {
        ...paciente,

        nss: nssFinal,

        idPaciente: generarIdPaciente(
          {
            ...paciente,
            nss: nssFinal,
          },
          index,
        ),
      };
    });

    localStorage.setItem("pacientes", JSON.stringify(pacientesConId));

    setPacientes(pacientesConId);
  }, []);

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const texto = convertirTexto(busqueda);

    if (texto === "") {
      return true;
    }

    return (
      convertirTexto(paciente.nombre).includes(texto) ||
      convertirTexto(paciente.nss).includes(texto) ||
      convertirTexto(paciente.numeroRegistroSocial).includes(texto) ||
      convertirTexto(paciente.registroSocial).includes(texto) ||
      convertirTexto(paciente.fecha).includes(texto) ||
      convertirTexto(paciente.hora).includes(texto) ||
      convertirTexto(paciente.analisis).includes(texto)
    );
  });

  const seleccionarPaciente = (idPaciente) => {
    const paciente = pacientes.find((p) => p.idPaciente === idPaciente);

    if (!paciente) {
      setPacienteSeleccionado(null);

      return;
    }

    setPacienteSeleccionado(paciente);
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

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");

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
    } catch (error) {
      console.error(error);

      alert("Error al cargar la imagen");
    }
  };

  const analizarPies = async () => {
    if (!pacienteSeleccionado) {
      alert("Selecciona un paciente");

      return;
    }

    if (!pieIzquierdo || !pieDerecho) {
      alert("Debes cargar ambas imágenes de los pies");

      return;
    }

    setCargando(true);

    try {
      /*
        =========================================
        AQUÍ CONECTARÁS TU MODELO DE IA
        =========================================

        const formData =
          new FormData()

        formData.append(
          'pieIzquierdo',
          pieIzquierdo
        )

        formData.append(
          'pieDerecho',
          pieDerecho
        )

        const respuesta =
          await fetch(
            'http://localhost:5000/api/analizar-pies',
            {
              method: 'POST',
              body: formData
            }
          )

        const datos =
          await respuesta.json()

        setResultadoIA(
          datos.resultado
        )

        setTipoPie(
          datos.tipoPie
        )
        */

      setTimeout(() => {
        setResultadoIA(
          "Análisis generado por el modelo IA pendiente de conexión.",
        );

        setTipoPie("Tipo de pie pendiente");

        setCargando(false);
      }, 1200);
    } catch (error) {
      console.error(error);

      alert("Error al analizar las imágenes");

      setCargando(false);
    }
  };

  const guardarAnalisis = () => {
    if (!pacienteSeleccionado) {
      alert("Selecciona un paciente");

      return;
    }

    if (!previewIzquierdo || !previewDerecho) {
      alert("Carga ambas imágenes");

      return;
    }

    if (resultadoIA.trim() === "" || tipoPie.trim() === "") {
      alert("Primero presiona Analizar");

      return;
    }

    // =========================================
    // ACTUALIZAR PACIENTE
    // =========================================

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

    // =========================================
    // ACTUALIZAR LISTA DE PACIENTES
    // =========================================

    const pacientesActualizados = pacientes.map((paciente) => {
      if (paciente.idPaciente === pacienteSeleccionado.idPaciente) {
        return pacienteActualizado;
      }

      return paciente;
    });

    // =========================================
    // GUARDAR EN LOCALSTORAGE
    // =========================================

    localStorage.setItem("pacientes", JSON.stringify(pacientesActualizados));

    localStorage.setItem(
      "pacienteSeleccionado",
      JSON.stringify(pacienteActualizado),
    );

    // =========================================
    // REGISTRAR EN HISTORIAL
    // =========================================

    registrarActividad({
      tipo: "Análisis plantar",

      descripcion: "Se realizó un análisis plantar",

      paciente: pacienteSeleccionado.nombre || "Paciente",

      detalles: resultadoIA || "Análisis realizado correctamente",
    });

    // =========================================
    // ACTUALIZAR ESTADO
    // =========================================

    setPacientes(pacientesActualizados);

    setPacienteSeleccionado(pacienteActualizado);

    // =========================================
    // MENSAJE Y NAVEGACIÓN
    // =========================================

    alert("Análisis guardado en el informe del paciente");

    navigate("/informe-paciente");
  };

  return (
    <div className="analisis-page">
      <header className="analisis-header">
        <h2>StepIA</h2>
      </header>
      <main className="analisis-main">
        <section className="analisis-card">
          <h1>Análisis Plantar</h1>

          <p className="analisis-subtitle">
            Busca y selecciona un paciente registrado para guardar el análisis
            en su informe.
          </p>
          <div className="selector-paciente">
            <label>Buscar Paciente</label>
            <input
              type="text"
              placeholder="Buscar por nombre o número de registro social..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);

                setPacienteSeleccionado(null);
              }}
            />
          </div>
          <div className="selector-paciente">
            <label>Elegir Paciente</label>
            <select
              value={pacienteSeleccionado?.idPaciente || ""}
              onChange={(e) => seleccionarPaciente(e.target.value)}
            >
              <option value="">
                {pacientesFiltrados.length > 0
                  ? "Selecciona un paciente"
                  : "No hay coincidencias"}
              </option>

              {pacientesFiltrados.map((paciente) => (
                <option key={paciente.idPaciente} value={paciente.idPaciente}>
                  {paciente.nombre || "Sin nombre"}

                  {" | NSS: "}

                  {paciente.curp || "Sin registro"}

                  {" | "}

                  {paciente.fechaNacimiento || "Sin fecha"}
                </option>
              ))}
            </select>
          </div>

          {pacienteSeleccionado && (
            <div className="paciente-seleccionado">
              Paciente seleccionado:{" "}
              <strong>{pacienteSeleccionado.nombre}</strong>
            </div>
          )}

          {pacientes.length === 0 && (
            <div className="sin-pacientes">
              No hay pacientes registrados. Primero registra un paciente.
            </div>
          )}

          {pacientes.length > 0 && pacientesFiltrados.length === 0 && (
            <div className="sin-pacientes">
              No se encontraron pacientes con esa búsqueda.
            </div>
          )}

          <div className="pies-container">
            <div className="pie-upload">
              <label>Pie Izquierdo</label>

              <div className="pie-box">
                {previewIzquierdo ? (
                  <img src={previewIzquierdo} alt="Pie izquierdo" />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>

              <label className="btn-subir-imagen">
                Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => cargarImagen(e, "izquierdo")}
                />
              </label>
            </div>

            <div className="pie-upload">
              <label>Pie Derecho</label>

              <div className="pie-box">
                {previewDerecho ? (
                  <img src={previewDerecho} alt="Pie derecho" />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>

              <label className="btn-subir-imagen">
                Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => cargarImagen(e, "derecho")}
                />
              </label>
            </div>
          </div>

          <div className="resultado-panel">
            <div className="resultado-campo">
              <label>Resultado IA</label>

              <textarea
                value={resultadoIA}
                placeholder="Resultado generado por IA..."
                readOnly
              />
            </div>

            <div className="tipo-pie-campo">
              <label>Tipo de Pie</label>

              <input
                type="text"
                placeholder="Tipo de Pie"
                value={tipoPie}
                readOnly
              />
            </div>
          </div>

          <div className="analisis-buttons">
            <button
              type="button"
              className="btn-volver-form"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>

            <button
              type="button"
              className="btn-analizar"
              onClick={analizarPies}
              disabled={cargando || pacientes.length === 0}
            >
              {cargando ? "Analizando..." : "Analizar"}
            </button>

            <button
              type="button"
              className="btn-siguiente"
              onClick={guardarAnalisis}
              disabled={pacientes.length === 0}
            >
              Guardar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AnalisisPlantar;
