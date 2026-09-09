import "./Dashboard.css"
import { useNavigate } from "react-router-dom";

function MyButton({ title, onClick }: { title: string, onClick?: () => void }) {
    return (
        <button className="dashboard" onClick={onClick}>{title}</button>
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
        <div>
            <h1>Schermata Amministratore</h1>
            <br /><br />
            <MyButton title="Registrazione Utenti" onClick={() => navigate('/register')} />
            <br /><br />
            <MyButton title="Segnala Problemi" onClick={() => navigate('/register')} />
            <br /><br />
            <MyButton title="Log-out" onClick={handleLogoutClick} />
        </div>
    );
}