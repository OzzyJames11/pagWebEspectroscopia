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
import styles from "../../assets/css/Elements/DataTable.module.css";
// import Button from "../../components/Elements/Button.jsx"; // Parece que no se usa aquí
import DeleteIcon from "@mui/icons-material/Delete";
import TooltipHeader from "./TooltipHeader";
import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";

// Agregamos maxHeight como prop con un valor por defecto
const DataTable = ({ columns, data, onDelete, tooltips = {}, maxHeight = "550px" }) => {
  
  const allTooltips = {
      ...COMMON_TOOLTIPS,
      ...tooltips 
  };

  return (
      <TableContainer 
        component={Paper} 
        className={styles.dataTableContainer}
        // Aplicamos la altura máxima aquí
        sx={{ maxHeight: maxHeight }} 
      >
          <Table stickyHeader aria-label="sticky table" className={styles.tableFit}>
              <TableHead>
                  <TableRow>
                      {columns.map((column, index) => (
                          <TableCell key={index} className={styles.tableHeader}
                          sx={{
                          // Aquí se modifica el tamaño de fuente de todos los titulos
                          fontSize: '18px !important', // Prueba con 12.5px o 13px
                          padding: '8px 5px !important', // Reducimos padding lateral
                          '& .MuiTypography-root': {
                              fontSize: 'inherit',
                              fontWeight: 'bold'
                          },
                          '& *': { // Asegura que cualquier hijo (span, div) respete el tamaño
                              fontSize: 'inherit' 
                          }
                      }}
                          >
                              <TooltipHeader 
                                  title={column} 
                                  tooltip={allTooltips[column]} 
                              />
                          </TableCell>
                      ))}
                      <TableCell className={styles.tableHeader}
                      sx={{
                        // Aqui se modifica el tamaño de fuente de "Actions"
                          fontSize: '18px !important',
                          padding: '8px 4px !important',
                          '& .MuiTypography-root': {
                          fontSize: 'inherit',
                          fontWeight: 'bold'
                      },
                      '& *': { 
                          fontSize: 'inherit' 
                      }
                          
                      }}
                      >
                          <TooltipHeader 
                              title="Actions" 
                              tooltip={allTooltips["Actions"]} 
                          />
                      </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className={styles.tableRow}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={styles.tableCell}>
                        {row[column]}
                      </TableCell>
                    ))}
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