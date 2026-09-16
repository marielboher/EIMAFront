import { useEffect, useId, useRef, useState } from 'react'

export function ClasesQuickSelect({
  tomadas,
  totales,
  disabled,
  label,
  onChange,
}) {
  const [abierto, setAbierto] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const max = Math.max(0, Number(totales) || 0)
  const actual = Math.min(Math.max(0, Number(tomadas) || 0), max)
  const opciones = Array.from({ length: max + 1 }, (_, n) => n)

  useEffect(() => {
    if (!abierto) return undefined
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setAbierto(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  return (
    <div
      className={`clasesQuick ${abierto ? 'is-open' : ''}`}
      ref={rootRef}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="clasesSelect"
        disabled={disabled}
        title="Actualizar clases tomadas"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setAbierto((v) => !v)
        }}
      >
        <span>{actual}/{max}</span>
        <span className="clasesSelectChevron" aria-hidden>▾</span>
      </button>

      {abierto ? (
        <ul
          id={listId}
          className="clasesSelectMenu"
          role="listbox"
          aria-label={label}
        >
          {opciones.map((n) => (
            <li key={n} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={n === actual}
                className={`clasesSelectOption${n === actual ? ' is-selected' : ''}`}
                onClick={() => {
                  setAbierto(false)
                  if (n !== actual) onChange(String(n))
                }}
              >
                {n}/{max}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
