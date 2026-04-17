# # -*- coding: utf-8 -*-
# """
# Example Title: UV_NIR_codeSpectrometer.py
# Example Date of Creation(YYYY-MM-DD): 2025-04-02
# Example Date of Last Modification on Github: 
# Version of Python used for Testing and IDE: 3.13.2
# Version of the Thorlabs SDK used: ThorSpectra version 3.25
# ==================
# Example Description: 
# """
# import csv  # Agregado para guardar CSV
# import random
# import os
# import time
# import matplotlib.pyplot as plt
# import math
# from ctypes import *

# import sys
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
# os.makedirs(OUTPUT_DIR, exist_ok=True)


# #os.chdir(r"C:\Program Files\IVI Foundation\VISA\Win64\Bin")

# # ozzyjames11: desactivado temporalmente
# # lib = cdll.LoadLibrary("TLCCS_64.dll")

# # Para la inicialización, el nombre del recurso debe cambiarse por el nombre del dispositivo conectado.
# # El nombre del recurso tiene este formato: USB0::0x1313::<ID de producto>::<número de serie>::RAW. 
# #
# #Product IDs are:
# # 0x8081   // CCS100 Compact Spectrometer
# # 0x8083   // CCS125 Special Spectrometer 
# # 0x8085   // CCS150 UV Spectrometer 
# # 0x8087   // CCS175 NIR Spectrometer 
# # 0x8089   // CCS200 UV-NIR Spectrometer
# #
# # El número de serie está impreso en el espectrómetro CCS.
# #
# #E.g.: "USB0::0x1313::0x8089::M00428858::RAW" para un CCS200 con número serial M00428858

# ccs_handle=c_int(0)

# # ozzyjames11: comentado temporalmente
# # lib.tlccs_init(b"USB0::0x1313::0x8089::M01109647::RAW", 1, 1, byref(ccs_handle))   

# # ozzyjames11: agregado temporalmente
# current_dir = os.path.dirname(os.path.abspath(__file__))
# lib_path = os.path.join(current_dir, "TLCCS_64.dll")
# try:
#     lib = cdll.LoadLibrary(lib_path)
#     print("✅ Librería TLCCS_64.dll cargada correctamente.")
# except Exception as e:
#     print(f"❌ No se encontró la DLL en {lib_path}. Error: {e}")
#     exit()

# # resource_name = b"USB0::0x1313::0x8089::M01109647::RAW"
# # Intenta con este nombre primero (el formato INSTR es más amigable para NI-VISA)
# # resource_name = b"USB0::0x1313::0x8089::M01109647::INSTR"
# resource_name = b"USB0::0x1313::0x8089::M00325088::RAW"
# ccs_handle = c_int(0)
# # Intentamos inicializar (el segundo parámetro '1' es para buscar el ID de forma absoluta)
# res = lib.tlccs_init(resource_name, 1, 1, byref(ccs_handle))

# if res != 0:
#     print(f"❌ Error al inicializar: {res}")
#     print("Ayuda: Si el error es -1073807343, Windows no está asignando el puerto USB al driver VISA.")
#     exit()
# else:
#     print("🚀 Espectrómetro conectado y listo!")

# # res = lib.tlccs_init(b"USB0::0x1313::0x8089::M01109647::RAW", 1, 1, byref(ccs_handle))
# # if res != 0:
# #     print(f"Error al inicializar: {res}")
# # else:
# #     print("Espectrómetro inicializado correctamente.")

# # Pedir al usuario que introduzca la hora de integración.
# integration_time=c_double(0)

# # Codigo para que funciones por input del teclado
# # try:
# #     # Para mayor comodidad, el tiempo de integración se introduce aquí en ms.
# #     # Pero tenga en cuenta que tlccs_setIntegrationTime tiene segundos como entrada, de ahí el factor de 0,001.
# #     integration_time = c_double(0.001 * float(input("Please enter the integration time of the spectrometer in ms (allowed range is 0.01 - 100 ms): ")))
# #     if  integration_time.value < 1e-5:
# #         print("Entered integration time is too small. Integration time will be set to 0.01 ms.")
# #         integration_time = c_double(1e-5)     
# #     elif integration_time.value > 1e-1:
# #         print("Entered integration time is too high. Integration time will be set to 100 ms.")
# #         integration_time = c_double(1e-1)
# # except:
# #     print("Error: Incorrect input. Please do not use letters, only use numbers.")
# #     print("Code will be stopped.")
# #     exit()

