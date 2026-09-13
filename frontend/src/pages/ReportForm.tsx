import {useState} from "react";
import './ReportForm.css';
import {type MonthlyReportInfo} from "../model/Info.ts";
import {getInfo} from "../services/adminService.ts";


function MyButton({ title, onClick, disabled }: { title: string, onClick?: () => void, disabled?: boolean }) {
    return (
        <button className="dashboard-button" onClick={onClick} disabled={disabled}>{title}</button>
    );
}

export function ReportForm(){
    const [info, setInfo] = useState<MonthlyReportInfo | null>(null);
    const [date, setDate] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null);
        setSuccess(null);

        try{
            setIsLoading(true);
            const data = await getInfo(date);
            setInfo(data);
            setSuccess('Report caricato con successo!');
        } catch(err){
            setError(err instanceof Error ? err.message: 'Errore durante il caricamento del report');
        } finally {
            setIsLoading(false);
        }

    }


    return(
        <div className={'report-page'} >
            {error && <div className="issue-error">{error}</div>}

            <div className={"report"}>
                {info == null && <p>Nessun Report Selezionato: premi il pulsante dopo aver scelto un mese</p>}
                {(info != null && info.isEmpty) && <p>Nessun Report disponibile per questo mese</p>}
                {(info != null && !info.isEmpty) &&
                    <>
                        <h1>{info.periodLabel}</h1>
                        {info.users.map((u)=>(
                                <div key={u.userId}>
                                    <h3><strong>Email:</strong>{u.email}</h3>
                                    <p><strong>Numero di issue aperte:</strong> {u.opened}</p>
                                    <p><strong>Numero di issue risolte:</strong> {u.resolved}</p>
                                    <p><strong>Tempo di risoluzione medio:</strong> {u.avgResolutionLabel}</p>
                                    <p><strong>Tasso di risoluzione:</strong> {u.resolutionRateLabel}</p>
                                </div>
                            ))}
                    </>
                }
            </div>

            <input type="month" value={date} onChange={(e) => setDate(e.target.value)}/>

            <MyButton title={isLoading ? "Caricamento..." : "Mostra Report"} onClick={handleReport} disabled={isLoading} />

        </div>
    )

}