# -*- coding: utf-8 -*-
"""
Example Title: UV_NIR_codeSpectrometer.py
Example Date of Creation(YYYY-MM-DD): 2025-04-02
Example Date of Last Modification on Github: 
Version of Python used for Testing and IDE: 3.13.2
Version of the Thorlabs SDK used: ThorSpectra version 3.25
==================
Example Description: 
"""
import csv  # Agregado para guardar CSV
import random
import os
import time
import matplotlib.pyplot as plt
import math
from ctypes import *

import sys
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


#os.chdir(r"C:\Program Files\IVI Foundation\VISA\Win64\Bin")
lib = cdll.LoadLibrary("TLCCS_64.dll")

# Para la inicialización, el nombre del recurso debe cambiarse por el nombre del dispositivo conectado.
# El nombre del recurso tiene este formato: USB0::0x1313::<ID de producto>::<número de serie>::RAW. 
#
#Product IDs are:
# 0x8081   // CCS100 Compact Spectrometer
# 0x8083   // CCS125 Special Spectrometer 
# 0x8085   // CCS150 UV Spectrometer 
# 0x8087   // CCS175 NIR Spectrometer 
# 0x8089   // CCS200 UV-NIR Spectrometer
#
# El número de serie está impreso en el espectrómetro CCS.
#
#E.g.: "USB0::0x1313::0x8089::M00428858::RAW" para un CCS200 con número serial M00428858

ccs_handle=c_int(0)
lib.tlccs_init(b"USB0::0x1313::0x8089::M01109647::RAW", 1, 1, byref(ccs_handle))   

# Pedir al usuario que introduzca la hora de integración.
integration_time=c_double(0)

# Codigo para que funciones por input del teclado
# try:
#     # Para mayor comodidad, el tiempo de integración se introduce aquí en ms.
#     # Pero tenga en cuenta que tlccs_setIntegrationTime tiene segundos como entrada, de ahí el factor de 0,001.
#     integration_time = c_double(0.001 * float(input("Please enter the integration time of the spectrometer in ms (allowed range is 0.01 - 100 ms): ")))
#     if  integration_time.value < 1e-5:
#         print("Entered integration time is too small. Integration time will be set to 0.01 ms.")
#         integration_time = c_double(1e-5)     
#     elif integration_time.value > 1e-1:
#         print("Entered integration time is too high. Integration time will be set to 100 ms.")
#         integration_time = c_double(1e-1)
# except:
#     print("Error: Incorrect input. Please do not use letters, only use numbers.")
#     print("Code will be stopped.")
#     exit()

# Codigo para que tome los valores de la pagWeb
try:
    if len(sys.argv) < 2:
        print("Error: No integration time provided.")
        exit()

    integration_time = c_double(0.001 * float(sys.argv[1]))
    if integration_time.value < 1e-5:
        print("Entered integration time is too small. Integration time will be set to 0.01 ms.")
        integration_time = c_double(1e-5)
    elif integration_time.value > 1e-1:
        print("Entered integration time is too high. Integration time will be set to 100 ms.")
        integration_time = c_double(1e-1)
except:
    print("Error: Invalid integration time.")
    exit()

# Configurar el tiempo de integración en segundos, rango entre ranging from 1e-5 to 0.1
lib.tlccs_setIntegrationTime(ccs_handle, integration_time)

# Comenzar escaneo
lib.tlccs_startScan(ccs_handle)

wavelengths=(c_double*3648)()

lib.tlccs_getWavelengthData(ccs_handle, 0, byref(wavelengths), c_void_p(None), c_void_p(None))

# Recuperar datos
data_array=(c_double*3648)()
lib.tlccs_getScanData(ccs_handle, byref(data_array))

# Convertir los arreglos ctypes a listas de Python
wavelengths_list = list(wavelengths)
data_list = list(data_array)

rows = zip(wavelengths_list, data_list)

# Guardar CSV con todos los datos
with open(os.path.join(OUTPUT_DIR, "espectro_completo.txt"), mode="w", newline="", encoding="utf-8") as file:
    file.write('Longitud de Onda;Intensidad\n')
    for wl, inten in rows:
        file.write(f'{wl};{inten}\n')
       

# Filtramos los valores para región espectral
uv_wavelengths = [wavelengths_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]
uv_intensity = [data_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]

visible_wavelengths = [wavelengths_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]
visible_intensity = [data_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]

nir_wavelengths = [wavelengths_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]
nir_intensity = [data_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]

# Función para guardar cada espectro como imagen
def guardar_espectro(nombre_archivo, longitudes, intensidades, color, titulo):
    plt.figure(figsize=(8, 5))
    plt.plot(longitudes, intensidades, color=color, label=titulo)
    plt.xlabel("Wavelength [nm]")
    plt.ylabel("Intensity [a.u.]")
    plt.title(titulo)
    plt.legend()
    plt.grid(True)
    plt.savefig(nombre_archivo, dpi=300)
    plt.close()  # Para no superponer figuras

def guardar_espectro_completo(nombre_archivo, longitudes_uv, longitudes_visible, longitudes_nir, intensidades_uv, intensidades_visible, intensidades_nir, color_uv, color_visible, color_nir, titulo_uv, titulo_visible,titulo_nir):
    plt.figure(figsize=(8, 5))
    plt.plot(longitudes_uv, intensidades_uv, color=color_uv, label=titulo_uv)
    plt.plot(longitudes_visible, intensidades_visible, color=color_visible, label=titulo_visible)
    plt.plot(longitudes_nir, intensidades_nir, color=color_nir, label=titulo_nir)
    plt.xlabel("Wavelength [nm]")
    plt.ylabel("Intensity [a.u.]")
    plt.title("Complete Spectrum")
    plt.legend()
    plt.grid(True)
    plt.savefig(nombre_archivo, dpi=300)
    plt.close()  # Para no superponer figuras

# Guardar imágenes individuales
guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_uv.png"), uv_wavelengths, uv_intensity, "blue", "UV Spectrum")
guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_visible.png"), visible_wavelengths, visible_intensity, "green", "Visible Spectrum")
guardar_espectro(os.path.join(OUTPUT_DIR, "espectro_nir.png"), nir_wavelengths, nir_intensity, "red", "NIR Spectrum")
guardar_espectro_completo(os.path.join(OUTPUT_DIR, "espectro_completo.png"), uv_wavelengths,visible_wavelengths,nir_wavelengths,uv_intensity,visible_intensity,nir_intensity,"blue","green","red","UV Spectrum","Visible Spectrum", "NIR Spectrum")

print("Espectros guardados como imágenes y datos exportados a 'espectro_completo.txt'.")


