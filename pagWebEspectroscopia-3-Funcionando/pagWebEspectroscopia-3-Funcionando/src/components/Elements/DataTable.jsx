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
import TooltipHeader from "./TooltipHeader";
import { COMMON_TOOLTIPS } from "../../assets/Strings/Experiments/CommonTooltips.jsx";

const DataTable = ({ columns, data, onDelete, tooltips = {} }) => {
  // Combina tooltips específicos con los comunes
  const allTooltips = {
      ...COMMON_TOOLTIPS,
      ...tooltips // Los tooltips específicos sobrescriben los comunes
  };

  return (
      <TableContainer component={Paper} className={styles.dataTableContainer}>
          <Table>
              <TableHead>
                  <TableRow>
                      {columns.map((column, index) => (
                          <TableCell key={index} className={styles.tableHeader}>
                              <TooltipHeader 
                                  title={column} 
                                  tooltip={allTooltips[column]} 
                              />
                          </TableCell>
                      ))}
                      <TableCell className={styles.tableHeader}>
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