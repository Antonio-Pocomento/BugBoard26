import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { type User } from "../model/User";

function NavButton({ title, onClick, danger }: { title: string; onClick?: () => void; danger?: boolean }) {
    return (
        <button className={`btn-secondary ${danger ? 'btn-secondary--danger' : ''}`} onClick={onClick}>
            {title}
        </button>
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
        <div className="page-grid-bg page-centered page-centered--middle">
            <div className="surface-card dashboard-panel">
                <h1 className="surface-card__title">Benvenuto, {currentUser.email}</h1>
                <div className="dashboard-button-group">
                    {currentUser.role === 'ADMIN' && (
                        <NavButton title="Registrazione Utenti" onClick={() => navigate('/register')} />
                    )}
                    {currentUser.role !== 'READONLY' && (
                        <NavButton title="Segnala Problemi" onClick={() => navigate('/issue')} />
                    )}
                    <NavButton title="Visualizza Problemi" onClick={() => navigate('/issueViewer')} />
                    {currentUser.role === 'ADMIN' && (
                        <NavButton title="Visualizza Report Mensili" onClick={() => navigate('/reportViewer')} />
                    )}
                    <NavButton title="Log-out" onClick={handleLogoutClick} danger />
                </div>
            </div>
        </div>
    );
}