import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function PublicRoute({ children }) {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (user) {
        // Redirect authenticated users to dashboard or home
        return <Navigate to="/dashboard" replace />;
    }

    // If not logged in, allow access to public pages (signup, login, etc.)
    return children;
}