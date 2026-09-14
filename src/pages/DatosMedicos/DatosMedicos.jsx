import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DatosMedicos.css'

function DatosMedicos() {
  const navigate = useNavigate()

  const [datosMedicos, setDatosMedicos] = useState(() => {})

  const manejarCambio = (e) => {
    const { name, value } = e.target

    const nuevosDatos = {
      ...datosMedicos,
      [name]: value
    }

    setDatosMedicos(nuevosDatos)
    localStorage.setItem('datosMedicosActual', JSON.stringify(nuevosDatos))
  }

  const guardarPaciente = () => {
    const pacienteActual = JSON.parse(localStorage.getItem('pacienteActual'))

    if (!pacienteActual) {
      alert('No hay paciente registrado')
      navigate('/registro-paciente')
      return
    }

    if (
      datosMedicos.alergias.trim() === '' ||
      datosMedicos.sintomas.trim() === ''
    ) {
      alert('Alergias y Síntomas son obligatorios')
      return
    }

    const analisisPlantar =
      JSON.parse(localStorage.getItem('resultadoAnalisisPlantar')) || {}

    const fecha = new Date()

    const pacienteCompleto = {
      ...pacienteActual,

      alergias: datosMedicos.alergias,
      sintomas: datosMedicos.sintomas,

      diagnostico: '',
      tratamiento: '',
      anotaciones: '',

      resultadoIA: analisisPlantar.resultadoIA || '',
      tipoPie: analisisPlantar.tipoPie || '',
      analisisTexto: '',
      imagenPieIzquierdo: analisisPlantar.imagenIzquierda || '',
      imagenPieDerecho: analisisPlantar.imagenDerecha || '',
      fechaAnalisis: analisisPlantar.fechaAnalisis || '',

      fecha: fecha.toLocaleDateString(),
      hora: fecha.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),

   
    }

    const pacientesGuardados =
      JSON.parse(localStorage.getItem('pacientes')) || []

    pacientesGuardados.push(pacienteCompleto)

    localStorage.setItem('pacientes', JSON.stringify(pacientesGuardados))
    localStorage.setItem('pacienteSeleccionado', JSON.stringify(pacienteCompleto))

    localStorage.removeItem('pacienteActual')
    localStorage.removeItem('datosMedicosActual')
    localStorage.removeItem('resultadoAnalisisPlantar')

    alert('Paciente guardado correctamente')

    navigate('/informe-paciente')
  }

  return (
    <div className="datos-page">
      <header className="datos-header">
        <h2>StepIA</h2>
      </header>

      <main className="datos-main">
        <section className="datos-card">
          <h1>Datos Médicos</h1>

          <form className="datos-form">
            <div className="datos-group">
              <label>Alergias</label>
              <textarea
                name="alergias"
                placeholder="Alergias del paciente"
                value={1}
                onChange={manejarCambio}
              ></textarea>
            </div>

            <div className="datos-group">
              <label> Síntomas</label>
              <textarea
                name="sintomas"
                placeholder="Síntomas del paciente"
                value={1}
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
                onClick={() => navigate('/registro-paciente')}
              >
                Anterior
              </button>

              <button
                type="button"
                className="btn-siguiente"
                onClick={()=>{}}
              >
                Siguiente
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default DatosMedicos