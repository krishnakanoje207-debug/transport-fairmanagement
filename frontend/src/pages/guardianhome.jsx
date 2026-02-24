// GuardianHome simply redirects to UserHome
// Both modes (user/guardian) are handled in UserHome via dashboardMode context
import { Navigate } from 'react-router-dom';
export default function GuardianHome() { return <Navigate to="/dashboard" replace />; }
