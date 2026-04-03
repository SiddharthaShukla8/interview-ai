import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ToastProvider } from "./components/ToastContext.jsx"
import ToastContainer from "./components/Toast.jsx"

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </InterviewProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
