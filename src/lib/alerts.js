import Swal from 'sweetalert2'

const toast = Swal.mixin({
  toast: true,
  position: 'top-start',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: false,
  background: 'var(--surface)',
  color: 'var(--text)',
})

function textFrom({ title, text } = {}) {
  const t = String(title ?? '').trim()
  const x = String(text ?? '').trim()
  return t && x ? `${t} — ${x}` : t || x || ''
}

export function toastSuccess({ title, text } = {}) {
  return toast.fire({ icon: undefined, title: textFrom({ title, text }) })
}

export function toastError({ title, text } = {}) {
  return toast.fire({ icon: undefined, title: textFrom({ title, text }) })
}

export function toastInfo({ title, text } = {}) {
  return toast.fire({ icon: undefined, title: textFrom({ title, text }) })
}

