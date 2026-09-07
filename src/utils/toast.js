const toast = {
  _emit(type, title, message, action) {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { id: Date.now() + Math.random(), type, title, message, action }
    }))
  },
  success: (title, message, action) => toast._emit('success', title, message, action),
  error:   (title, message, action) => toast._emit('error',   title, message, action),
  warning: (title, message, action) => toast._emit('warning', title, message, action),
  info:    (title, message, action) => toast._emit('info',    title, message, action),
}

export default toast
