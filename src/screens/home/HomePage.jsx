import { Link } from 'react-router-dom'
import './homePage.css'
import { ContactoForm } from '../contacto/ContactoForm.jsx'

export function HomePage() {
  return (
    <div className="homeNewWrap">
      <main className="homeNew">
        <section className="homeNewHero" aria-label="Presentación de EIMA">
          <div className="homeNewHeroCopy">
            <p className="homeNewEyebrow">EIMA Educación</p>
            <h1 className="homeNewTitle">
              ¿Qué es
              <br />
              <em>EIMA?</em>
            </h1>
            <p className="homeNewBody">
              Centro de aprendizajes múltiples orientado a acompañar trayectorias educativas con foco en resultados,
              contención y calidad docente.
            </p>
            <div className="homeNewCta">
              <a className="homeNewBtnPrimary" href="#contacto">
                Conocer más
              </a>
              <a className="homeNewBtnLink" href="#servicios">
                Ver servicios <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <aside className="homeNewHeroVisual" aria-label="Métricas de EIMA">
            <div className="homeNewStatsRow">
              <div className="homeNewStatCard">
                <div className="homeNewStatNum">+500</div>
                <div className="homeNewStatLabel">Alumnos acompañados</div>
              </div>
              <div className="homeNewStatCard">
                <div className="homeNewStatNum">4</div>
                <div className="homeNewStatLabel">Niveles educativos</div>
              </div>
            </div>
            <div className="homeNewStatCard homeNewStatWide">
              <div className="homeNewStatNum homeNewStatWideTitle">Docentes especializados</div>
              <div className="homeNewStatLabel homeNewStatWideLabel">
                Primario · Secundario · Terciario · Universitario
              </div>
            </div>
          </aside>
        </section>

        <div className="homeNewDivider" role="presentation" />

        <section id="servicios" className="homeNewServices" aria-label="Servicios">
          <header className="homeNewSectionHeader">
            <h2 className="homeNewSectionTitle">Nuestros servicios</h2>
            <a className="homeNewSectionLink" href="#contacto">
              Contacto <span aria-hidden="true">→</span>
            </a>
          </header>

          <div className="homeNewGrid" role="list">
            <div className="homeNewCard" role="listitem">
              <div className="homeNewIcon" aria-hidden="true">
                🎓
              </div>
              <div className="homeNewName">Ingresos secundarios y universitarios</div>
              <div className="homeNewDesc">Preparación integral para exámenes de ingreso con seguimiento personalizado.</div>
            </div>

            <div className="homeNewCard" role="listitem">
              <div className="homeNewIcon" aria-hidden="true">
                🌐
              </div>
              <div className="homeNewName">Inglés e informática</div>
              <div className="homeNewDesc">Cursos y talleres intensivos orientados a resultados concretos.</div>
            </div>

            <div className="homeNewCard" role="listitem">
              <div className="homeNewIcon" aria-hidden="true">
                📚
              </div>
              <div className="homeNewName">Clases particulares</div>
              <div className="homeNewDesc">
                Todos los niveles: primario, secundario, terciario y universitario.
              </div>
            </div>

            <div className="homeNewCard" role="listitem">
              <div className="homeNewIcon" aria-hidden="true">
                ⭐
              </div>
              <div className="homeNewName">Calidad docente garantizada</div>
              <div className="homeNewDesc">Profesionales especializados seleccionados con criterios de excelencia.</div>
            </div>
          </div>
        </section>

        <section id="contacto" className="homeNewContact" aria-label="Contacto">
          <header className="homeNewSectionHeader homeNewSectionHeaderCenter">
            <h2 className="homeNewSectionTitle">Contacto</h2>
          </header>
          <ContactoForm embedded />
        </section>

        <footer className="siteFooter" aria-label="Pie del sitio">
          <div className="siteFooterInner">
            <div className="siteFooterBrand">
              <span className="siteFooterName">EIMA</span>
              <span className="siteFooterTagline">Acompañando trayectorias educativas</span>
            </div>

            <nav className="siteFooterLinks" aria-label="Páginas públicas">
              <Link to="/">Inicio</Link>
              <Link to="/#contacto">Contacto</Link>
              <Link to="/login">Login</Link>
              <Link to="/registro">Registro</Link>
            </nav>

            <div className="siteFooterMeta">
              <a href="https://www.eimaeducacion.com" target="_blank" rel="noreferrer">
                www.eimaeducacion.com
              </a>
              <span className="siteFooterSep" aria-hidden="true">
                ·
              </span>
              <a href="https://wa.me/543515161879" target="_blank" rel="noreferrer">
                WhatsApp 351‑5161‑879
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
