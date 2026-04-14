import { Link, useLocation } from 'react-router-dom'
import './authPages.css'

export function LoginPage() {
  const location = useLocation()
  const flashOk = location.state?.flashOk ?? null

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="brand">
          <div className="dots" aria-hidden="true">
            <span style={{ background: '#D7263D' }} />
            <span style={{ background: '#F4A024' }} />
            <span style={{ background: '#1B9E77' }} />
            <span style={{ background: '#2B6CB0' }} />
          </div>
          <div className="brandName">EIMA</div>
        </div>

        <div className="cardSub">Iniciar sesión</div>

        {flashOk ? <div className="flashOk">{flashOk}</div> : null}

        <div style={{ fontSize: 13, color: '#6b6b68' }}>
          Pantalla mínima para el flujo de registro (redirige acá con mensaje). El login completo lo
          implementamos en la siguiente HU.
        </div>

        <div className="link" style={{ marginTop: 16 }}>
          ¿No tenés cuenta? <Link to="/registro">Creá una</Link>
        </div>
      </div>
    </div>
  )
}

