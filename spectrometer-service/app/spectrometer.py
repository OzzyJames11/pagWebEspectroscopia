import csv
import os
import matplotlib.pyplot as plt
from ctypes import *

OUTPUT_DIR = "output"

def ejecutar_lectura(tiempo_ms):
    lib = cdll.LoadLibrary("TLCCS_64.dll")
    ccs_handle = c_int(0)

    lib.tlccs_init(b"USB0::0x1313::0x8089::M01109647::RAW", 1, 1, byref(ccs_handle))

    integration_time = c_double(0.001 * tiempo_ms)
    if integration_time.value < 1e-5:
        integration_time = c_double(1e-5)
    elif integration_time.value > 1e-1:
        integration_time = c_double(1e-1)

    lib.tlccs_setIntegrationTime(ccs_handle, integration_time)
    lib.tlccs_startScan(ccs_handle)

    wavelengths = (c_double * 3648)()
    data_array = (c_double * 3648)()

    lib.tlccs_getWavelengthData(ccs_handle, 0, byref(wavelengths), c_void_p(None), c_void_p(None))
    lib.tlccs_getScanData(ccs_handle, byref(data_array))

    wavelengths_list = list(wavelengths)
    data_list = list(data_array)

    uv_wavelengths = [wavelengths_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]
    uv_intensity = [data_list[i] for i in range(3648) if 200 <= wavelengths_list[i] < 400]

    visible_wavelengths = [wavelengths_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]
    visible_intensity = [data_list[i] for i in range(3648) if 400 <= wavelengths_list[i] < 700]

    nir_wavelengths = [wavelengths_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]
    nir_intensity = [data_list[i] for i in range(3648) if 700 <= wavelengths_list[i] <= 1100]

    def guardar_espectro(nombre_archivo, longitudes, intensidades, color, titulo):
        plt.figure(figsize=(8, 5))
        plt.plot(longitudes, intensidades, color=color, label=titulo)
        plt.xlabel("Wavelength [nm]")
        plt.ylabel("Intensity [a.u.]")
        plt.title(titulo)
        plt.legend()
        plt.grid(True)
        plt.savefig(os.path.join(OUTPUT_DIR, nombre_archivo), dpi=300)
        plt.close()

    def guardar_espectro_completo(nombre_archivo):
        plt.figure(figsize=(8, 5))
        plt.plot(uv_wavelengths, uv_intensity, color="blue", label="UV")
        plt.plot(visible_wavelengths, visible_intensity, color="green", label="Visible")
        plt.plot(nir_wavelengths, nir_intensity, color="red", label="NIR")
        plt.xlabel("Wavelength [nm]")
        plt.ylabel("Intensity [a.u.]")
        plt.title("Complete Spectrum")
        plt.legend()
        plt.grid(True)
        plt.savefig(os.path.join(OUTPUT_DIR, nombre_archivo), dpi=300)
        plt.close()

    # Guardar imágenes
    guardar_espectro("espectro_uv.png", uv_wavelengths, uv_intensity, "blue", "UV Spectrum")
    guardar_espectro("espectro_visible.png", visible_wavelengths, visible_intensity, "green", "Visible Spectrum")
    guardar_espectro("espectro_nir.png", nir_wavelengths, nir_intensity, "red", "NIR Spectrum")
    guardar_espectro_completo("espectro_completo.png")

    # Guardar datos como TXT
    with open(os.path.join(OUTPUT_DIR, "espectro_completo.txt"), mode="w", newline="", encoding="utf-8") as file:
        file.write('Longitud de Onda;Intensidad\n')
        for wl, inten in zip(wavelengths_list, data_list):
            file.write(f'{wl};{inten}\n')

    return {
        "message": "Espectro generado con éxito.",
        "img": {
            "uv": "/static/espectro_uv.png",
            "visible": "/static/espectro_visible.png",
            "nir": "/static/espectro_nir.png",
            "completo": "/static/espectro_completo.png"
        },
        "txt": "/static/espectro_completo.txt"
    }