# # Codigo para que tome los valores de la pagWeb
# try:
#     if len(sys.argv) < 2:
#         print("Error: No integration time provided.")
#         exit()

#     integration_time = c_double(0.001 * float(sys.argv[1]))
#     if integration_time.value < 1e-5:
#         print("Entered integration time is too small. Integration time will be set to 0.01 ms.")
#         integration_time = c_double(1e-5)
#     elif integration_time.value > 1e-1:
#         print("Entered integration time is too high. Integration time will be set to 100 ms.")
#         integration_time = c_double(1e-1)
# except:
#     print("Error: Invalid integration time.")
#     exit()

# # Configurar el tiempo de integración en segundos, rango entre ranging from 1e-5 to 0.1
# lib.tlccs_setIntegrationTime(ccs_handle, integration_time)

# # Comenzar escaneo
# lib.tlccs_startScan(ccs_handle)

# # ozzyjames11: modificaciones para el S4
# time.sleep(integration_time.value + 0.5)

# wavelengths=(c_double*3648)()

# lib.tlccs_getWavelengthData(ccs_handle, 0, byref(wavelengths), c_void_p(None), c_void_p(None))

# # Recuperar datos
# data_array=(c_double*3648)()
# lib.tlccs_getScanData(ccs_handle, byref(data_array))

# # Convertir los arreglos ctypes a listas de Python
# wavelengths_list = list(wavelengths)
# data_list = list(data_array)

# rows = zip(wavelengths_list, data_list)

# # Guardar CSV con todos los datos
# with open(os.path.join(OUTPUT_DIR, "espectro_completo.txt"), mode="w", newline="", encoding="utf-8") as file:
#     file.write('Longitud de Onda;Intensidad\n')
#     for wl, inten in rows:
#         file.write(f'{wl};{inten}\n')
       

# # Filtramos los valores para región espectral
# uv_wavelengths = [wavelengths_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]
# uv_intensity = [data_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]

# visible_wavelengths = [wavelengths_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]
# visible_intensity = [data_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]

# nir_wavelengths = [wavelengths_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]
# nir_intensity = [data_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]

# # Función para guardar cada espectro como imagen
# def guardar_espectro(nombre_archivo, longitudes, intensidades, color, titulo):
#     plt.figure(figsize=(8, 5))
#     plt.plot(longitudes, intensidades, color=color, label=titulo)
#     plt.xlabel("Wavelength [nm]")
#     plt.ylabel("Intensity [a.u.]")
#     plt.title(titulo)
#     plt.legend()
#     plt.grid(True)
#     plt.savefig(nombre_archivo, dpi=300)
#     plt.close()  # Para no superponer figuras

# def guardar_espectro_completo(nombre_archivo, longitudes_uv, longitudes_visible, longitudes_nir, intensidades_uv, intensidades_visible, intensidades_nir, color_uv, color_visible, color_nir, titulo_uv, titulo_visible,titulo_nir):
#     plt.figure(figsize=(8, 5))
#     plt.plot(longitudes_uv, intensidades_uv, color=color_uv, label=titulo_uv)
#     plt.plot(longitudes_visible, intensidades_visible, color=color_visible, label=titulo_visible)
#     plt.plot(longitudes_nir, intensidades_nir, color=color_nir, label=titulo_nir)
#     plt.xlabel("Wavelength [nm]")
#     plt.ylabel("Intensity [a.u.]")
#     plt.title("Complete Spectrum")
#     plt.legend()
#     plt.grid(True)
#     plt.savefig(nombre_archivo, dpi=300)
#     plt.close()  # Para no superponer figuras

