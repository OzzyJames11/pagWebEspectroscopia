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




# import serial
# import re
# import time
# import os
# import subprocess
# import threading
# import io
# import zipfile
# from fastapi import FastAPI, HTTPException
# from fastapi.responses import FileResponse, StreamingResponse
# from fastapi.middleware.cors import CORSMiddleware
# import firebase_admin
# from firebase_admin import credentials, db



# # ==== CONFIGURACIÓN MODO SIMULACIÓN ====
# # Cámbialo a "False" cuando el espectrómetro esté conectado físicamente
# SIMULATION_MODE = "True" 

# # ==== CONFIGURACIÓN FIREBASE ====
# # 1. Obtiene la ruta de la carpeta actual (la carpeta 'app')
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# # 2. Une la ruta de la carpeta con el nombre de tu archivo JSON
# CREDENTIALS_FILE = os.path.join(BASE_DIR, "webpaneles-firebase-adminsdk-fbsvc-ed6304ccb9.json")
# DATABASE_URL = "https://webpaneles-default-rtdb.firebaseio.com"

# cred = credentials.Certificate(CREDENTIALS_FILE)
# firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], # Permitir todo para pruebas con Ngrok
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "UV_NIR_codeSpectrometer.py")
# LOCAL_STORAGE_BASE = os.path.join(os.path.dirname(__file__), "local_storage", "users")




# # ==== RUTAS DE DESCARGA DINÁMICAS ====
# @app.get("/descargar/espectro/{uid}/{sweep_id}")
# def descargar_espectro_completo(uid: str, sweep_id: str):
#     file_path = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", sweep_id, "espectro_completo.png")
#     if os.path.exists(file_path):
#         return FileResponse(file_path, media_type='image/png', filename=f"espectro_{sweep_id}.png")
#     raise HTTPException(status_code=404, detail="Imagen no encontrada")

# @app.get("/descargar/datos/{uid}/{sweep_id}")
# def descargar_datos(uid: str, sweep_id: str):
#     file_path = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", sweep_id, "espectro_completo.txt")
#     if os.path.exists(file_path):
#         return FileResponse(file_path, media_type='text/plain', filename=f"datos_{sweep_id}.txt")
#     raise HTTPException(status_code=404, detail="Archivo TXT no encontrado")

# @app.get("/descargar/graficas/{uid}/{meas_id}")
# def descargar_graficas_multiples(uid: str, meas_id: str, completo: str = "false", uv: str = "false", visible: str = "false", nir: str = "false"):
#     base_dir = os.path.join(LOCAL_STORAGE_BASE, uid, "Exp4", meas_id)
    
#     # Lista para guardar las imágenes que el usuario sí seleccionó
#     archivos_a_comprimir = []
    
#     # Revisar cuáles son verdaderos ("true") y agregar su nombre de archivo
#     if completo.lower() == "true": archivos_a_comprimir.append("espectro_completo.png")
#     if uv.lower() == "true": archivos_a_comprimir.append("espectro_uv.png")
#     if visible.lower() == "true": archivos_a_comprimir.append("espectro_visible.png")
#     if nir.lower() == "true": archivos_a_comprimir.append("espectro_nir.png")
    
#     if not archivos_a_comprimir:
#         raise HTTPException(status_code=400, detail="No seleccionaste ninguna gráfica para descargar")

#     # Crear el archivo ZIP en la memoria RAM
#     zip_buffer = io.BytesIO()
#     with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
#         for archivo in archivos_a_comprimir:
#             file_path = os.path.join(base_dir, archivo)
#             if os.path.exists(file_path):
#                 # Guarda el archivo dentro del zip
#                 zip_file.write(file_path, arcname=archivo)
    
#     # Retroceder el cursor de la memoria al inicio del archivo
#     zip_buffer.seek(0)
    
#     return StreamingResponse(
#         zip_buffer,
#         media_type="application/zip",
#         headers={"Content-Disposition": f"attachment; filename=espectros_{meas_id}.zip"}
#     )

# # ==== LISTENER DE FIREBASE ====
# def firebase_listener(event):
#     if not event.data or not isinstance(event.data, str):
#         return
    
#     path_parts = event.path.strip('/').split('/')
#     # Ahora verificamos correctamente la estructura dentro de 'users'
#     if len(path_parts) >= 4 and path_parts[1] == "Exp4" and path_parts[-1] == "FrontToBack":
#         uid = path_parts[0]
#         comando = event.data
        
