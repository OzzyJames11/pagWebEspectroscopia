// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   server: {
//     host: true
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': '/src', // El alias '@' apunta a la carpeta src
//     }
//   }
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Permite conexiones desde la red (IP y dominio)
    port: 443,       // El puerto que te solicitó TI
    strictPort: true,
    allowedHosts: [
      'remotesolarlabec.epn.edu.ec', // 👈 ESTO SOLUCIONA EL MENSAJE DE ERROR
      'localhost'
    ]
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})