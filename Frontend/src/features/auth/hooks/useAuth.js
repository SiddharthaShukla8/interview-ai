import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading } = context


    const handleLogin = async ({ email, password }) => {
        try {
            const data = await login({ email, password })
            if (data?.token) {
                localStorage.setItem('token', data.token)
            }
            setUser(data.user)
            return true
        } catch (err) {
            throw err
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        try {
            const data = await register({ username, email, password })
            if (data?.token) {
                localStorage.setItem('token', data.token)
            }
            setUser(data.user)
            return true
        } catch (err) {
            throw err
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            localStorage.removeItem('token')
            setUser(null)
        } catch (err) {
            throw err
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}