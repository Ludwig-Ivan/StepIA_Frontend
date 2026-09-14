import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Expediente.css";
import { expedienteCreateModel } from "../../models/expedientes/expedienteCreateModel.js";
import { createExpediente } from "../../services/expedienteService.js";

function Expediente() {
  const navigate = useNavigate();

  const idPaciente = localStorage.getItem("idPaciente");
  const [expediente, setExpediente] = useState(expedienteCreateModel());
  const [carga, setCarga] = useState(true);

  useEffect(() => {
    const obtenerPaciente = async () => {
      try {
        setExpediente({
          ...expediente,
          idPaciente: idPaciente,
          numeroExpediente: "EXP-" + idPaciente,
          estado: "ACTIVO",
        });
      } catch (error) {
        console.log("Error, no se encontro al paciente", error);
        navigate("/registro-paciente");
      } finally {
        setCarga(false);
      }
    };

    obtenerPaciente();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const nuevosDatos = {
      ...expediente,
      [name]: value,
    };

    setExpediente(expedienteCreateModel(nuevosDatos));
  };

  const guardarExpediente = async () => {
    await createExpediente(expediente);

    console.log("Expediente guardado correctamente");
    navigate("/informe-paciente");
  };

  if (carga)
    return (
      <div className="loading-screen">
        <h2>Cargando...</h2>
        <p>Obteniendo información del paciente</p>
      </div>
    );

  return (
    <div className="datos-page">
      <header className="datos-header">
        <h2>StepIA</h2>
      </header>

      <main className="datos-main">
        <section className="datos-card">
          <h1>Expediente</h1>

          <form className="datos-form">
            <div className="datos-group">
              <label>Antecedentes</label>
              <textarea
                name="antecedentes"
                placeholder="Antecedentes del paciente"
                value={expediente.antecedentes}
                onChange={manejarCambio}
              ></textarea>
            </div>

            <div className="datos-buttons">
              <button
                type="button"
                className="btn-volver-form"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>

              <button
                type="button"
                className="btn-anterior"
                onClick={() => navigate("/registro-paciente")}
              >
                Anterior
              </button>

              <button
                type="button"
                className="btn-siguiente"
                onClick={guardarExpediente}
              >
                Siguiente
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Expediente;
