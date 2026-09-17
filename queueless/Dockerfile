FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/queueless-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]