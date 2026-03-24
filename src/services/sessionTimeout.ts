import api from "@/services/api"

let timeout: any

const stopListeners = () => {
    window.onload = null
    document.onmousemove = null
    document.onkeypress = null
    document.onclick = null
    document.onscroll = null
}

const logoutUser = async () => {
    try {
        await api.post("/api/logout/")
    } catch (e) { }

    clearTimeout(timeout)
    stopListeners()


    window.location.href = '/login'
}

const resetTimer = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        console.warn("Sesión expirada por inactividad")
        logoutUser()
    }, 1 * 60 * 1000)
}

export const initSessionTimeout = () => {
    window.onload = resetTimer
    document.onmousemove = resetTimer
    document.onkeypress = resetTimer
    document.onclick = resetTimer
    document.onscroll = resetTimer
}
