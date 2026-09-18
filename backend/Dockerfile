FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copiamo prima solo i file di Maven
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Rendiamo eseguibile mvnw e scarichiamo le dipendenze
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Ora copiamo il resto del codice
COPY src ./src

EXPOSE 8080

# Esegue direttamente con Maven, niente build/packaging separato:
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.address=0.0.0.0"]