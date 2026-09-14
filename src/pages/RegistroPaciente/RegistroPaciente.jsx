import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroPaciente.css";
import { PacienteCreateModel } from "../../models/pacientes/pacienteCreateModel.js";
import { registrarActividad } from "../../utils/historial";
import { createPaciente } from "../../services/pacienteService.js";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import CAMPOS_REGISTRO_PACIENTES from "../../data/Campos.js";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";

function RegistroPaciente() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(PacienteCreateModel());

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const nuevosDatos = {
      ...paciente,
      [name]: value,
    };

    setPaciente(PacienteCreateModel(nuevosDatos));
  };

  const limpiar = () => {
    setPaciente(PacienteCreateModel());
  };

  function validarCampos() {
    if (
      paciente.nombre.trim() === "" ||
      paciente.apellidoPaterno.toString().trim() === "" ||
      paciente.apellidoMaterno.toString().trim() === ""
    ) {
      alert("Nombre, Número de Registro Social y Peso son obligatorios");
      return false;
    }

    if (paciente.telefono.trim() !== "" && isNaN(Number(paciente.telefono))) {
      alert("El teléfono debe ser numérico");
      return false;
    }

    return true;
  }

  const siguiente = async () => {
    if (!validarCampos()) {
      return;
    }
    await createPaciente(PacienteCreateModel(paciente));
    localStorage.setItem("idPaciente", paciente.curp);
    console.log("Paciente Creado con exito");

    registrarActividad({
      tipo: "Registro de paciente",
      descripcion: "Se capturaron los datos generales del paciente",
      paciente: paciente.nombre,
      detalles: `CURP: ${paciente.curp}`,
    });

    navigate("/expediente");
  };

  return (
    <div className="registro-page">
      <header className="registro-header">
        <h2>StepIA</h2>
      </header>

      <main className="registro-main">
        <section className="registro-card">
          <h1>Registro Paciente</h1>
          <form className="registro-form">
            {CAMPOS_REGISTRO_PACIENTES.map((campo) => {
              return (
                <InputComponent
                  key={campo.key}
                  config={{
                    value: paciente[campo.key],
                    func: manejarCambio,
                    ...campo.config,
                  }}
                  style={{ marginBottom: 8 }}
                />
              );
            })}

            <div className="registro-buttons">
              <ButtonComponent
                config={{
                  name: "volver",
                  text: "Volver",
                  variant: "white",
                }}
                onClick={() => navigate(-1)}
              />

              <ButtonComponent
                config={{
                  name: "limpiar",
                  text: "Limpiar",
                  variant: "blue",
                }}
                onClick={limpiar}
              />

              <ButtonComponent
                config={{
                  name: "siguiente",
                  text: "Siguiente",
                  variant: "green",
                }}
                onClick={siguiente}
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default RegistroPaciente;