#         if comando.startswith("s"):
#             integration_time = comando[1:]
#             print(f"[NUEVA ORDEN] Usuario {uid} solicita medición de {integration_time}ms.")
            
#             # Cambiamos sweepId por MeasurementId
#             meas_ref = db.reference(f'users/{uid}/Exp4/currentMeasurementId')
#             meas_id = meas_ref.get()
            
#             if not meas_id:
#                 print(f"[ERROR] No hay currentMeasurementId para {uid}. Abortando.")
#                 return

#             try:
#                 print(f"-> Ejecutando script para {meas_id} en modo simulación: {SIMULATION_MODE}...")
#                 subprocess.run(["python", SCRIPT_PATH, integration_time, uid, meas_id, SIMULATION_MODE], check=True)
#                 print("-> Script finalizado con éxito.")
                
#                 # Actualizar el estado de la medición a "completed"
#                 db.reference(f'users/{uid}/Exp4/measurements/{meas_id}/status').set("completed")

#                 # Notificar al Frontend
#                 db.reference(f'users/{uid}/Exp4/communication/BackToFront').set("ScanComplete")
#                 # Limpiar el comando
#                 db.reference(f'users/{uid}/Exp4/communication/FrontToBack').set("x")
                
#             except subprocess.CalledProcessError as e:
#                 print(f"[ERROR] Falló la ejecución del espectrómetro: {e}")

# def start_listener():
#     print("[SYSTEM] Iniciando Listener de Firebase para Exp4 en el nodo 'users'...")
#     # ESTE ERA EL ERROR: Estaba escuchando 'usuarios' en lugar de 'users'
#     db.reference('users').listen(firebase_listener)

# threading.Thread(target=start_listener, daemon=True).start()


import serial
import re
import time
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
SIMULATION_MODE = "Falso" 

# ==== CONFIGURACIÓN FIREBASE ====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "webpaneles-firebase-adminsdk-fbsvc-ed6304ccb9.json")
DATABASE_URL = "https://webpaneles-default-rtdb.firebaseio.com"

cred = credentials.Certificate(CREDENTIALS_FILE)
firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

# ==== NUEVA CONFIGURACIÓN FILTROS (ARDUINO 4) ====
PUERTO_FILTROS = "COM8"
filtros_data = {
    "referencia": 0.0,
    "filtroAmarillo": 0.0,
    "filtroAzul": 0.0,
    "filtroRojo": 0.0
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "UV_NIR_codeSpectrometer.py")
LOCAL_STORAGE_BASE = os.path.join(os.path.dirname(__file__), "local_storage", "users")

