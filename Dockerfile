# === Etap 1: Budowanie i instalacja zależności ===
FROM oven/bun:1 AS base
WORKDIR /app

# Kopiujemy pliki konfiguracyjne paczek
COPY package.json bun.lock ./

# Instalujemy wszystkie zależności (w tym devDependencies do ewentualnych testów/typów)
RUN bun install --frozen-lockfile

# Kopiujemy resztę kodu źródłowego
COPY . .

# (Opcjonalnie) Jeśli chcesz uruchomić testy przed zbudowaniem obrazu:
# RUN bun test

# === Etap 2: Czysty obraz produkcyjny ===
FROM oven/bun:1-slim AS release
WORKDIR /app

# Kopiujemy zainstalowane node_modules i kod z poprzedniego etapu
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/src ./src
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/tsconfig.json ./tsconfig.json

# Ustawiamy zmienne środowiskowe
ENV NODE_ENV=production
USER bun
EXPOSE 3000

# Odpalamy aplikację bezpośrednio przez Buna wskazując na Composition Root
CMD [ "bun", "run", "src/index.ts" ]