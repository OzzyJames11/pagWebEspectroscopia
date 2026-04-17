// import React from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
// } from "@mui/material";
// import styles from "../../assets/css/Elements/DataTable.module.css";
// // import Button from "../../components/Elements/Button.jsx"; // Parece que no se usa aquí
// import DeleteIcon from "@mui/icons-material/Delete";
// import TooltipHeader from "./TooltipHeader";
// import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";

// // Agregamos maxHeight como prop con un valor por defecto
// const DataTable = ({ columns, data, onDelete, tooltips = {}, maxHeight = "550px" }) => {
  
//   const allTooltips = {
//       ...COMMON_TOOLTIPS,
//       ...tooltips 
//   };

//   return (
//       <TableContainer 
//         component={Paper} 
//         className={styles.dataTableContainer}
//         // Aplicamos la altura máxima aquí
//         sx={{ maxHeight: maxHeight }} 
//       >
//           <Table stickyHeader aria-label="sticky table" className={styles.tableFit}>
//               <TableHead>
//                   <TableRow>
//                       {columns.map((column, index) => (
//                           <TableCell key={index} className={styles.tableHeader}
//                           sx={{
//                           // Aquí se modifica el tamaño de fuente de todos los titulos
//                           fontSize: '18px !important', // Prueba con 12.5px o 13px
//                           padding: '8px 5px !important', // Reducimos padding lateral
//                           '& .MuiTypography-root': {
//                               fontSize: 'inherit',
//                               fontWeight: 'bold'
//                           },
//                           '& *': { // Asegura que cualquier hijo (span, div) respete el tamaño
//                               fontSize: 'inherit' 
//                           }
//                       }}
//                           >
//                               <TooltipHeader 
//                                   title={column} 
//                                   tooltip={allTooltips[column]} 
//                               />
//                           </TableCell>
//                       ))}
//                       <TableCell className={styles.tableHeader}
//                       sx={{
//                         // Aqui se modifica el tamaño de fuente de "Actions"
//                           fontSize: '18px !important',
//                           padding: '8px 4px !important',
//                           '& .MuiTypography-root': {
//                           fontSize: 'inherit',
//                           fontWeight: 'bold'
//                       },
//                       '& *': { 
//                           fontSize: 'inherit' 
//                       }
                          
//                       }}
//                       >
//                           <TooltipHeader 
//                               title="Actions" 
//                               tooltip={allTooltips["Actions"]} 
//                           />
//                       </TableCell>
//                   </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.map((row, rowIndex) => (
//                   <TableRow key={rowIndex} className={styles.tableRow}>
//                     {columns.map((column, colIndex) => (
//                       <TableCell key={colIndex} className={styles.tableCell}>
//                         {row[column]}
//                       </TableCell>
//                     ))}
//                     <TableCell className={styles.tableCell}>
//                       <IconButton
//                         aria-label="delete"
//                         onClick={() => onDelete(rowIndex)}
//                         color="error"
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//           </Table>
//       </TableContainer>
//   );
// };

// export default DataTable;


import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
// Asegúrate de que esta ruta apunte a tu nuevo CSS con Poppins
import styles from "../../assets/css/Elements/DataTable.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import TooltipHeader from "./TooltipHeader";
import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";

const DataTable = ({ columns, data, onDelete, tooltips = {}, maxHeight = "550px", disableTooltips = false }) => {
  
  const allTooltips = {
      ...COMMON_TOOLTIPS,
      ...tooltips 
  };

  // Limpia el título para encontrar el Tooltip correcto
  // Ejemplo: "Voltage \n(V)" -> se convierte en "Voltage"
  const getTooltipKey = (label) => {
    if (!label) return "";
    return label.split('\n')[0].trim(); 
  };

  return (
      <TableContainer 
        component={Paper} 
        className={styles.dataTableContainer}
        sx={{ maxHeight: maxHeight, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }} 
      >
          <Table stickyHeader aria-label="sticky table" className={styles.tableFit}>
          <TableHead>
                  <TableRow>
                    {columns.map((column, index) => {
                          // ✅ Obtenemos la llave limpia (sin \n ni unidades)
                          const cleanKey = getTooltipKey(column);

                          return (
                            <TableCell key={index} className={styles.tableHeader}>
                                <TooltipHeader 
                                    title={column} 
                                    // ✅ Buscamos en el diccionario usando la llave limpia
                                    tooltip={disableTooltips ? "" : (allTooltips[cleanKey] || allTooltips[column])} 
                                />
                            </TableCell>
                          );
                      })}
                      <TableCell className={styles.tableHeader}>
                          <TooltipHeader 
                              title="Actions" 
                              // ✅ Lo mismo para Actions
                              tooltip={disableTooltips ? "" : allTooltips["Actions"]} 
                          />
                      </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={styles.tableRow}>
                    {columns.map((column, colIndex) => {
                      // Determinar si es la última columna de datos antes de 'Actions'
                      const isLastDataColumn = colIndex === columns.length - 1;
                      // Aplicar la clase para forzar el borde derecho si es la última columna de datos
                      const cellClass = isLastDataColumn 
                        ? `${styles.tableCell} ${styles.forceRightBorder}` 
                        : styles.tableCell;

                      return (
                        <TableCell key={colIndex} className={cellClass}>
                          {row[column]}
                        </TableCell>
                      );
                    })}
                    <TableCell className={styles.tableCell}>
                      <IconButton
                        aria-label="delete"
                        onClick={() => onDelete(rowIndex)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
      </TableContainer>
  );
};

export default DataTable;