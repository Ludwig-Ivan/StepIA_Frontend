import { useNavigate } from "react-router-dom";
import "./Expediente.css";

import { createExpediente } from "../../services/expedienteService.js";
import { Controller, useForm } from "react-hook-form";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";

function Expediente() {
  const navigate = useNavigate();
  const idPaciente = localStorage.getItem("idPaciente");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { antecedentes: "" } });

  const guardarExpediente = async (data) => {
    const expediente = await createExpediente({
      antecedentes: data.antecedentes,
      idPaciente: idPaciente,
      numeroExpediente: "EXP-" + idPaciente,
      estado: "ACTIVO",
    });

    if (!expediente) {
      console.log("No se pudo guardar el expediente");
      return;
    }

    console.log("Expediente guardado correctamente");
    navigate("/informe-paciente");
  };

  return (
    <div className="datos-page">
      <header className="datos-header">
        <h2>StepIA</h2>
      </header>

      <main className="datos-main">
        <section className="datos-card">
          <h1>Expediente</h1>

          <form
            className="datos-form"
            onSubmit={handleSubmit(guardarExpediente)}
          >
            <Controller
              name="antecedentes"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    label: "Antecedentes",
                    placeholder: "Antecedentes del paciente",
                    type: "text",
                    value: field.value,
                    func: field.onChange,
                  }}
                  containerStyle={{
                    maxWidth: "none",
                    width: "100%",
                    height: "fit-content",
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "35vh",
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "18px",
                    },
                  }}
                  multiline
                  rows={9}
                />
              )}
            />

            <div className="datos-buttons">
              <ButtonComponent
                config={{
                  name: "volver",
                  text: "Volver",
                  type: "button",
                  variant: "white",
                }}
                onClick={() => navigate(-1)}
              />

              <ButtonComponent
                config={{
                  name: "anterior",
                  text: "Anterior",
                  type: "button",
                  variant: "blue",
                }}
                onClick={() => navigate("/registro-paciente")}
              />

              <ButtonComponent
                config={{
                  name: "siguiente",
                  text: "Siguiente",
                  type: "submit",
                  variant: "green",
                }}
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Expediente;
