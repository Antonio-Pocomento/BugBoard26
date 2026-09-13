import "./Dashboard.css"
import { useNavigate } from "react-router-dom";
import { type User } from "../model/User";

function MyButton({ title, onClick }: { title: string, onClick?: () => void }) {
    return (
        <button className="dashboard-button" onClick={onClick}>{title}</button>
    );
}

interface DashboardProps {
    currentUser: User;
    onLogout: () => void;
}

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-panel">
                <h1>Benvenuto, {currentUser.email}</h1>
                <div className="dashboard-button-group">
                    {currentUser.role === 'ADMIN' && (
                        <MyButton title="Registrazione Utenti" onClick={() => navigate('/register')} />
                    )}
                    {currentUser.role !== 'READONLY' && (
                        <MyButton title="Segnala Problemi" onClick={() => navigate('/issue')} />
                    )}
                    <MyButton title="Visualizza Problemi" onClick={() => navigate('/issueViewer')} />
                    {currentUser.role === 'ADMIN' && (
                        <MyButton title="Visualizza Report Mensili" onClick={() => navigate('/reportViewer')} />
                    )}
                    <MyButton title="Log-out" onClick={handleLogoutClick} />
                </div>
            </div>
        </div>
    );
}