import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './Ajustes.css'

import {
  obtenerApariencia,
  guardarApariencia,
  restaurarApariencia,
  aplicarApariencia
} from '../../utils/apariencia'


function Ajustes() {

  const navigate = useNavigate()


  const [tema, setTema] =
    useState('automatico')


  const [tamano, setTamano] =
    useState('normal')


  /* ========================================
     CARGAR CONFIGURACIÓN
  ======================================== */

  useEffect(() => {

    const configuracion =
      obtenerApariencia()

    setTema(
      configuracion.tema
    )

    setTamano(
      configuracion.tamano
    )

    aplicarApariencia(
      configuracion
    )

  }, [])


  /* ========================================
     CAMBIAR TEMA
  ======================================== */

  const cambiarTema = (e) => {

    const nuevoTema =
      e.target.value

    setTema(
      nuevoTema
    )


    // Mostrar cambio inmediatamente
    aplicarApariencia({
      tema: nuevoTema,
      tamano
    })

  }


  /* ========================================
     CAMBIAR TAMAÑO
  ======================================== */

  const cambiarTamano = (e) => {

    const nuevoTamano =
      e.target.value

    setTamano(
      nuevoTamano
    )


    aplicarApariencia({
      tema,
      tamano: nuevoTamano
    })

  }


  /* ========================================
     GUARDAR
  ======================================== */

  const guardar = () => {

    guardarApariencia({
      tema,
      tamano
    })


    alert(
      'Configuración de apariencia guardada'
    )

  }


  /* ========================================
     RESTAURAR
  ======================================== */

  const restaurar = () => {

    const confirmar =
      window.confirm(
        '¿Deseas restaurar la apariencia predeterminada?'
      )


    if (!confirmar) {
      return
    }


    const configuracion =
      restaurarApariencia()


    setTema(
      configuracion.tema
    )


    setTamano(
      configuracion.tamano
    )

  }


  return (

    <div className="ajustes-page">


      {/* HEADER */}

      <header className="ajustes-header">


        <button
          type="button"
          className="ajustes-logo"
          onClick={() =>
            navigate('/menu')
          }
        >
          StepAI
        </button>


        <button
          type="button"
          className="ajustes-volver"
          onClick={() =>
            navigate('/menu')
          }
        >
          🏠 Panel Principal
        </button>


      </header>



      {/* CONTENIDO */}

      <main className="ajustes-main">


        <div className="ajustes-titulo">


          <h1>
            ⚙️ Ajustes
          </h1>


          <p>
            Personaliza la apariencia
            del sistema StepAI.
          </p>


        </div>



        {/* APARIENCIA */}

        <section className="apariencia-card">


          <div className="apariencia-header">


            <div className="apariencia-icono">
              🎨
            </div>


            <div>

              <h2>
                Apariencia
              </h2>

              <p>
                Personaliza cómo se visualiza
                el sistema.
              </p>

            </div>


          </div>



          <div className="apariencia-contenido">


            {/* TEMA */}

            <div className="ajuste-campo">


              <div>

                <h3>
                  Tema
                </h3>

                <p>
                  Selecciona el modo de
                  visualización de StepAI.
                </p>

              </div>


              <select
                value={tema}
                onChange={cambiarTema}
              >

                <option value="automatico">
                  Automático
                </option>

                <option value="claro">
                  Claro
                </option>

                <option value="oscuro">
                  Oscuro
                </option>

              </select>


            </div>



            {/* TAMAÑO */}

            <div className="ajuste-campo">


              <div>

                <h3>
                  Tamaño de interfaz
                </h3>

                <p>
                  Modifica el tamaño
                  general del sistema.
                </p>

              </div>


              <select
                value={tamano}
                onChange={cambiarTamano}
              >

                <option value="pequeno">
                  Pequeño
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="grande">
                  Grande
                </option>

              </select>


            </div>


          </div>



          {/* BOTONES */}

          <div className="apariencia-footer">


            <button
              type="button"
              className="btn-restaurar-ajustes"
              onClick={restaurar}
            >
              ↺ Restaurar
            </button>


            <button
              type="button"
              className="btn-guardar-ajustes"
              onClick={guardar}
            >
              💾 Guardar cambios
            </button>


          </div>


        </section>


      </main>


    </div>

  )

}


export default Ajustes