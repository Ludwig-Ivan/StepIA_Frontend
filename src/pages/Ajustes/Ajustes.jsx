import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Ajustes.css";
import {
  FaCircleHalfStroke,
  FaCompress,
  FaExpand,
  FaFont,
  FaMoon,
  FaPalette,
  FaSun,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";

import {
  obtenerApariencia,
  guardarApariencia,
  restaurarApariencia,
  aplicarApariencia,
} from "../../utils/apariencia";

import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import { obtenerByEmail } from "../../services/profesionalService.js";

const OPCIONES_TEMA = [
  {
    valor: "automatico",
    titulo: "Automático",
    descripcion: "Sigue el tema del sistema operativo.",
    icono: <FaCircleHalfStroke aria-hidden="true" />,
  },
  {
    valor: "claro",
    titulo: "Claro",
    descripcion: "Interfaz con fondos claros.",
    icono: <FaSun aria-hidden="true" />,
  },
  {
    valor: "oscuro",
    titulo: "Oscuro",
    descripcion: "Interfaz con fondos oscuros.",
    icono: <FaMoon aria-hidden="true" />,
  },
];

const OPCIONES_TAMANO = [
  {
    valor: "pequeno",
    titulo: "Pequeño",
    descripcion: "Más contenido en pantalla.",
    icono: <FaCompress aria-hidden="true" />,
  },
  {
    valor: "normal",
    titulo: "Normal",
    descripcion: "Tamaño estándar del sistema.",
    icono: <FaFont aria-hidden="true" />,
  },
  {
    valor: "grande",
    titulo: "Grande",
    descripcion: "Texto más amplio y legible.",
    icono: <FaExpand aria-hidden="true" />,
  },
];

function GrupoOpciones({
  id,
  titulo,
  descripcion,
  opciones,
  valor,
  onCambiar,
}) {
  const idTitulo = `ajuste-${id}-titulo`;

  return (
    <div className="ajuste-campo">
      <div className="ajuste-campo-texto">
        <h3 id={idTitulo}>{titulo}</h3>
        <p>{descripcion}</p>
      </div>

      <div
        className="ajuste-opciones"
        role="radiogroup"
        aria-labelledby={idTitulo}
      >
        {opciones.map((opcion) => {
          const activa = valor === opcion.valor;

          return (
            <label
              key={opcion.valor}
              className={`ajuste-opcion${activa ? " ajuste-opcion--activa" : ""}`}
            >
              <input
                type="radio"
                name={id}
                value={opcion.valor}
                checked={activa}
                onChange={() => onCambiar(opcion.valor)}
              />

              <span className="ajuste-opcion-icono">{opcion.icono}</span>

              <span className="ajuste-opcion-texto">
                <strong>{opcion.titulo}</strong>
                <small>{opcion.descripcion}</small>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Ajustes() {
  const navigate = useNavigate();

  const [tema, setTema] = useState("automatico");
  const [tamano, setTamano] = useState("normal");
  const [configGuardada, setConfigGuardada] = useState({
    tema: "automatico",
    tamano: "normal",
  });

  const [cargando, setCargando] = useState(true);
  const [confirmandoRestaurar, setConfirmandoRestaurar] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const emailUsuario = localStorage.getItem("UsuarioActivo");
  const [cargandoUser, setCargandoUser] = useState(true);
  const [errorUser, setErrorUser] = useState("");
  const [usuario, setUsuario] = useState(null);

  const cargarDoctor = useCallback(async () => {
    if (!emailUsuario) {
      navigate("/");
      return;
    }

    try {
      const doctor = await obtenerByEmail(emailUsuario);
      setUsuario(doctor);
    } catch {
      setErrorUser(
        "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
      );
    } finally {
      setCargandoUser(false);
    }
  }, [emailUsuario, navigate]);

  const reintentarUser = () => {
    setErrorUser("");
    setCargandoUser(true);
    cargarDoctor();
  };

  useEffect(() => {
    if (!emailUsuario) {
      navigate("/");
      return;
    }

    let activo = true;

    obtenerByEmail(emailUsuario)
      .then((doctor) => {
        if (activo) setUsuario(doctor);
      })
      .catch(() => {
        if (activo)
          setErrorUser(
            "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
          );
      })
      .finally(() => {
        if (activo) setCargandoUser(false);
      });

    return () => {
      activo = false;
    };
  }, [emailUsuario, navigate]);

  useEffect(() => {
    Promise.resolve().then(() => {
      const configuracion = obtenerApariencia();

      setTema(configuracion.tema);
      setTamano(configuracion.tamano);
      setConfigGuardada(configuracion);

      aplicarApariencia(configuracion);

      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => setMensaje(null), 5000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const hayCambios =
    tema !== configGuardada.tema || tamano !== configGuardada.tamano;

  const cambiarTema = (nuevoTema) => {
    setTema(nuevoTema);
    setMensaje(null);

    aplicarApariencia({ tema: nuevoTema, tamano });
  };

  const cambiarTamano = (nuevoTamano) => {
    setTamano(nuevoTamano);
    setMensaje(null);

    aplicarApariencia({ tema, tamano: nuevoTamano });
  };

  const guardar = () => {
    try {
      guardarApariencia({ tema, tamano });
      setConfigGuardada({ tema, tamano });

      setMensaje({
        texto: "Configuración de apariencia guardada.",
        severidad: "success",
      });
    } catch {
      setMensaje({
        texto:
          "No se pudo guardar la configuración. Verifica el almacenamiento del navegador.",
        severidad: "error",
      });
    }
  };

  const solicitarRestaurar = () => {
    setMensaje(null);
    setConfirmandoRestaurar(true);
  };

  const restaurar = () => {
    try {
      const configuracion = restaurarApariencia();

      setTema(configuracion.tema);
      setTamano(configuracion.tamano);
      setConfigGuardada({
        tema: configuracion.tema,
        tamano: configuracion.tamano,
      });

      setMensaje({
        texto: "Apariencia restaurada a los valores predeterminados.",
        severidad: "success",
      });
    } catch {
      setMensaje({
        texto: "No se pudo restaurar la apariencia.",
        severidad: "error",
      });
    } finally {
      setConfirmandoRestaurar(false);
    }
  };

  const cancelarRestaurar = () => setConfirmandoRestaurar(false);

  if (cargandoUser) {
    return (
      <div className="menu-page">
        <header className="top-menu" aria-hidden="true">
          <div className="top-menu-left">
            <div className="skeleton skeleton-logo" />
            <div className="skeleton skeleton-chip" />
          </div>
          <div className="top-menu-right">
            <div className="skeleton skeleton-chip" />
            <div className="skeleton skeleton-avatar" />
          </div>
        </header>

        <main className="menu-overlay" role="status">
          <div className="menu-skeleton-card">
            <div className="skeleton skeleton-stepai" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line--short" />
            <div className="skeleton skeleton-option" />
            <div className="skeleton skeleton-option" />
            <div className="skeleton skeleton-option" />
          </div>
        </main>
      </div>
    );
  }

  if (errorUser) {
    return (
      <div className="menu-page">
        <main className="menu-overlay" role="alert">
          <div className="menu-error-card">
            <h1>No se pudo cargar el panel</h1>
            <p>{errorUser}</p>
            <button
              type="button"
              className="btn btn-green"
              onClick={reintentarUser}
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ajustes-page">
      <HeaderComponent data={{ usuario }} />

      <main className="ajustes-main">
        {cargando ? (
          <div className="ajustes-carga" role="status" aria-live="polite">
            <span className="ajustes-spinner" aria-hidden="true" />
            Cargando configuración…
          </div>
        ) : (
          <>
            <div className="ajustes-titulo">
              <h1>Ajustes</h1>
              <p>Personaliza la apariencia del sistema StepIA.</p>
            </div>

            <section
              className="apariencia-card"
              aria-labelledby="apariencia-titulo"
            >
              <div className="apariencia-header">
                <div className="apariencia-icono" aria-hidden="true">
                  <FaPalette />
                </div>

                <div>
                  <h2 id="apariencia-titulo">Apariencia</h2>
                  <p>Personaliza cómo se visualiza el sistema.</p>
                </div>
              </div>

              <div className="apariencia-contenido">
                <GrupoOpciones
                  id="tema"
                  titulo="Tema"
                  descripcion="Selecciona el modo de visualización de StepIA."
                  opciones={OPCIONES_TEMA}
                  valor={tema}
                  onCambiar={cambiarTema}
                />

                <GrupoOpciones
                  id="tamano"
                  titulo="Tamaño de interfaz"
                  descripcion="Modifica el tamaño general del sistema."
                  opciones={OPCIONES_TAMANO}
                  valor={tamano}
                  onCambiar={cambiarTamano}
                />
              </div>

              <div className="apariencia-footer">
                {hayCambios && (
                  <span className="ajustes-hint" role="status">
                    Tienes cambios sin guardar.
                  </span>
                )}

                <div className="apariencia-acciones">
                  <ButtonComponent
                    config={{
                      name: "volver",
                      text: "Volver",
                      type: "button",
                      variant: "blue",
                    }}
                    onClick={() => navigate("/menu")}
                  />

                  <ButtonComponent
                    config={{
                      name: "restaurar",
                      text: "Restaurar",
                      type: "button",
                      variant: "white",
                    }}
                    onClick={solicitarRestaurar}
                  />

                  <ButtonComponent
                    config={{
                      name: "guardar",
                      text: "Guardar cambios",
                      type: "button",
                      variant: "green",
                    }}
                    onClick={guardar}
                  />
                </div>
              </div>
            </section>

            <Collapse in={Boolean(mensaje)}>
              <div
                className="ajustes-mensaje"
                role={mensaje?.severidad === "error" ? "alert" : "status"}
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

            <Collapse in={confirmandoRestaurar}>
              <div className="ajustes-confirmacion">
                <Alert
                  variant="filled"
                  severity="warning"
                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                >
                  ¿Deseas restaurar la apariencia predeterminada? Se perderán
                  los cambios sin guardar.
                </Alert>

                <div className="ajustes-confirmacion-acciones">
                  <ButtonComponent
                    config={{
                      name: "cancelar-restaurar",
                      text: "Cancelar",
                      type: "button",
                      variant: "white",
                    }}
                    onClick={cancelarRestaurar}
                  />

                  <ButtonComponent
                    config={{
                      name: "confirmar-restaurar",
                      text: "Restaurar",
                      type: "button",
                      variant: "purple",
                    }}
                    onClick={restaurar}
                  />
                </div>
              </div>
            </Collapse>
          </>
        )}
      </main>
    </div>
  );
}

export default Ajustes;
