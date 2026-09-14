import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Soporte.css'

function Soporte() {

  const navigate = useNavigate()

  const [busqueda, setBusqueda] = useState('')

  const [preguntaAbierta, setPreguntaAbierta] =
    useState(null)

  const [mostrarReporte, setMostrarReporte] =
    useState(false)

  const [reporte, setReporte] = useState({
    tipo: '',
    pantalla: '',
    asunto: '',
    descripcion: ''
  })


  /* =========================================
     DATOS DE SOPORTE
     CAMBIA ESTOS DATOS POR LOS REALES
  ========================================= */

  const correoSoporte =
    'estefaniamoon6@gmail.com'

  const numeroSoporte =
    '13531018343'


  /* =========================================
     PREGUNTAS FRECUENTES
  ========================================= */

  const preguntas = [

    {
      pregunta:
        '¿Cómo registro un paciente?',

      respuesta:
        'Desde el Panel Principal selecciona Nuevo Paciente. Captura los datos generales y presiona Siguiente para continuar con los datos médicos.'
    },

    {
      pregunta:
        '¿Cómo realizo un análisis plantar?',

      respuesta:
        'Desde el Panel Principal selecciona Nuevo Análisis y sigue el proceso correspondiente al paciente.'
    },

    {
      pregunta:
        '¿Cómo guardo un informe médico?',

      respuesta:
        'Dentro del informe del paciente completa la información requerida y presiona el botón Guardar.'
    },

    {
      pregunta:
        '¿Cómo programo una próxima consulta?',

      respuesta:
        'Dentro del informe del paciente selecciona la fecha y hora de la próxima consulta y guarda los cambios.'
    },

    {
      pregunta:
        '¿Dónde veo las próximas consultas?',

      respuesta:
        'Selecciona Agenda de Consultas en el menú superior. Los pacientes aparecerán marcados en el calendario según su fecha y hora.'
    },

    {
      pregunta:
        '¿Dónde veo el historial de actividades?',

      respuesta:
        'Selecciona Historial de Actividades en el menú superior para consultar las acciones realizadas dentro de StepAI.'
    },

    {
      pregunta:
        '¿Cómo cambio la apariencia?',

      respuesta:
        'Ve a Ajustes y entra al apartado Apariencia. Puedes seleccionar tema Claro, Oscuro o Automático.'
    },

    {
      pregunta:
        '¿Qué hago si aparece un error?',

      respuesta:
        'Puedes utilizar la opción Reportar un problema dentro de esta misma pantalla y enviar el reporte por correo o WhatsApp.'
    }

  ]


  /* =========================================
     FILTRAR PREGUNTAS
  ========================================= */

  const preguntasFiltradas =
    useMemo(() => {

      if (!busqueda.trim()) {
        return preguntas
      }

      const texto =
        busqueda.toLowerCase()

      return preguntas.filter(
        (item) => {

          return (
            item.pregunta
              .toLowerCase()
              .includes(texto) ||

            item.respuesta
              .toLowerCase()
              .includes(texto)
          )

        }
      )

    }, [busqueda])


  /* =========================================
     OBTENER APARIENCIA ACTUAL
  ========================================= */

  const apariencia =
    useMemo(() => {

      try {

        const guardada =
          JSON.parse(
            localStorage.getItem(
              'configuracionApariencia'
            )
          )

        return {
          tema:
            guardada?.tema ||
            'automatico',

          tamano:
            guardada?.tamano ||
            'normal'
        }

      } catch {

        return {
          tema: 'automatico',
          tamano: 'normal'
        }

      }

    }, [])


  /* =========================================
     CAMBIAR CAMPOS DEL REPORTE
  ========================================= */

  const cambiarReporte = (e) => {

    const {
      name,
      value
    } = e.target

    setReporte(
      (actual) => ({
        ...actual,
        [name]: value
      })
    )

  }


  /* =========================================
     VALIDAR REPORTE
  ========================================= */

  const validarReporte = () => {

    if (
      !reporte.tipo ||
      !reporte.pantalla ||
      !reporte.asunto.trim() ||
      !reporte.descripcion.trim()
    ) {

      alert(
        'Completa todos los campos del reporte'
      )

      return false

    }

    return true

  }


  /* =========================================
     GUARDAR REPORTE EN LOCALSTORAGE
  ========================================= */

  const guardarReporteLocal = () => {

    const reportes =
      JSON.parse(
        localStorage.getItem(
          'reportesSoporte'
        )
      ) || []

    const nuevoReporte = {

      id: Date.now(),

      tipo:
        reporte.tipo,

      pantalla:
        reporte.pantalla,

      asunto:
        reporte.asunto,

      descripcion:
        reporte.descripcion,

      fecha:
        new Date()
          .toLocaleDateString('es-MX'),

      hora:
        new Date()
          .toLocaleTimeString(
            'es-MX',
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          ),

      estado:
        'Pendiente'

    }

    reportes.unshift(
      nuevoReporte
    )

    localStorage.setItem(
      'reportesSoporte',
      JSON.stringify(reportes)
    )

  }


  /* =========================================
     CREAR MENSAJE DEL REPORTE
  ========================================= */

  const crearMensaje = () => {

    return `
Hola, necesito soporte técnico con StepAI.

TIPO DE PROBLEMA:
${reporte.tipo}

PANTALLA DONDE OCURRIÓ:
${reporte.pantalla}

ASUNTO:
${reporte.asunto}

DESCRIPCIÓN:
${reporte.descripcion}

CONFIGURACIÓN DEL SISTEMA:

Tema:
${apariencia.tema}

Tamaño de interfaz:
${apariencia.tamano}

Fecha del reporte:
${new Date().toLocaleDateString('es-MX')}

Hora:
${new Date().toLocaleTimeString('es-MX')}
`

  }


  /* =========================================
     ENVIAR POR CORREO
  ========================================= */

  const enviarCorreo = () => {

    if (!validarReporte()) {
      return
    }

    guardarReporteLocal()

    const asunto =
      `Soporte StepAI - ${reporte.asunto}`

    const mensaje =
      crearMensaje()

    const enlaceCorreo =
      `mailto:${correoSoporte}` +
      `?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(mensaje)}`

    window.location.href =
      enlaceCorreo

  }


  /* =========================================
     ENVIAR POR WHATSAPP
  ========================================= */

  const enviarWhatsApp = () => {

    if (!validarReporte()) {
      return
    }

    guardarReporteLocal()

    const mensaje =
      crearMensaje()

    const enlaceWhatsApp =
      `https://wa.me/${numeroSoporte}` +
      `?text=${encodeURIComponent(mensaje)}`

    window.open(
      enlaceWhatsApp,
      '_blank'
    )

  }


  /* =========================================
     GUARDAR SIN ENVIAR
  ========================================= */

  const guardarReporte = () => {

    if (!validarReporte()) {
      return
    }

    guardarReporteLocal()

    alert(
      'Reporte guardado correctamente'
    )

    limpiarReporte()

  }


  /* =========================================
     LIMPIAR REPORTE
  ========================================= */

  const limpiarReporte = () => {

    setReporte({
      tipo: '',
      pantalla: '',
      asunto: '',
      descripcion: ''
    })

    setMostrarReporte(false)

  }


  /* =========================================
     INTERFAZ
  ========================================= */

  return (

    <div className="soporte-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="soporte-header">


        <button
          type="button"
          className="soporte-logo"
          onClick={() =>
            navigate('/menu')
          }
        >
          StepAI
        </button>


        <button
          type="button"
          className="soporte-volver"
          onClick={() =>
            navigate('/menu')
          }
        >
           Panel Principal
        </button>


      </header>



      {/* =====================================
          CONTENIDO
      ===================================== */}

      <main className="soporte-main">


        <div className="soporte-titulo">

          <h1>
             Soporte Técnico
          </h1>

          <p>
            Encuentra ayuda, consulta
            la guía de uso o reporta
            un problema.
          </p>

        </div>



        {/* =====================================
            BUSCADOR
        ===================================== */}

        <div className="soporte-buscador">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Buscar una pregunta o problema..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />

        </div>



        {/* =====================================
            TARJETAS PRINCIPALES
        ===================================== */}

        <section className="soporte-grid">


          {/* PREGUNTAS */}

          <article className="soporte-card">

            <div className="soporte-card-icono">
              
            </div>

            <h2>
              Preguntas frecuentes
            </h2>

            <p>
              Encuentra respuestas rápidas
              sobre el funcionamiento
              de StepAI.
            </p>

            <button
              type="button"
              className="soporte-card-btn"
              onClick={() => {

                document
                  .getElementById(
                    'preguntas-frecuentes'
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth'
                  })

              }}
            >
              Ver preguntas
            </button>

          </article>



          {/* GUÍA */}

          <article className="soporte-card">

            

            <h2>
              Guía de uso
            </h2>

            <p>
              Aprende a utilizar las
              principales funciones
              de StepAI.
            </p>

            <button
              type="button"
              className="soporte-card-btn"
              onClick={() => {

                document
                  .getElementById(
                    'guia-uso'
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth'
                  })

              }}
            >
              Ver guía
            </button>

          </article>



          {/* REPORTAR */}

          <article className="soporte-card">

          

            <h2>
              Reportar un problema
            </h2>

            <p>
              Envía un reporte
              directamente por correo
              o WhatsApp.
            </p>

            <button
              type="button"
              className="soporte-card-btn"
              onClick={() =>
                setMostrarReporte(true)
              }
            >
              Reportar problema
            </button>

          </article>



          {/* SISTEMA */}

          <article className="soporte-card">

        
            <h2>
              Información del sistema
            </h2>

            <p>
              Consulta información útil
              para identificar problemas.
            </p>

            <button
              type="button"
              className="soporte-card-btn"
              onClick={() => {

                document
                  .getElementById(
                    'informacion-sistema'
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth'
                  })

              }}
            >
              Ver información
            </button>

          </article>


        </section>



        {/* =====================================
            PREGUNTAS FRECUENTES
        ===================================== */}

        <section
          id="preguntas-frecuentes"
          className="soporte-seccion"
        >

          <div className="soporte-seccion-titulo">

            

            <p>
              Selecciona una pregunta.
            </p>

          </div>


          <div className="faq-lista">


            {
              preguntasFiltradas.length === 0
                ? (

                  <div className="faq-sin-resultados">
                    No se encontraron resultados.
                  </div>

                )
                : (

                  preguntasFiltradas.map(
                    (item, index) => {

                      const abierto =
                        preguntaAbierta === index

                      return (

                        <div
                          className="faq-item"
                          key={item.pregunta}
                        >

                          <button
                            type="button"
                            className="faq-pregunta"
                            onClick={() =>
                              setPreguntaAbierta(
                                abierto
                                  ? null
                                  : index
                              )
                            }
                          >

                            
                            <strong>
                              {
                                abierto
                                  ? '−'
                                  : '+'
                              }
                            </strong>

                          </button>


                          {
                            abierto && (

                              <div className="faq-respuesta">
                                {item.respuesta}
                              </div>

                            )
                          }


                        </div>

                      )

                    }
                  )

                )
            }


          </div>

        </section>



        {/* =====================================
            GUÍA
        ===================================== */}

        <section
          id="guia-uso"
          className="soporte-seccion"
        >

          <div className="soporte-seccion-titulo">

            <h2>
               Guía de uso
            </h2>

            <p>
              Flujo principal del sistema.
            </p>

          </div>


          <div className="guia-lista">


            <div className="guia-paso">

              <div className="guia-numero">
                1
              </div>

              <div>

                <h3>
                   Registrar paciente
                </h3>

                <p>
                  Captura los datos
                  generales del paciente.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/registro-paciente'
                  )
                }
              >
                Ir
              </button>

            </div>



            <div className="guia-paso">

              <div className="guia-numero">
                2
              </div>

              <div>

                <h3>
                   Datos médicos
                </h3>

                <p>
                  Completa la información
                  médica.
                </p>

              </div>

            </div>



            <div className="guia-paso">

              <div className="guia-numero">
                3
              </div>

              <div>

                <h3>
                   Análisis plantar
                </h3>

                <p>
                  Realiza un nuevo
                  análisis.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/analisis-plantar'
                  )
                }
              >
                Ir
              </button>

            </div>



            <div className="guia-paso">

              <div className="guia-numero">
                4
              </div>

              <div>

                <h3>
                   Informe médico
                </h3>

                <p>
                  Guarda diagnóstico,
                  tratamiento y observaciones.
                </p>

              </div>

            </div>



            <div className="guia-paso">

              <div className="guia-numero">
                5
              </div>

              <div>

                <h3>
                   Agenda
                </h3>

                <p>
                  Consulta las próximas
                  citas programadas.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/agenda-consultas'
                  )
                }
              >
                Agenda
              </button>

            </div>



            <div className="guia-paso">

              <div className="guia-numero">
                6
              </div>

              <div>

                <h3>
                   Historial
                </h3>

                <p>
                  Consulta las actividades
                  realizadas.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/historial'
                  )
                }
              >
                Historial
              </button>

            </div>


          </div>

        </section>



        {/* =====================================
            INFORMACIÓN DEL SISTEMA
        ===================================== */}

        <section
          id="informacion-sistema"
          className="soporte-seccion"
        >

          <div className="soporte-seccion-titulo">

            <h2>
               Información del sistema
            </h2>

            <p>
              Información útil para soporte.
            </p>

          </div>


          <div className="sistema-info">


            <div className="sistema-fila">

              <span>
                Aplicación
              </span>

              <strong>
                StepAI
              </strong>

            </div>


            <div className="sistema-fila">

              <span>
                Versión
              </span>

              <strong>
                1.0.0
              </strong>

            </div>


            <div className="sistema-fila">

              <span>
                Estado
              </span>

              <strong className="sistema-activo">
                ● Funcionando
              </strong>

            </div>


            <div className="sistema-fila">

              <span>
                Tema
              </span>

              <strong>
                {apariencia.tema}
              </strong>

            </div>


            <div className="sistema-fila">

              <span>
                Tamaño
              </span>

              <strong>
                {apariencia.tamano}
              </strong>

            </div>


          </div>

        </section>


      </main>



      {/* =====================================
          MODAL REPORTAR PROBLEMA
      ===================================== */}

      {
        mostrarReporte && (

          <div className="soporte-modal-fondo">


            <div className="soporte-modal">


              <div className="soporte-modal-header">


                <div>

                  <h2>
                     Reportar un problema
                  </h2>

                  <p>
                    Describe el problema
                    encontrado.
                  </p>

                </div>


                <button
                  type="button"
                  className="soporte-modal-cerrar"
                  onClick={() =>
                    setMostrarReporte(false)
                  }
                >
                  ✕
                </button>


              </div>



              {/* PRIVACIDAD */}

              <div className="soporte-privacidad">

                 No incluyas información
                médica, diagnósticos ni
                datos sensibles de pacientes.

              </div>



              <div className="soporte-form">


                {/* TIPO */}

                <div className="soporte-form-group">

                  <label>
                    Tipo de problema
                  </label>

                  <select
                    name="tipo"
                    value={reporte.tipo}
                    onChange={cambiarReporte}
                  >

                    <option value="">
                      Seleccionar...
                    </option>

                    <option value="Error del sistema">
                      Error del sistema
                    </option>

                    <option value="Problema de visualización">
                      Problema de visualización
                    </option>

                    <option value="Problema con pacientes">
                      Problema con pacientes
                    </option>

                    <option value="Problema con análisis">
                      Problema con análisis
                    </option>

                    <option value="Problema con informes">
                      Problema con informes
                    </option>

                    <option value="Problema con agenda">
                      Problema con agenda
                    </option>

                    <option value="Otro">
                      Otro
                    </option>

                  </select>

                </div>



                {/* PANTALLA */}

                <div className="soporte-form-group">

                  <label>
                    Pantalla donde ocurrió
                  </label>

                  <select
                    name="pantalla"
                    value={reporte.pantalla}
                    onChange={cambiarReporte}
                  >

                    <option value="">
                      Seleccionar...
                    </option>

                    <option value="Panel Principal">
                      Panel Principal
                    </option>

                    <option value="Registro Paciente">
                      Registro Paciente
                    </option>

                    <option value="Datos Médicos">
                      Datos Médicos
                    </option>

                    <option value="Análisis Plantar">
                      Análisis Plantar
                    </option>

                    <option value="Informe Paciente">
                      Informe Paciente
                    </option>

                    <option value="Agenda">
                      Agenda
                    </option>

                    <option value="Historial">
                      Historial
                    </option>

                    <option value="Ajustes">
                      Ajustes
                    </option>

                    <option value="Otra">
                      Otra
                    </option>

                  </select>

                </div>



                {/* ASUNTO */}

                <div className="soporte-form-group">

                  <label>
                    Asunto
                  </label>

                  <input
                    type="text"
                    name="asunto"
                    placeholder="Ejemplo: No aparece la cita"
                    value={reporte.asunto}
                    onChange={cambiarReporte}
                  />

                </div>



                {/* DESCRIPCIÓN */}

                <div className="soporte-form-group">

                  <label>
                    Describe el problema
                  </label>

                  <textarea
                    name="descripcion"
                    rows="6"
                    placeholder="Describe qué estabas haciendo y qué problema apareció..."
                    value={
                      reporte.descripcion
                    }
                    onChange={
                      cambiarReporte
                    }
                  />

                </div>


              </div>



              {/* =================================
                  BOTONES
              ================================= */}

              <div className="soporte-modal-footer">


                <button
                  type="button"
                  className="soporte-cancelar"
                  onClick={() =>
                    setMostrarReporte(false)
                  }
                >
                  Cancelar
                </button>


                <button
                  type="button"
                  className="soporte-guardar"
                  onClick={guardarReporte}
                >
                  💾 Guardar
                </button>


                <button
                  type="button"
                  className="soporte-whatsapp"
                  onClick={enviarWhatsApp}
                >
                  💬 WhatsApp
                </button>


                <button
                  type="button"
                  className="soporte-email"
                  onClick={enviarCorreo}
                >
                  ✉️ Correo
                </button>


              </div>


            </div>


          </div>

        )
      }


    </div>

  )

}

export default Soporte