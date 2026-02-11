# PagWebEspectroscopia

Repositorio para la interfaz web y servicios auxiliares del proyecto de espectroscopía.

## Descripción

Aplicación web en React (Vite) para visualización y control de experimentos de espectroscopía. Incluye un backend Node/Express que interactúa con Firebase y un servicio en Python para comunicación con el espectrómetro.

## Estructura principal

- `src/` - Código del frontend (React, componentes, estilos, rutas).
- `public/` - Activos estáticos del frontend.
- `pgConFirebaseBACK_3/pgConFirebaseBACK/` - Backend Node/Express para integración con Firebase y puertos seriales.
- `spectrometer-service/` - Servicio Python (FastAPI/uvicorn) y dependencias para comunicación con espectrómetro.

## Tecnologías

- Frontend: React, Vite, MUI, Redux, Chart.js, Leaflet.
- Backend: Node.js, Express, Firebase Admin.
- Servicio hardware: Python, FastAPI, uvicorn, numpy, matplotlib.

## Requisitos

- Node.js (>=16) y npm
- Python 3.10+ y `pip`

## Instalación y ejecución

Frontend (interfaz web):

```bash
cd pagWebEspectroscopia-3-Funcionando/pagWebEspectroscopia-3-Funcionando
npm install
npm run dev
```

Disponibles en `package.json` los scripts: `dev`, `build`, `preview`, `lint`.

Backend Node/Express (Firebase integration):

```bash
cd pgConFirebaseBACK_3/pgConFirebaseBACK
npm install
# Ejecutar servidor (según archivo deseado)
node server.js
# o
node serverAngulo.js
```

Nota: el backend incluye la clave de servicio de Firebase en `pruebaerasmus-*.json`. No comités secretos en repositorios públicos.

Servicio del espectrómetro (Python):

```bash
cd spectrometer-service
python -m venv .venv
.\\.venv\\Scripts\\activate   # Windows
pip install -r requirements.txt
# Ejecutar con uvicorn si el app es FastAPI
uvicorn app.main:app --reload --port 8000
```

Los resultados y salidas del espectrómetro se encuentran en `spectrometer-service/output/`.

## Configuración

- Frontend: revisa `src/firebaseConfig.js` para configurar Firebase (API keys públicas). Evita subir credenciales privadas.
- Backend: coloca credenciales privadas de Firebase (archivo JSON) en `pgConFirebaseBACK_3/pgConFirebaseBACK/` y configura variables de entorno si es necesario.

## Puntos importantes

- El frontend usa Vite y React 19; las dependencias están en `package.json`.
- Hay dos servicios que deben ejecutarse por separado: el backend Node y el servicio Python para el espectrómetro.

