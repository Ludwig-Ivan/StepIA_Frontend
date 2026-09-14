import { BrowserRouter, Routes, Route } from "react-router-dom";
import AgendaConsultas from "../pages/Agenda/AgendaConsultas";
import Login from "../pages/Login/Login";
import Menu from "../pages/Menu/Menu";
import RegistroPaciente from "../pages/RegistroPaciente/RegistroPaciente";
import AnalisisPlantar from "../pages/AnalisisPlantar/AnalisisPlantar";
// import DatosMedicos from '../pages/DatosMedicos/DatosMedicos'
import InformePaciente from "../pages/InformePaciente/InformePaciente";
import ListaPacientes from "../pages/ListaPacientes/ListaPacientes";
import HistorialPaciente from "../pages/HistorialPaciente/HistorialPaciente";
import Historial from "../pages/HistorialActividad/Historial";
import Ajustes from "../pages/Ajustes/Ajustes";
import Soporte from "../pages/Soporte/Soporte";
import Expediente from "../pages/Expediente/Expediente";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/registro-paciente" element={<RegistroPaciente />} />
        <Route path="/analisis-plantar" element={<AnalisisPlantar />} />
        <Route path="/historial-paciente" element={<HistorialPaciente />} />
        <Route path="/expediente" element={<Expediente />} />
        <Route path="/informe-paciente" element={<InformePaciente />} />
        <Route path="/lista-pacientes" element={<ListaPacientes />} />
        <Route path="/agenda-consultas" element={<AgendaConsultas />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/soporte" element={<Soporte />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
