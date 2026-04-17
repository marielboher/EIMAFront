import { Link } from 'react-router-dom'
import './homePage.css'

export function HomePage() {
  return (
    <div className="homeShell">
      <main className="home">
        <section className="homeIntro" aria-label="Qué es EIMA">
          <div className="homeIntroInner">
            <p className="homeEyebrow">EIMA Educación</p>
            <h1 className="homeIntroTitle">¿Qué es EIMA?</h1>
            <p className="homeIntroLead">
              EIMA es un centro de aprendizajes múltiples orientado a acompañar trayectorias educativas con foco en
              resultados, contención y calidad docente.
            </p>

            <div className="homeIntroList" role="list">
              <div className="homeIntroItem" role="listitem">
                Ingresos secundarios y universitarios.
              </div>
              <div className="homeIntroItem" role="listitem">
                Cursos y talleres de inglés e informática.
              </div>
              <div className="homeIntroItem" role="listitem">
                Clases particulares para nivel primario, secundario, terciario y universitario.
              </div>
              <div className="homeIntroItem" role="listitem">
                Docentes especializados.
              </div>
            </div>

            <a className="homeIntroSite" href="https://www.eimaeducacion.com" target="_blank" rel="noreferrer">
              www.eimaeducacion.com
            </a>
          </div>
        </section>

        <section className="homeHero" aria-label="Imagen principal">
          <div className="homeHeroMedia">
            <img
              className="homeHeroImg"
              src="/brand/eima-hero.png"
              alt="EIMA: educar, inspirar, motivar, acompañar"
              loading="lazy"
            />
          </div>
          <div className="homeHeroFooter">
            <div className="homeHeroFooterTop">
              <p className="homeHeroTagline">educar · inspirar · motivar · acompañar</p>
              <div className="homeActions">
                <Link className="btnSecondary" to="/registro">
                  Crear cuenta
                </Link>
                <a className="btnWa" href="https://wa.me/543515161879" target="_blank" rel="noreferrer">
                  WhatsApp: 351‑5161‑879
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
