# Compilación de la aplicación con Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar el archivo de dependencias y descargar librerías
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el proyecto
COPY src ./src
RUN mvn clean package -DskipTests

# Imagen ligera de ejecución con Java JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar el archivo .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto del microservicio
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]