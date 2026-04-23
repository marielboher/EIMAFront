import { Link } from 'react-router-dom'
import '../auth/authPages.css'
import './contactoPage.css'
import { ContactoForm } from './ContactoForm.jsx'

export function ContactoPage() {
  return (
    <div className="authWrap contactoWrap">
      <ContactoForm />

      <div className="link" style={{ marginTop: 14 }}>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  )
}
