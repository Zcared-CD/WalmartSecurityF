import api from "@/services/api"

let timeout: any
let active = false

const events = ["mousemove", "keydown", "click", "scroll"]

const reset = () => {
    if (!active) return

    clearTimeout(timeout)

    timeout = setTimeout(() => {
        console.warn("Sesión expirada por inactividad")
        logoutUser()
    }, 1 * 60 * 1000)
}

const removeListeners = () => {
    events.forEach(event => {
        window.removeEventListener(event, reset)
    })
}

const logoutUser = async () => {
    try {
        await api.post("/api/logout/")
    } catch (e) { }

    stopSessionTimeout()

    window.dispatchEvent(new Event("force-logout"))
}

export const stopSessionTimeout = () => {
    active = false
    clearTimeout(timeout)
    removeListeners()
}

export const initSessionTimeout = () => {
    if (active) return
    active = true

    events.forEach(event => {
        window.addEventListener(event, reset)
    })

    reset()
}