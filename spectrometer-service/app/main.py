# from fastapi import FastAPI, HTTPException
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# import subprocess
# import os
# # CORS para que el frontend pueda hacer solicitudes
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# # ==== CORS CONFIGURACIÓN ====
# origins = [
#     "http://localhost:5173",  # React (Vite) local
#     # En producción cambia esto por tu dominio
#     # "https://tusitio.com",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class MedicionInput(BaseModel):
#     integration_time: float  # en milisegundos

# class IntegrationRequest(BaseModel):
#     integration_time: float

# # ==== RUTAS ====
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
# SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "UV_NIR_codeSpectrometer.py")


# # === ENDPOINTS ===
# # @app.post("/run-spectrometer/")
# # def run_spectrometer(integration_time: float):
# #     if not 0.01 <= integration_time <= 100:
# #         raise HTTPException(status_code=400, detail="El tiempo de integración debe estar entre 0.01 y 100 ms.")

# #     try:
# #         subprocess.run(["python", SCRIPT_PATH, str(integration_time)], check=True)
# #         image_path = os.path.join(OUTPUT_DIR, "espectro_completo.png")
# #         if not os.path.exists(image_path):
# #             raise HTTPException(status_code=500, detail="No se generó la imagen.")
# #         return FileResponse(image_path, media_type="image/png", filename="espectro_completo.png")
# #     except subprocess.CalledProcessError as e:
# #         raise HTTPException(status_code=500, detail=f"Falló la ejecución del espectrómetro: {str(e)}")

# @app.post("/run-spectrometer/")
# def run_spectrometer(req: IntegrationRequest):
#     integration_time = req.integration_time

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


# @app.get("/descargar/espectro")
# def descargar_espectro_completo():
#     file_path = os.path.join(OUTPUT_DIR, "espectro_completo.png")
#     if os.path.exists(file_path):
#         return FileResponse(file_path, media_type='image/png', filename="espectro_completo.png")
#     raise HTTPException(status_code=404, detail="Archivo no encontrado")


# @app.get("/descargar/datos")
# def descargar_datos():
#     file_path = os.path.join(OUTPUT_DIR, "espectro_completo.txt")
#     if os.path.exists(file_path):
#         return FileResponse(file_path, media_type='text/plain', filename="espectro_completo.txt")
#     raise HTTPException(status_code=404, detail="Archivo no encontrado")

# @app.post("/medir")
# def medir_spectro(input: MedicionInput):
#     tiempo = input.integration_time
#     try:
#         # Llama al script Python pasando el tiempo como argumento
#         subprocess.run(
#             ["python", "UV_NIR_codeSpectrometer.py", str(tiempo)],
#             check=True
#         )
#         return {"message": "Medición completada con éxito"}
#     except subprocess.CalledProcessError as e:
#         return {"detail": "Fallo al ejecutar el script", "error": str(e)}





import os
import subprocess
import threading
import io
import zipfile
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, db

# ==== CONFIGURACIÓN MODO SIMULACIÓN ====
# Cámbialo a "False" cuando el espectrómetro esté conectado físicamente
SIMULATION_MODE = "True" 

# ==== CONFIGURACIÓN FIREBASE ====
# 1. Obtiene la ruta de la carpeta actual (la carpeta 'app')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Une la ruta de la carpeta con el nombre de tu archivo JSON
CREDENTIALS_FILE = os.path.join(BASE_DIR, "webpaneles-firebase-adminsdk-fbsvc-ed6304ccb9.json")
DATABASE_URL = "https://webpaneles-default-rtdb.firebaseio.com"

cred = credentials.Certificate(CREDENTIALS_FILE)
firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todo para pruebas con Ngrok
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "UV_NIR_codeSpectrometer.py")
LOCAL_STORAGE_BASE = os.path.join(os.path.dirname(__file__), "local_storage", "users")

