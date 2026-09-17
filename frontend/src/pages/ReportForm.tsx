import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './ReportForm.css';
import { type MonthlyReportInfo } from "../model/Info.ts";
import { getInfo } from "../services/adminService.ts";

function ActionButton({title, onClick, disabled, accent = true, className,}: {
    title: string;
    onClick?: () => void;
    disabled?: boolean;
    accent?: boolean;
    className?: string;
}) {
    return (
        <button
            className={`btn-secondary btn-secondary--compact ${accent ? 'btn-secondary--accent' : ''} ${className ?? ''}`.trim()}
            onClick={onClick}
            disabled={disabled}
        >
            {title}
        </button>
    );
}

export function ReportForm() {
    const navigate = useNavigate();
    const [info, setInfo] = useState<MonthlyReportInfo | null>(null);
    const [date, setDate] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleReport = async () => {
        try {
            setIsLoading(true);
            const data = await getInfo(date);
            setInfo(data);
            setError(null);
            setSuccess(data.isEmpty ? null : 'Report caricato con successo!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il caricamento del report');
            setSuccess(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-grid-bg">
            <div className="report-page">
                <div className="report-controls">
                    <ActionButton title="← Indietro" onClick={() => navigate('/')} className="report-back-button" accent={false}/>
                    <label className="report-label">Seleziona mese</label>
                    <input type="month" className="report-month-input" value={date} onChange={(e) => setDate(e.target.value)} />
                    <ActionButton title="Mostra Report" onClick={handleReport} disabled={isLoading} />
                </div>

                {error && <div className="alert alert--error">{error}</div>}
                {success && <div className="alert alert--success">{success}</div>}

                {info == null && (
                    <p className="report-placeholder">Nessun report selezionato: scegli un mese e premi "Mostra Report".</p>
                )}
                {info != null && info.isEmpty && (
                    <p className="report-placeholder">Nessun report disponibile per questo mese.</p>
                )}
                {info != null && !info.isEmpty && (
                    <>
                        <h1 className="report-period">{info.periodLabel}</h1>
                        <div className="report-user-grid">
                            {info.users.map((u) => (
                                <div key={u.userId} className="report-user-card">
                                    <h3 className="report-user-email">{u.email}</h3>
                                    <div className="report-user-stats">
                                        <div className="report-stat">
                                            <span className="report-stat-label">Issue aperte</span>
                                            <span className="report-stat-value">{u.opened}</span>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-stat-label">Issue risolte</span>
                                            <span className="report-stat-value">{u.resolved}</span>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-stat-label">Tempo medio risoluzione</span>
                                            <span className="report-stat-value">{u.avgResolutionLabel}</span>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-stat-label">Tasso di risoluzione</span>
                                            <span className="report-stat-value">{u.resolutionRateLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}