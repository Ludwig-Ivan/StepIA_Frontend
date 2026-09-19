import { useNavigate } from "react-router-dom";
import "./RegistroPaciente.css";
import { PacienteCreateModel } from "../../models/pacientes/pacienteCreateModel.js";
import { registrarActividad } from "../../utils/historial";
import { createPaciente } from "../../services/pacienteService.js";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import CAMPOS_REGISTRO_PACIENTES from "../../data/Campos.js";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { PacienteModel } from "../../schema/PacienteSchema.js";

function RegistroPaciente() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: PacienteCreateModel(),
  });

  function validarCampos(data) {
    if (
      data.nombre.trim() === "" ||
      data.apellidoPaterno.toString().trim() === "" ||
      data.apellidoMaterno.toString().trim() === ""
    ) {
      alert("Nombre, Número de Registro Social y Peso son obligatorios");
      return false;
    }

    if (data.telefono.trim() !== "" && isNaN(Number(data.telefono))) {
      alert("El teléfono debe ser numérico");
      return false;
    }

    return true;
  }

  const registrarPaciente = async (data) => {
    if (!validarCampos(data)) {
      return;
    }
    console.log(data);
    await createPaciente(data);
    localStorage.setItem("idPaciente", data.curp);
    console.log("Paciente Creado con exito");

    registrarActividad({
      tipo: "Registro de paciente",
      descripcion: "Se capturaron los datos generales del paciente",
      paciente: data.nombre,
      detalles: `CURP: ${data.curp}`,
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
          <form
            className="registro-form"
            onSubmit={handleSubmit(registrarPaciente)}
          >
            {CAMPOS_REGISTRO_PACIENTES.map((campo) => {
              return (
                <Controller
                  key={campo.key}
                  name={campo.key}
                  control={control}
                  render={({ field }) => (
                    <InputComponent
                      config={{
                        value: field.value,
                        func: field.onChange,
                        ...campo.config,
                      }}
                      containerStyle={{ marginBottom: 8 }}
                    />
                  )}
                />
              );
            })}

            <div className="registro-buttons">
              <ButtonComponent
                config={{
                  name: "volver",
                  text: "Volver",
                  variant: "white",
                  type: "button",
                }}
                onClick={() => navigate(-1)}
              />

              <ButtonComponent
                config={{
                  name: "limpiar",
                  text: "Limpiar",
                  variant: "blue",
                  type: "reset",
                }}
              />

              <ButtonComponent
                config={{
                  name: "siguiente",
                  text: "Siguiente",
                  variant: "green",
                  type: "submit",
                }}
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default RegistroPaciente;
