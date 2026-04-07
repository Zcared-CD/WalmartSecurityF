import api from "@/services/api"

let warningTimeout: any
let logoutTimeout: any
let active = false
let idleDetector: any = null
let lastActivity = Date.now()

const TAB_KEY = "active_tab_id"
const tabId = Date.now().toString()
const events = ["click", "keydown"]

export const reset = () => {
    if (!active) return

    if (!document.hasFocus()) return

    const now = Date.now()

    if (now - lastActivity < 1000) return

    lastActivity = now

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
        document.removeEventListener(event, reset)
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

export const initIdleDetection = async () => {
    if (!("IdleDetector" in window)) {
        console.warn("Idle Detection no soportado")
        return
    }

    try {
        const permission = await (window as any).IdleDetector.requestPermission()

        if (permission !== "granted") {
            console.warn("Permiso Idle Detection denegado")
            return
        }

        idleDetector = new (window as any).IdleDetector()

        await idleDetector.start({
            threshold: 60000,
        })

        idleDetector.addEventListener("change", () => {
            const userState = idleDetector.userState

            if (userState === "idle") {
                console.warn("IdleDetection: usuario inactivo")

                window.dispatchEvent(new Event("show-logout-warning"))

                setTimeout(() => {
                    logoutUser()
                }, 15000)
            }
        })

    } catch (error) {
        console.error("Error Idle Detection:", error)
    }
}

export const initTabControl = () => {
    localStorage.setItem(TAB_KEY, tabId)

    window.addEventListener("storage", (event) => {
        if (event.key === TAB_KEY) {
            if (event.newValue !== tabId) {
                console.warn("Otra pestaña detectada 🚫")

                alert("Solo puedes tener una sesión abierta")

                logoutUser()
            }
        }
    })
}

export const initSessionTimeout = () => {
    if (active) return
    active = true

    events.forEach(event => {
        document.addEventListener(event, reset)
    })

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            reset()
        }
    })

    initTabControl()

    reset()
}