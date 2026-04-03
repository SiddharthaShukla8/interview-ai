import { createBrowserRouter, Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import OAuthCallback from './features/auth/pages/OAuthCallback';
import Protected from './features/auth/components/Protected';
import Home from './features/interview/pages/Home';
import Interview from './features/interview/pages/Interview';
import Header from './components/Header';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -6 },
};

const AnimatedOutlet = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex-1 flex flex-col"
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    );
};

const AppLayout = () => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col relative w-full">
            <AnimatedOutlet />
        </main>
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { path: 'login',                   element: <Login /> },
            { path: 'register',                element: <Register /> },
            { path: 'oauth/callback',           element: <OAuthCallback /> },
            { index: true,                     element: <Protected><Home /></Protected> },
            { path: 'interview/:interviewId',  element: <Protected><Interview /></Protected> },
        ],
    },
]);