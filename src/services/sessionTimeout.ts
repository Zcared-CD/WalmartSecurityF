import api from "@/services/api"
import router from '@/router'

let timeout: any

const logoutUser = async () => {
    try {
        await api.post("/logout/")
    } catch (e) { }

    router.push('/login')
}

const resetTimer = () => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        console.warn("Sesión expirada por inactividad")
        logoutUser()
    }, 10 * 60 * 1000) // 10 minutos
}

export const initSessionTimeout = () => {
    window.onload = resetTimer
    document.onmousemove = resetTimer
    document.onkeypress = resetTimer
    document.onclick = resetTimer
    document.onscroll = resetTimer
}