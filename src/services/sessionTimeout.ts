import api from "@/services/api"

let timeout: any
let active = false

const logoutUser = async () => {
    try {
        await api.post("/api/logout/")
    } catch (e) { }

    stopSessionTimeout()

    window.location.href = '/login'
}

export const stopSessionTimeout = () => {
    active = false
    clearTimeout(timeout)
}

export const initSessionTimeout = () => {

    if (active) return // 🔥 evita múltiples timers
    active = true

    const events = ["mousemove", "keydown", "click", "scroll"]

    const reset = () => {
        if (!active) return

        clearTimeout(timeout)

        timeout = setTimeout(() => {
            console.warn("Sesión expirada por inactividad")
            logoutUser()
        }, 1 * 60 * 1000) // ajusta tiempo aquí
    }

    events.forEach(event => {
        window.addEventListener(event, reset)
    })

    reset()
}