# ==== RUTAS DE DESCARGA (Fase 1: Espectrómetro) ====
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
    archivos_a_comprimir = []
    if completo.lower() == "true": archivos_a_comprimir.append("espectro_completo.png")
    if uv.lower() == "true": archivos_a_comprimir.append("espectro_uv.png")
    if visible.lower() == "true": archivos_a_comprimir.append("espectro_visible.png")
    if nir.lower() == "true": archivos_a_comprimir.append("espectro_nir.png")
    
    if not archivos_a_comprimir:
        raise HTTPException(status_code=400, detail="No seleccionaste ninguna gráfica")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for archivo in archivos_a_comprimir:
            file_path = os.path.join(base_dir, archivo)
            if os.path.exists(file_path):
                zip_file.write(file_path, arcname=archivo)
    zip_buffer.seek(0)
    return StreamingResponse(zip_buffer, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename=espectros_{meas_id}.zip"})

# ==== HILO DE ESCUCHA USB (Fase 2: Filtros) ====
def serial_filters_listener():
    print(f"[SERIAL] 📡 Iniciando escucha de filtros en {PUERTO_FILTROS}...")
    try:
        ser = serial.Serial(PUERTO_FILTROS, 9600, timeout=1)
        while True:
            if ser.in_waiting > 0:
                linea = ser.readline().decode('utf-8', errors='ignore').strip()
                
                # Control por terminal: Ver lo que dice el Arduino
                if any(x in linea for x in ["PRef", "PAmarillo", "PAzul", "PRojo"]):
                    print(f"[Arduino 4 Raw]: {linea}")

                # Guardar datos en memoria
                m_ref = re.search(r"PRef:\s*([\d.]+)", linea)
                m_am  = re.search(r"PAmarillo:\s*([\d.]+)", linea)
                m_az  = re.search(r"PAzul:\s*([\d.]+)", linea)
                m_ro  = re.search(r"PRojo:\s*([\d.]+)", linea)

                if m_ref: filtros_data["referencia"] = float(m_ref[1])
                if m_am:  filtros_data["filtroAmarillo"] = float(m_am[1])
                if m_az:  filtros_data["filtroAzul"] = float(m_az[1])
                if m_ro:  filtros_data["filtroRojo"] = float(m_ro[1])
    except Exception as e:
        print(f"❌ [ERROR SERIAL FILTROS]: {e}")

# ==== LISTENER DE FIREBASE (El Cerebro) ====
def firebase_listener(event):
    # Ignorar si no hay datos o no es una cadena (ej. borrados o subidas de objetos enteros)
    if not event.data or not isinstance(event.data, str):
        return
    
    # Firebase event.path suele verse como "/8qb4y.../Exp4/communicationFilters/FrontToBack"
    # Lo limpiamos para separar las partes
    ruta_limpia = event.path.strip('/')
    path_parts = ruta_limpia.split('/')
    
    # Necesitamos al menos el UID (índice 0) para saber a quién responder
    if len(path_parts) < 1:
        return
        
    uid = path_parts[0]

    # 1. LÓGICA DEL ESPECTRÓMETRO
    if "communication/FrontToBack" in ruta_limpia and event.data.startswith("s"):
        integration_time = event.data[1:]
        print(f"🔬 [ESPECTRÓMETRO] Orden de {integration_time}ms para {uid}")
        
        meas_ref = db.reference(f'users/{uid}/Exp4/currentMeasurementId')
        meas_id = meas_ref.get()
        
        if not meas_id: return

        try:
            subprocess.run(["python", SCRIPT_PATH, integration_time, uid, meas_id, SIMULATION_MODE], check=True)
            db.reference(f'users/{uid}/Exp4/measurements/{meas_id}/status').set("completed")
            db.reference(f'users/{uid}/Exp4/communication/BackToFront').set("ScanComplete")
            db.reference(f'users/{uid}/Exp4/communication/FrontToBack').set("x")
            print("✅ Escaneo finalizado.")
        except Exception as e:
            print(f"❌ Error Espectrómetro: {e}")

    # 2. LÓGICA DE LOS FILTROS
    elif "communicationFilters/FrontToBack" in ruta_limpia and event.data == "read_sensors":
        print(f"🔔 [FILTROS] Refresh solicitado por {uid}")
        
        ts = int(time.time() * 1000)
        sens_id = f"sens_{ts}"

        # Subimos la "foto" actual de la memoria a Firebase
        db.reference(f'users/{uid}/Exp4/environmentData/{sens_id}').set({
            "timestamp": ts,
            **filtros_data
        })

        # Actualizar punteros y avisar al Front
        db.reference(f'users/{uid}/Exp4/currentSensorMeasurementId').set(sens_id)
        db.reference(f'users/{uid}/Exp4/communicationFilters/BackToFront').set("SensorsComplete")
        db.reference(f'users/{uid}/Exp4/communicationFilters/FrontToBack').set("x")
        print(f"✅ Datos de filtros enviados: {filtros_data}")

def start_listener():
    print("[SYSTEM] Iniciando Listener de Firebase...")
    db.reference('users').listen(firebase_listener)

# ==== ARRANQUE COMPATIBLE CON UVICORN ====
@app.on_event("startup")
def startup_event():
    print("🚀 [SISTEMA HÍBRIDO]: Arrancando hilos de fondo...")
    # 1. Hilo para el USB de los filtros (COM8)
    threading.Thread(target=serial_filters_listener, daemon=True).start()
    
    # 2. Hilo para escuchar las órdenes de Firebase
    threading.Thread(target=start_listener, daemon=True).start()


# Lo que se va a ver en la terminal
# [SERIAL] 📡 Iniciando escucha de filtros en COM8...
# [Arduino 4 Raw]: PRef: 85.20
# [Arduino 4 Raw]: PAmarillo: 60.10
# ...
# 🔔 [REFRESH] Usuario 8qb4... solicitó datos de filtros.
# ✅ [DATOS ENVIADOS]: {'referencia': 85.2, 'filtroAmarillo': 60.1, ...}