import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import '../auth.form.scss'

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const { loading, user, handleRegister } = useAuth()

    // If still checking auth on first load, show spinner
    if (loading) {
        return <main><h1>Loading...</h1></main>
    }

    // If already logged in, go straight to home
    if (user) {
        return <Navigate to="/" />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (error) {
            const msg = error?.response?.data?.message || "Registration failed. Please try again."
            setError(msg)
            console.error("Register failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {error && (
                    <p style={{ color: "red", marginBottom: "12px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" id="username" name='username' placeholder='Enter username'
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name='email' placeholder='Enter email address'
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name='password' placeholder='Enter password'
                            required
                        />
                    </div>

                    <button className='button primary-button' disabled={isSubmitting}>
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>

                <p>Already have an account? <Link to={"/login"}>Login</Link></p>
            </div>
        </main>
    )
}

export default Register