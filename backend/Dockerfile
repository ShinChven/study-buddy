# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY src/EduBuddy.Domain/*.csproj src/EduBuddy.Domain/
COPY src/EduBuddy.Application/*.csproj src/EduBuddy.Application/
COPY src/EduBuddy.Infrastructure/*.csproj src/EduBuddy.Infrastructure/
COPY src/EduBuddy.WebApi/*.csproj src/EduBuddy.WebApi/
RUN dotnet restore src/EduBuddy.WebApi/EduBuddy.WebApi.csproj

# Copy everything else and build
COPY . .
WORKDIR /app/src/EduBuddy.WebApi
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "EduBuddy.WebApi.dll"]
