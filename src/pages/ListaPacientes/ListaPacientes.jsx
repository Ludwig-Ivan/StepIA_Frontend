import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaPacientes.css";
import { getPacientes } from "../../services/pacienteService";

function ListaPacientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const obtenerPacientes = async (searchTerm = "") => {
      try {
        const data = await getPacientes(searchTerm);
        const pacientes = data.content;
        setPacientes(pacientes);
      } catch (e) {
        console.error("No se pudo obtener la lista de pacientes: " + e);
      }
    };

    obtenerPacientes(busqueda);
  }, []);

  const editarPaciente = (idPaciente) => {
    localStorage.setItem("idPaciente", idPaciente);
    navigate("/informe-paciente");
  };

  const verHistorial = (idPaciente) => {
    localStorage.setItem("idPaciente", idPaciente);
    navigate("/historial-paciente");
  };

  return (
    <div className="lista-page">
      <header className="lista-header">
        <h2>StepIA</h2>

        <div className="lista-user">
          <span>USUARIO</span>
          <div className="user-icon">👤</div>
        </div>
      </header>

      <main className="lista-main">
        <section className="lista-card">
          <div className="lista-top">
            <h3>Lista de Pacientes</h3>

            <div className="buscador">
              <input
                type="text"
                testid="input-search"
                placeholder="Buscar paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <span
                testid="btn-search"
                onClick={async () => {
                  try {
                    const data = await getPacientes(busqueda);
                    const pacientes = data.content;
                    setPacientes(pacientes);
                  } catch (e) {
                    console.error(
                      "No se pudo obtener la lista de pacientes: " + e,
                    );
                  }
                }}
              >
                🔍
              </span>
            </div>
          </div>

          <div className="tabla-contenedor">
            <table className="tabla-pacientes">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>CURP</th>
                  <th>Fecha Nacimiento</th>
                  <th>Telefono</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pacientes.length > 0 ? (
                  pacientes.map((paciente) => {
                    return PacienteRow(paciente, editarPaciente, verHistorial);
                  })
                ) : (
                  <tr>
                    <td className="sin-resultados" colSpan="6">
                      No hay pacientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="btn-volver-lista"
            onClick={() => navigate("/menu")}
          >
            Volver
          </button>
        </section>
      </main>
    </div>
  );
}

function PacienteRow(paciente, editarPaciente, verHistorial) {
  return (
    <tr key={paciente.curp}>
      <td className="nombre-paciente">
        {`${paciente.nombre} ${paciente.apellidoPaterno} ${paciente.apellidoMaterno}`}
      </td>

      <td>{paciente.curp || "Sin CURP"}</td>

      <td>{paciente.fechaNacimiento || "Sin fechaNacimiento"}</td>

      <td>{paciente.telefono || "Sin telefono"}</td>

      <td className="acciones">
        <button
          type="button"
          testid={`btn-editar-${paciente.curp}`}
          className="btn-editar"
          onClick={() => editarPaciente(paciente.curp)}
        >
          Editar
        </button>

        <button
          type="button"
          testid={`btn-historial-${paciente.curp}`}
          className="btn-historial"
          onClick={() => verHistorial(paciente.curp)}
        >
          Historial
        </button>
      </td>
    </tr>
  );
}

export default ListaPacientes;