# # Guardar imágenes individuales
# guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_uv.png"), uv_wavelengths, uv_intensity, "blue", "UV Spectrum")
# guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_visible.png"), visible_wavelengths, visible_intensity, "green", "Visible Spectrum")
# guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_nir.png"), nir_wavelengths, nir_intensity, "red", "NIR Spectrum")
# guardar_espectro_completo(os.path.join(OUTPUT_DIR, "espectro_completo.png"), uv_wavelengths,visible_wavelengths,nir_wavelengths,uv_intensity,visible_intensity,nir_intensity,"blue","green","red","UV Spectrum","Visible Spectrum", "NIR Spectrum")

# print("Espectros guardados como imágenes y datos exportados a 'espectro_completo.txt'.")





# ozzyjames11: este codigo si vale
# import os
# import sys
# import time
# import shutil
# import matplotlib.pyplot as plt
# from ctypes import *

# # 1. RECIBIR ARGUMENTOS DE LA TERMINAL
# if len(sys.argv) < 5:
#     print("Error: Faltan argumentos. Uso: python script.py <tiempo_ms> <uid> <meas_id> <sim_mode>")
#     exit()

# tiempo_integracion_ms = float(sys.argv[1])
# uid = sys.argv[2]
# meas_id = sys.argv[3]
# sim_mode = sys.argv[4] == "True"

# # 2. CREAR RUTAS DE DIRECTORIO ESTRUCTURADAS
# current_dir = os.path.dirname(os.path.abspath(__file__))
# # Directorio donde están tus datos de prueba viejos
# OUTPUT_DIR_VIEJO = os.path.join(current_dir, "output") 
# # Nuevo directorio dinámico por usuario y barrido
# DEST_DIR = os.path.join(current_dir, "local_storage", "users", uid, "Exp4", meas_id)
# os.makedirs(DEST_DIR, exist_ok=True)

# # ==========================================
# # MODO SIMULACIÓN (Trabajo desde casa)
# # ==========================================
# if sim_mode:
#     print(f"[SIMULACIÓN] Copiando datos de prueba a la carpeta del usuario {uid}...")
#     archivos = ["espectro_completo.png", "espectro_uv.png", "espectro_visible.png", "espectro_nir.png", "espectro_completo.txt"]
#     for arc in archivos:
#         src = os.path.join(OUTPUT_DIR_VIEJO, arc)
#         dst = os.path.join(DEST_DIR, arc)
#         if os.path.exists(src):
#             shutil.copy(src, dst)
#     print("[SIMULACIÓN] Proceso finalizado.")
#     exit()

# # ==========================================
# # MODO REAL (Laboratorio)
# # ==========================================
# lib_path = os.path.join(current_dir, "TLCCS_64.dll")
# try:
#     lib = cdll.LoadLibrary(lib_path)
# except Exception as e:
#     print(f"❌ No se encontró la DLL. Error: {e}")
#     exit()

# resource_name = b"USB0::0x1313::0x8089::M00325088::RAW"
# ccs_handle = c_int(0)
# res = lib.tlccs_init(resource_name, 1, 1, byref(ccs_handle))

# if res != 0:
#     print(f"❌ Error al conectar con hardware: {res}")
#     exit()

# integration_time = c_double(0.001 * tiempo_integracion_ms)
# lib.tlccs_setIntegrationTime(ccs_handle, integration_time)
# lib.tlccs_startScan(ccs_handle)

# time.sleep(integration_time.value + 0.5)

# wavelengths = (c_double * 3648)()
# lib.tlccs_getWavelengthData(ccs_handle, 0, byref(wavelengths), c_void_p(None), c_void_p(None))

# data_array = (c_double * 3648)()
# lib.tlccs_getScanData(ccs_handle, byref(data_array))

# wavelengths_list = list(wavelengths)
# data_list = list(data_array)
# rows = zip(wavelengths_list, data_list)

