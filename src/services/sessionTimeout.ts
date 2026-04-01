import api from "@/services/api"

let warningTimeout: any
let logoutTimeout: any
let active = false

const events = ["mousemove", "keydown", "click", "scroll"]

export const reset = () => {
    if (!active) return

    clearTimeout(warningTimeout)
    clearTimeout(logoutTimeout)

    window.dispatchEvent(new Event("hide-logout-warning"))

    warningTimeout = setTimeout(() => {
        window.dispatchEvent(new Event("show-logout-warning"))
    }, 45 * 1000)

    logoutTimeout = setTimeout(() => {
        console.warn("Sesión expirada por inactividad")
        logoutUser()
    }, 60 * 1000)
}

const removeListeners = () => {
    events.forEach(event => {
        window.removeEventListener(event, reset)
    })
}

export const logoutUser = async () => {
    try {
        await api.post("/api/logout/")
    } catch (e) { }

    stopSessionTimeout()

    window.dispatchEvent(new Event("force-logout"))
}

export const stopSessionTimeout = () => {
    active = false
    clearTimeout(warningTimeout)
    clearTimeout(logoutTimeout)
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