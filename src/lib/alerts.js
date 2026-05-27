import Swal from 'sweetalert2'

const toast = Swal.mixin({
  toast: true,
  position: 'top-start',
  showConfirmButton: false,
  timer: 3000,
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

/**
 * Diálogo de confirmación elegante con SweetAlert2.
 * Devuelve true si el usuario confirmó, false si canceló.
 */
export async function confirmDialog({ title, text, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false } = {}) {
  const result = await Swal.fire({
    title: title ?? '¿Estás seguro?',
    text: text ?? '',
    icon: danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    background: 'var(--surface)',
    color: 'var(--text)',
    confirmButtonColor: danger ? '#d7263d' : 'var(--eima-gold)',
    cancelButtonColor: 'transparent',
    customClass: {
      popup: 'swal-popup-custom',
      confirmButton: 'swal-btn-confirm',
      cancelButton: 'swal-btn-cancel',
    },
  })
  return result.isConfirmed
}

