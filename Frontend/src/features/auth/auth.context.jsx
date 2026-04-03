import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                localStorage.removeItem('token')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initializeUser()
    }, [])

    return (
        <AuthContext.Provider value={{user, setUser, loading, setLoading}} >
            {children}
        </AuthContext.Provider>
    )
}