# # 3. GUARDAR RESULTADOS EN LA CARPETA DINÁMICA
# with open(os.path.join(DEST_DIR, "espectro_completo.txt"), mode="w", newline="", encoding="utf-8") as file:
#     file.write('Longitud de Onda;Intensidad\n')
#     for wl, inten in rows:
#         file.write(f'{wl};{inten}\n')

# uv_wavelengths = [wl for wl in wavelengths_list if 200 <= wl < 400]
# uv_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 200 <= wl < 400]
# visible_wavelengths = [wl for wl in wavelengths_list if 400 <= wl < 700]
# visible_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 400 <= wl < 700]
# nir_wavelengths = [wl for wl in wavelengths_list if 700 <= wl <= 1100]
# nir_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 700 <= wl <= 1100]

# def guardar_espectro_completo(nombre_archivo, l_uv, l_vis, l_nir, i_uv, i_vis, i_nir):
#     plt.figure(figsize=(8, 5))
#     plt.plot(l_uv, i_uv, color="blue", label="UV Spectrum")
#     plt.plot(l_vis, i_vis, color="green", label="Visible Spectrum")
#     plt.plot(l_nir, i_nir, color="red", label="NIR Spectrum")
#     plt.xlabel("Wavelength [nm]")
#     plt.ylabel("Intensity [a.u.]")
#     plt.title("Complete Spectrum")
#     plt.legend()
#     plt.grid(True)
#     plt.savefig(os.path.join(DEST_DIR, nombre_archivo), dpi=300)
#     plt.close()

# guardar_espectro_completo("espectro_completo.png", uv_wavelengths, visible_wavelengths, nir_wavelengths, uv_intensity, visible_intensity, nir_intensity)
# # (Puedes agregar las demás gráficas individuales aquí siguiendo la misma lógica, apuntando a DEST_DIR)

# lib.tlccs_close(ccs_handle) # Muy importante liberar el equipo
# print(f"Medición real guardada para {uid} en {meas_id}.")



import os
import sys
import time
import shutil
import matplotlib.pyplot as plt
from ctypes import *

# 1. RECIBIR ARGUMENTOS DE LA TERMINAL
if len(sys.argv) < 5:
    print("Error: Faltan argumentos. Uso: python script.py <tiempo_ms> <uid> <meas_id> <sim_mode>")
    exit()

tiempo_integracion_ms = float(sys.argv[1])
uid = sys.argv[2]
meas_id = sys.argv[3]
sim_mode = sys.argv[4] == "True"

# 2. CREAR RUTAS DE DIRECTORIO ESTRUCTURADAS
current_dir = os.path.dirname(os.path.abspath(__file__))
# Directorio donde están tus datos de prueba viejos
OUTPUT_DIR_VIEJO = os.path.join(current_dir, "output") 
# Nuevo directorio dinámico por usuario y barrido
DEST_DIR = os.path.join(current_dir, "local_storage", "users", uid, "Exp4", meas_id)
os.makedirs(DEST_DIR, exist_ok=True)

# ==========================================
# MODO SIMULACIÓN (Trabajo desde casa)
# ==========================================
if sim_mode:
    print(f"[SIMULACIÓN] Copiando datos de prueba a la carpeta del usuario {uid}...")
    archivos = ["espectro_completo.png", "espectro_uv.png", "espectro_visible.png", "espectro_nir.png", "espectro_completo.txt"]
    for arc in archivos:
        src = os.path.join(OUTPUT_DIR_VIEJO, arc)
        dst = os.path.join(DEST_DIR, arc)
        if os.path.exists(src):
            shutil.copy(src, dst)
    print("[SIMULACIÓN] Proceso finalizado.")
    exit()

# ==========================================
# MODO REAL (Laboratorio)
# ==========================================
lib_path = os.path.join(current_dir, "TLCCS_64.dll")
try:
    lib = cdll.LoadLibrary(lib_path)
except Exception as e:
    print(f"❌ No se encontró la DLL. Error: {e}")
    exit()

