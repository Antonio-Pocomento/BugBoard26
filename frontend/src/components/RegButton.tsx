import { useNavigate } from "react-router-dom";

function RegButton() {
    const navigate = useNavigate();

    const handleOnClickReg = () => {
        navigate("/register");
    };

    return (
        <button onClick={handleOnClickReg}>
            Registrazione Utenti
        </button>
    );
}

export default RegButton;