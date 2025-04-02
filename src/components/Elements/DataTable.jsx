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
import Button from "../../components/Elements/Button.jsx";
import DeleteIcon from "@mui/icons-material/Delete"; // Ícono de basurero

/**
 * Componente de tabla reutilizable para mostrar datos en filas y columnas.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {string[]}} props.columns - Lista de nombres de columnas.
 * @param {Object[]} props.data - Arreglo de objetos con los datos a mostrar.
 *
 * @example
 * const columns = ["Nombre", "Edad", "País"];
 * const data = [
 *   { Nombre: "Juan", Edad: 25, País: "México" },
 *   { Nombre: "Ana", Edad: 30, País: "España" },
 * ];
 *
 * <DataTable columns={columns} data={data} />
 *
 * @returns {JSX.Element} Tabla de datos renderizada.
 */

const DataTable = ({ columns, data, onDelete }) => {
  return (
    <TableContainer component={Paper} className={styles.dataTableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} className={styles.tableHeader}>
                {column}
              </TableCell>
            ))}
            <TableCell className={styles.tableHeader}>Actions</TableCell>{""}
            {/* Columna para acciones */}
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
                  onClick={() => onDelete(rowIndex)} // Llama a la función onDelete con el índice de la fila
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