# ==== RUTAS DE DESCARGA DINÁMICAS ====
@app.get("/descargar/espectro/{uid}/{sweep_id}")
def descargar_espectro_completo(uid: str, sweep_id: str):
    file_path = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", sweep_id, "espectro_completo.png")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='image/png', filename=f"espectro_{sweep_id}.png")
    raise HTTPException(status_code=404, detail="Imagen no encontrada")

@app.get("/descargar/datos/{uid}/{sweep_id}")
def descargar_datos(uid: str, sweep_id: str):
    file_path = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", sweep_id, "espectro_completo.txt")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/plain', filename=f"datos_{sweep_id}.txt")
    raise HTTPException(status_code=404, detail="Archivo TXT no encontrado")

@app.get("/descargar/graficas/{uid}/{meas_id}")
def descargar_graficas_multiples(uid: str, meas_id: str, completo: str = "false", uv: str = "false", visible: str = "false", nir: str = "false"):
    base_dir = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", meas_id)
    
    # Lista para guardar las imágenes que el usuario sí seleccionó
    archivos_a_comprimir = []
    
    # Revisar cuáles son verdaderos ("true") y agregar su nombre de archivo
    if completo.lower() == "true": archivos_a_comprimir.append("espectro_completo.png")
    if uv.lower() == "true": archivos_a_comprimir.append("espectro_uv.png")
    if visible.lower() == "true": archivos_a_comprimir.append("espectro_visible.png")
    if nir.lower() == "true": archivos_a_comprimir.append("espectro_nir.png")
    
    if not archivos_a_comprimir:
        raise HTTPException(status_code=400, detail="No seleccionaste ninguna gráfica para descargar")

    # Crear el archivo ZIP en la memoria RAM
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for archivo in archivos_a_comprimir:
            file_path = os.path.join(base_dir, archivo)
            if os.path.exists(file_path):
                # Guarda el archivo dentro del zip
                zip_file.write(file_path, arcname=archivo)
    
    # Retroceder el cursor de la memoria al inicio del archivo
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=espectros_{meas_id}.zip"}
    )

# ==== LISTENER DE FIREBASE ====
def firebase_listener(event):
    if not event.data or not isinstance(event.data, str):
        return
    
    path_parts = event.path.strip('/').split('/')
    # Ahora verificamos correctamente la estructura dentro de 'users'
    if len(path_parts) >= 4 and path_parts[1] == "Exp4" and path_parts[-1] == "FrontToBack":
        uid = path_parts[0]
        comando = event.data
        
        if comando.startswith("s"):
            integration_time = comando[1:]
            print(f"[NUEVA ORDEN] Usuario {uid} solicita medición de {integration_time}ms.")
            
            # Cambiamos sweepId por MeasurementId
            meas_ref = db.reference(f'users/{uid}/Exp4/currentMeasurementId')
            meas_id = meas_ref.get()
            
            if not meas_id:
                print(f"[ERROR] No hay currentMeasurementId para {uid}. Abortando.")
                return

            try:
                print(f"-> Ejecutando script para {meas_id} en modo simulación: {SIMULATION_MODE}...")
                subprocess.run(["python", SCRIPT_PATH, integration_time, uid, meas_id, SIMULATION_MODE], check=True)
                print("-> Script finalizado con éxito.")
                
                # Actualizar el estado de la medición a "completed"
                db.reference(f'users/{uid}/Exp4/measurements/{meas_id}/status').set("completed")

                # Notificar al Frontend
                db.reference(f'users/{uid}/Exp4/communication/BackToFront').set("ScanComplete")
                # Limpiar el comando
                db.reference(f'users/{uid}/Exp4/communication/FrontToBack').set("x")
                
            except subprocess.CalledProcessError as e:
                print(f"[ERROR] Falló la ejecución del espectrómetro: {e}")

def start_listener():
    print("[SYSTEM] Iniciando Listener de Firebase para Exp4 en el nodo 'users'...")
    # ESTE ERA EL ERROR: Estaba escuchando 'usuarios' en lugar de 'users'
    db.reference('users').listen(firebase_listener)

threading.Thread(target=start_listener, daemon=True).start()