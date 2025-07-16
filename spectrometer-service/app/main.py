from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import os
# CORS para que el frontend pueda hacer solicitudes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ==== CORS CONFIGURACIÓN ====
origins = [
    "http://localhost:5173",  # React (Vite) local
    # En producción cambia esto por tu dominio
    # "https://tusitio.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MedicionInput(BaseModel):
    integration_time: float  # en milisegundos

class IntegrationRequest(BaseModel):
    integration_time: float

# ==== RUTAS ====
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "UV_NIR_codeSpectrometer.py")


# === ENDPOINTS ===
# @app.post("/run-spectrometer/")
# def run_spectrometer(integration_time: float):
#     if not 0.01 <= integration_time <= 100:
#         raise HTTPException(status_code=400, detail="El tiempo de integración debe estar entre 0.01 y 100 ms.")

#     try:
#         subprocess.run(["python", SCRIPT_PATH, str(integration_time)], check=True)
#         image_path = os.path.join(OUTPUT_DIR, "espectro_completo.png")
#         if not os.path.exists(image_path):
#             raise HTTPException(status_code=500, detail="No se generó la imagen.")
#         return FileResponse(image_path, media_type="image/png", filename="espectro_completo.png")
#     except subprocess.CalledProcessError as e:
#         raise HTTPException(status_code=500, detail=f"Falló la ejecución del espectrómetro: {str(e)}")

@app.post("/run-spectrometer/")
def run_spectrometer(req: IntegrationRequest):
    integration_time = req.integration_time

    if not 0.01 <= integration_time <= 100:
        raise HTTPException(status_code=400, detail="El tiempo de integración debe estar entre 0.01 y 100 ms.")

    try:
        subprocess.run(["python", SCRIPT_PATH, str(integration_time)], check=True)
        image_path = os.path.join(OUTPUT_DIR, "espectro_completo.png")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=500, detail="No se generó la imagen.")
        return FileResponse(image_path, media_type="image/png", filename="espectro_completo.png")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Falló la ejecución del espectrómetro: {str(e)}")


@app.get("/descargar/espectro")
def descargar_espectro_completo():
    file_path = os.path.join(OUTPUT_DIR, "espectro_completo.png")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='image/png', filename="espectro_completo.png")
    raise HTTPException(status_code=404, detail="Archivo no encontrado")


@app.get("/descargar/datos")
def descargar_datos():
    file_path = os.path.join(OUTPUT_DIR, "espectro_completo.txt")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/plain', filename="espectro_completo.txt")
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

@app.post("/medir")
def medir_spectro(input: MedicionInput):
    tiempo = input.integration_time
    try:
        # Llama al script Python pasando el tiempo como argumento
        subprocess.run(
            ["python", "UV_NIR_codeSpectrometer.py", str(tiempo)],
            check=True
        )
        return {"message": "Medición completada con éxito"}
    except subprocess.CalledProcessError as e:
        return {"detail": "Fallo al ejecutar el script", "error": str(e)}