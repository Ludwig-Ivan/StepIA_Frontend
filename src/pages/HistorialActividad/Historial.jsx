import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Historial.css'

function Historial() {
  const navigate = useNavigate()

  const [actividades, setActividades] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos')

  useEffect(() => {
    const historial =
      JSON.parse(localStorage.getItem('historialActividades')) || []

    setActividades(historial)
  }, [])

  const eliminarHistorial = () => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar todo el historial?'
    )

    if (!confirmar) return

    localStorage.removeItem('historialActividades')
    setActividades([])
  }

  const eliminarActividad = (id) => {
    const nuevoHistorial = actividades.filter(
      actividad => actividad.id !== id
    )

    setActividades(nuevoHistorial)

    localStorage.setItem(
      'historialActividades',
      JSON.stringify(nuevoHistorial)
    )
  }

  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case 'Paciente registrado':
      case 'Registro de paciente':
        return '👤'

      case 'Paciente consultado':
        return '🔍'

      case 'Informe médico':
        return '🩺'

      case 'Consulta programada':
        return '📅'

      case 'Análisis plantar':
        return '📊'

      case 'Datos médicos':
        return '📝'

      default:
        return '📌'
    }
  }

  const actividadesFiltradas = actividades.filter((actividad) => {
    const texto = `
      ${actividad.tipo || ''}
      ${actividad.descripcion || ''}
      ${actividad.paciente || ''}
      ${actividad.detalles || ''}
    `.toLowerCase()

    const coincideBusqueda = texto.includes(
      busqueda.toLowerCase()
    )

    const coincideTipo =
      filtroTipo === 'Todos' ||
      actividad.tipo === filtroTipo

    return coincideBusqueda && coincideTipo
  })

  const totalConsultas = actividades.filter(
    actividad => actividad.tipo === 'Consulta programada'
  ).length

  const totalInformes = actividades.filter(
    actividad => actividad.tipo === 'Informe médico'
  ).length

  const totalAnalisis = actividades.filter(
    actividad => actividad.tipo === 'Análisis plantar'
  ).length

  return (
    <div className="ha-page">

      {/* HEADER */}
      <header className="ha-header">

        <button
          type="button"
          className="ha-logo"
          onClick={() => navigate('/menu')}
        >
          StepAI
        </button>

        <div className="ha-header-right">

          <div className="ha-conectado">
            <span className="ha-punto"></span>
            Conectado
          </div>

          <button
            type="button"
            className="ha-panel-btn"
            onClick={() => navigate('/menu')}
          >
            🏠 Panel Principal
          </button>

        </div>

      </header>


      {/* CONTENIDO */}
      <main className="ha-main">

        {/* TÍTULO */}
        <section className="ha-titulo">

          <div>
            <h1>
              🕘 Historial de Actividades
            </h1>

            <p>
              Consulta todas las actividades realizadas
              dentro del sistema StepAI.
            </p>
          </div>

          {actividades.length > 0 && (
            <button
              type="button"
              className="ha-limpiar"
              onClick={eliminarHistorial}
            >
              🗑 Limpiar historial
            </button>
          )}

        </section>


        {/* RESUMEN */}
        <section className="ha-resumen">

          <div className="ha-resumen-card">
            <span>Total actividades</span>
            <strong>{actividades.length}</strong>
          </div>

          <div className="ha-resumen-card">
            <span>Consultas</span>
            <strong>{totalConsultas}</strong>
          </div>

          <div className="ha-resumen-card">
            <span>Informes médicos</span>
            <strong>{totalInformes}</strong>
          </div>

          <div className="ha-resumen-card">
            <span>Análisis</span>
            <strong>{totalAnalisis}</strong>
          </div>

        </section>


        {/* BUSCADOR */}
        <section className="ha-filtros">

          <div className="ha-buscador">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Buscar paciente o actividad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="Todos">
              Todas las actividades
            </option>

            <option value="Registro de paciente">
              Registro de paciente
            </option>

            <option value="Paciente consultado">
              Paciente consultado
            </option>

            <option value="Informe médico">
              Informe médico
            </option>

            <option value="Consulta programada">
              Consulta programada
            </option>

            <option value="Análisis plantar">
              Análisis plantar
            </option>
          </select>

        </section>


        {/* ACTIVIDADES */}
        {actividadesFiltradas.length === 0 ? (

          <section className="ha-vacio">

            <div className="ha-vacio-icono">
              🕘
            </div>

            <h2>
              No hay actividades
            </h2>

            <p>
              Las actividades realizadas aparecerán aquí.
            </p>

          </section>

        ) : (

          <section className="ha-lista">

            {actividadesFiltradas.map((actividad) => (

              <article
                className="ha-actividad"
                key={actividad.id}
              >

                <div className="ha-actividad-icono">
                  {obtenerIcono(actividad.tipo)}
                </div>


                <div className="ha-actividad-contenido">

                  <div className="ha-actividad-arriba">

                    <div>

                      <h3>
                        {actividad.tipo}
                      </h3>

                      <span className="ha-fecha">
                        📅 {actividad.fecha}
                        {'  •  '}
                        🕐 {actividad.hora}
                      </span>

                    </div>


                    <button
                      type="button"
                      className="ha-eliminar"
                      onClick={() =>
                        eliminarActividad(actividad.id)
                      }
                    >
                      🗑
                    </button>

                  </div>


                  <p className="ha-descripcion">
                    {actividad.descripcion}
                  </p>


                  {actividad.paciente && (

                    <div className="ha-paciente">
                      👤 Paciente:
                      <strong>
                        {actividad.paciente}
                      </strong>
                    </div>

                  )}


                  {actividad.detalles && (

                    <div className="ha-detalles">
                      {actividad.detalles}
                    </div>

                  )}

                </div>

              </article>

            ))}

          </section>

        )}

      </main>

    </div>
  )
}

export default Historial