import "./Dashboard.css"
import { useNavigate } from "react-router-dom";

function MyButton({ title, onClick }: { title: string, onClick?: () => void }) {
    return (
        //<button className="dashboard" onClick={onClick}>{title}</button>
        <button className="dashboard-button" onClick={onClick}>{title}</button>
    );
}

interface DashboardProps {
    onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-panel">
                <h1>Schermata Amministratore</h1>
                <div className="dashboard-button-group">
                    <MyButton title="Registrazione Utenti" onClick={() => navigate('/register')} />
                    <MyButton title="Segnala Problemi" onClick={() => navigate('/issue')} />
                    <MyButton title="Visualizza Problemi" onClick={() => navigate('/issueViewer')} />
                    <MyButton title="Log-out" onClick={handleLogoutClick} />
                </div>
            </div>
        </div>
    );
}