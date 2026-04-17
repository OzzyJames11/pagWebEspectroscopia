// export const TURNOS_CONFIG = {
//     // Cuántos minutos antes del fin "real" de la hora termina el experimento
//     TIEMPO_BUFFER_FIN_MINUTOS: 10, 
    
//     // Cuántos minutos antes de ese "Fin Ajustado" se muestra la alerta
//     TIEMPO_ALERTA_PREVIA_MINUTOS: 51, 
//   };
  
export const TURNOS_CONFIG = {
    // Minutos que le robamos al final del turno para apagar el hardware (Ej: 10:00 - 10 min = 9:50)
    MINUTOS_RECORTE_FIN: 10, 
    
    // Minutos ANTES del corte en los que aparece la alerta (Ej: 9:50 - 10 min = 9:40)
    MINUTOS_ALERTA_PREVIA: 10, 
  };