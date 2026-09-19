Per avviare il progetto:
1) Assicurarsi di avere Docker Desktop installato
2) Assicurarsi che Docker Desktop sia correttamente in esecuzione
3) Eseguire da linea di comando "docker compose up" all'interno della cartella BugBoard26

Per il corretto funzionamento del progetto:
1) Assicurarsi di avere PostgreSQL installato
2) Assicurarsi di avere un database di nome "bugboard26" con nome utente e password corretti, in base
alla configurazione del progetto (di default: "postgres" e "password")
3) Assicurarsi che, se aperto mediante un IDE, questo contenga riferimenti a librerie utilizzate, tra cui
Lombok
4) Preferibile utilizzare la stessa versione jdk utilizzata durante lo sviluppo: 21

Il progetto verrà eseguito localmente, su localhost