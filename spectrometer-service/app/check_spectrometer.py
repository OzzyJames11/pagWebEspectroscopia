import pyvisa
try:
    # Forzamos a que use el motor de NI-VISA
    rm = pyvisa.ResourceManager() 
    print("Motor VISA detectado:", rm.visalib)
    resources = rm.list_resources()
    if not resources:
        print("No se encontraron recursos. Intenta conectar el equipo fuera del HUB.")
    else:
        print("Recursos encontrados:", resources)
except Exception as e:
    print("Error al buscar recursos:", e)