resource_name = b"USB0::0x1313::0x8089::M00325088::RAW"
ccs_handle = c_int(0)
res = lib.tlccs_init(resource_name, 1, 1, byref(ccs_handle))

if res != 0:
    print(f"❌ Error al conectar con hardware: {res}")
    exit()

integration_time = c_double(0.001 * tiempo_integracion_ms)
lib.tlccs_setIntegrationTime(ccs_handle, integration_time)
lib.tlccs_startScan(ccs_handle)

time.sleep(integration_time.value + 0.5)

wavelengths = (c_double * 3648)()
lib.tlccs_getWavelengthData(ccs_handle, 0, byref(wavelengths), c_void_p(None), c_void_p(None))

data_array = (c_double * 3648)()
lib.tlccs_getScanData(ccs_handle, byref(data_array))

wavelengths_list = list(wavelengths)
data_list = list(data_array)
rows = zip(wavelengths_list, data_list)

# 3. GUARDAR RESULTADOS EN LA CARPETA DINÁMICA
with open(os.path.join(DEST_DIR, "espectro_completo.txt"), mode="w", newline="", encoding="utf-8") as file:
    file.write('Longitud de Onda;Intensidad\n')
    for wl, inten in rows:
        file.write(f'{wl};{inten}\n')

# Filtrar los datos por rangos
uv_wavelengths = [wl for wl in wavelengths_list if 200 <= wl < 400]
uv_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 200 <= wl < 400]

visible_wavelengths = [wl for wl in wavelengths_list if 400 <= wl < 700]
visible_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 400 <= wl < 700]

nir_wavelengths = [wl for wl in wavelengths_list if 700 <= wl <= 1100]
nir_intensity = [inten for wl, inten in zip(wavelengths_list, data_list) if 700 <= wl <= 1100]

# --- FUNCIONES DE GRAFICACIÓN ---
def guardar_espectro_completo(nombre_archivo, l_uv, l_vis, l_nir, i_uv, i_vis, i_nir):
    plt.figure(figsize=(8, 5))
    plt.plot(l_uv, i_uv, color="blue", label="UV Spectrum")
    plt.plot(l_vis, i_vis, color="green", label="Visible Spectrum")
    plt.plot(l_nir, i_nir, color="red", label="NIR Spectrum")
    plt.xlabel("Wavelength [nm]")
    plt.ylabel("Intensity [a.u.]")
    plt.title("Complete Spectrum")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(DEST_DIR, nombre_archivo), dpi=300)
    plt.close()

# NUEVA FUNCIÓN: Dibuja un solo rango a la vez
def guardar_espectro_individual(nombre_archivo, l_onda, intensidad, color, label, titulo):
    if not l_onda: # Evita que matplotlib explote si el sensor no capta nada en ese rango
        return
    plt.figure(figsize=(8, 5))
    plt.plot(l_onda, intensidad, color=color, label=label)
    plt.xlabel("Wavelength [nm]")
    plt.ylabel("Intensity [a.u.]")
    plt.title(titulo)
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(DEST_DIR, nombre_archivo), dpi=300)
    plt.close()

# --- EJECUCIÓN DE LAS GRÁFICAS ---
# 1. Guarda la completa
guardar_espectro_completo("espectro_completo.png", uv_wavelengths, visible_wavelengths, nir_wavelengths, uv_intensity, visible_intensity, nir_intensity)

# 2. Guarda las individuales
guardar_espectro_individual("espectro_uv.png", uv_wavelengths, uv_intensity, "blue", "UV Spectrum", "UV Spectrum (200 - 400 nm)")
guardar_espectro_individual("espectro_visible.png", visible_wavelengths, visible_intensity, "green", "Visible Spectrum", "Visible Spectrum (400 - 700 nm)")
guardar_espectro_individual("espectro_nir.png", nir_wavelengths, nir_intensity, "red", "NIR Spectrum", "NIR Spectrum (700 - 1100 nm)")

lib.tlccs_close(ccs_handle) # Muy importante liberar el equipo
print(f"Medición real guardada para {uid} en {meas_id}.")