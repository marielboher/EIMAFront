import { useEffect, useMemo, useState } from 'react'
import { changeUserRoleByEmail } from '../../services/admin'
import { esCorreoValido } from '../../lib/authValidation'
import { getSessionInfo } from '../../lib/authStorage'
import './rolesPage.css'
import { getPersonas } from '../../services/personas'

const ROLES = [
  { id: 'alumno', label: 'Alumno' },
  { id: 'profesor', label: 'Profesor' },
  { id: 'secretaria', label: 'Secretaría' },
  // El backend no permite asignar super_admin por esta operación.
  { id: 'super_admin', label: 'Administrador', disabled: true },
]

function initialsFromPersona(persona) {
  const nombre = String(persona?.nombre ?? '')
  const apellido = String(persona?.apellido ?? '')
  const a = (nombre.trim()[0] ?? '?').toUpperCase()
  const b = (apellido.trim()[0] ?? nombre.trim()[1] ?? a).toUpperCase()
  return `${a}${b}`
}

function avatarStyleForRole(rol) {
  const r = String(rol ?? '').toLowerCase()
  if (r === 'profesor') return { background: 'rgba(27, 158, 119, 0.12)', color: '#1B9E77' }
  if (r === 'secretaria') return { background: 'rgba(244, 160, 36, 0.18)', color: '#8a5a00' }
  if (r === 'super_admin') return { background: '#FDECEA', color: '#D7263D' }
  return { background: 'rgba(43, 108, 176, 0.12)', color: '#2B6CB0' } // alumno/default
}

export function RoleManagementPage({ embedded = false } = {}) {
  const session = getSessionInfo()
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState(null)
  const [inlineOk, setInlineOk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState([])

  useEffect(() => {
    const ac = new AbortController()
    async function run() {
      try {
        setLoading(true)
        const data = await getPersonas({ signal: ac.signal })
        setPeople(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!ac.signal.aborted) {
          setInlineError(String(e?.message ?? e ?? 'No se pudo cargar la lista de usuarios.'))
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }
    run()
    return () => ac.abort()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = Array.isArray(people) ? people : []
    if (!q) return list
    return list.filter((p) => {
      const nombre = `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.toLowerCase()
      const correo = String(p?.cuentaUsuario?.correoElectronico ?? '').toLowerCase()
      return nombre.includes(q) || correo.includes(q)
    })
  }, [people, query])

  async function onChangeRole(nextRole) {
    setInlineError(null)
    setInlineOk(null)
    const correo = String(nextRole?.correo ?? '').trim()
    const nuevoRol = String(nextRole?.rol ?? '').trim()
    if (!correo || !esCorreoValido(correo)) {
      setInlineError('El usuario seleccionado no tiene un correo válido asociado.')
      return
    }
    if (!nuevoRol) return

    setSubmitting(true)
    const res = await changeUserRoleByEmail({ correo, nuevoRol })
    setSubmitting(false)

    if (!res.ok) {
      if (res.status === 403) {
        setInlineError('No tenés permisos para gestionar roles (403).')
        return
      }
      const msg =
        res.errores?.map((x) => x.mensaje).filter(Boolean).join(' ') ??
        res.message
      setInlineError(msg || 'No se pudo cambiar el rol.')
      return
    }

    // Actualizar la fila localmente (rol) según respuesta
    const correoRes = String(res.data?.correo ?? correo).toLowerCase()
    const rolNuevo = String(res.data?.rolNuevo ?? nuevoRol).toLowerCase()
    setPeople((prev) =>
      prev.map((p) => {
        const c = String(p?.cuentaUsuario?.correoElectronico ?? '').toLowerCase()
        if (c !== correoRes) return p
        return {
          ...p,
          rol: { ...(p?.rol ?? {}), nombre: rolNuevo },
        }
      }),
    )
    setInlineOk(
      `${res.data?.mensaje ?? 'Rol actualizado.'} (por personaId ${String(res.data?.realizadoPorPersonaId ?? session?.personaId ?? '-')})`,
    )
  }

  return (
    <div className={`rolesWrap${embedded ? ' embedded' : ''}`}>
      <div className="rolesPanel">
        <div className="panelTitle">Gestión de usuarios y roles</div>
        <div className="panelSub">Solo visible para administradores.</div>

        <input
          className="search"
          placeholder="Buscar por nombre o correo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading ? <div className="inlineMsg">Cargando usuarios…</div> : null}

        {!loading && filtered.length === 0 ? (
          <div className="inlineMsg">No hay usuarios para mostrar.</div>
        ) : null}

        {filtered.map((p) => {
          const correo = String(p?.cuentaUsuario?.correoElectronico ?? '').trim()
          const rolNombre = String(p?.rol?.nombre ?? '').toLowerCase()
          const displayNombre = `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim() || 'Usuario'
          const valueRol = rolNombre || 'alumno'
          return (
            <div className="urow" key={p?.id ?? correo ?? displayNombre}>
              <div className="av" style={avatarStyleForRole(valueRol)}>
                {initialsFromPersona(p)}
              </div>
              <div className="uinfo">
                <div className="uname">{displayNombre}</div>
                <div className="uemail">{correo || '(sin correo)'}</div>
              </div>
              <select
                className="rsel"
                value={valueRol}
                disabled={submitting || !correo || !esCorreoValido(correo)}
                onChange={(e) => onChangeRole({ correo, rol: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.disabled}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}

        {inlineError ? <div className="inlineErr">{inlineError}</div> : null}
        {inlineOk ? <div className="inlineMsg">{inlineOk}</div> : null}
      </div>
    </div>
  )
}

