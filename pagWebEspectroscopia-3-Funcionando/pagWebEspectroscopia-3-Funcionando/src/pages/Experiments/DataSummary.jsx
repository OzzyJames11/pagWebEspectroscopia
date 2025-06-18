import React, { useState, useEffect } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/Elements/DataTable.jsx'; 

import { PAGE_TITLES, ALERT_MESSAGES, SUBSYSTEM_TITLES } from '../../assets/Strings/Experiments/DataSummaryStrings.jsx';
import { SUBSISTEMA1_COLUMNS } from '../../assets/Strings/Experiments/Subsistema1Strings.jsx';
import { SUBSISTEMA2_COLUMNS } from '../../assets/Strings/Experiments/Subsistema2Strings.jsx';

//Importar otros componentes
import Button from '../../components/Elements/Button.jsx';
import { generateCSV } from '../../components/Elements/generateCSV.jsx';


const DataSummary = () => {
    const navigate = useNavigate();
    const {MAIN_TITLE, DESCRIPTION, DOWNLOAD_BUTTON, CLEAR_BUTTON, NO_DATA_MESSAGE, SELECT_SUBSYSTEMS, BACK_BUTTON} = PAGE_TITLES;
    const [datosSubsistema1, setDatosSubsistema1] = useState([]);
    const [datosSubsistema2, setDatosSubsistema2] = useState([]);
    const [datosSubsistema3, setDatosSubsistema3] = useState([]);
    const [datosSubsistema4, setDatosSubsistema4] = useState([]);
    
    const [selectedSystems, setSelectedSystems] = useState({
        subsistema1: true,
        subsistema2: true,
        subsistema3: true,
        subsistema4: true
    });

    useEffect(() => {
        setDatosSubsistema1(JSON.parse(localStorage.getItem("historicalData_subsistema1")) || []);
        setDatosSubsistema2(JSON.parse(localStorage.getItem("historicalData_subsistema2")) || []);
        setDatosSubsistema3(JSON.parse(localStorage.getItem("historicalData_subsistema3")) || []);
        setDatosSubsistema4(JSON.parse(localStorage.getItem("historicalData_subsistema4")) || []);
    }, []);

    const handleClearData = (subsistema) => {
        localStorage.removeItem(`historicalData_${subsistema}`);
        switch (subsistema) {
            case "subsistema1":
                setDatosSubsistema1([]);
                break;
            case "subsistema2":
                setDatosSubsistema2([]);
                break;
            case "subsistema3":
                setDatosSubsistema3([]);
                break;
            case "subsistema4":
                setDatosSubsistema4([]);
                break;
            default:
                break;
        }
    };

    const handleCheckboxChange = (event) => {
        setSelectedSystems({
            ...selectedSystems,
            [event.target.name]: event.target.checked
        });
    };

    const handleDownloadCSV = () => {
        const selectedData = [
            { title: SUBSYSTEM_TITLES.SUBSYSTEM1, data: datosSubsistema1, key: "subsistema1" },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM2, data: datosSubsistema2, key: "subsistema2" },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM3, data: datosSubsistema3, key: "subsistema3" },
            { title: SUBSYSTEM_TITLES.SUBSYSTEM4, data: datosSubsistema4, key: "subsistema4" }
        ].filter(({ key }) => selectedSystems[key]);

        if (selectedData.length === 0) {
            alert(ALERT_MESSAGES.NO_SUBSYSTEM_SELECTED);
            return;
        }

        // Mapa de columnas para cada subsistema
        const columnsMap = {
            subsistema1: SUBSISTEMA1_COLUMNS,
            subsistema2: SUBSISTEMA2_COLUMNS,
            subsistema3: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"],
            subsistema4: ["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]
        };

        // Generar el contenido del CSV
        const csvContent = generateCSV(selectedData, columnsMap);

        // Descargar el archivo CSV
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data_summary.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleBack = () => {
        navigate('/experiments/experimentChooser');
    };

    const NoDataMessage  = () => (
        <Typography variant="body1" align="center">{NO_DATA_MESSAGE}</Typography>
    );

    return (
        <div>
            <Box width="90%" maxWidth="1200px" margin="auto" mt={11} mb={5}>
                <Typography variant="h4" gutterBottom>{MAIN_TITLE}</Typography>
                <Typography variant="body1" gutterBottom> {DESCRIPTION}</Typography>
                
                {/* Subsistema 1 */}
                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM1}</Typography>
                    {datosSubsistema1.length > 0 ? (
                        <DataTable columns={SUBSISTEMA1_COLUMNS} data={datosSubsistema1} />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema1.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema1")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                {/* Subsistema 2 */}
                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM2}</Typography>
                    {datosSubsistema2.length > 0 ? (
                        <DataTable columns={SUBSISTEMA2_COLUMNS} data={datosSubsistema2} />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema2.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema2")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                {/* Subsistema 3 */}
                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM3}</Typography>
                    {datosSubsistema3.length > 0 ? (
                        <DataTable
                            columns={["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]}
                            data={datosSubsistema3.map(dato => ({
                                "Angle (°)": dato.angulo,
                                "Voltage": dato.voltaje,
                                "Current": dato.corriente,
                                "Efficiency": dato.eficiencia,
                                "Fill Factor": dato.factorLlenado
                            }))}
                        />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema3.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema3")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                {/* Subsistema 4 */}
                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>{SUBSYSTEM_TITLES.SUBSYSTEM4}</Typography>
                    {datosSubsistema4.length > 0 ? (
                        <DataTable
                            columns={["Angle (°)", "Voltage", "Current", "Efficiency", "Fill Factor"]}
                            data={datosSubsistema4.map(dato => ({
                                "Angle (°)": dato.angulo,
                                "Voltage": dato.voltaje,
                                "Current": dato.corriente,
                                "Efficiency": dato.eficiencia,
                                "Fill Factor": dato.factorLlenado
                            }))}
                        />
                    ) : (
                        <NoDataMessage />
                    )}
                    {datosSubsistema4.length > 0 && (
                        <Button variant="contained" color="pink" onClick={() => handleClearData("subsistema4")} align="right" marginTop={1}>
                            {CLEAR_BUTTON}
                        </Button>
                    )}
                </Box>

                <Box mt={4}>
                    <Typography variant="h5">{SELECT_SUBSYSTEMS}</Typography>
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema1} onChange={handleCheckboxChange} name="subsistema1" />}
                        label={SUBSYSTEM_TITLES.SUBSYSTEM1}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema2} onChange={handleCheckboxChange} name="subsistema2" />}
                        label={SUBSYSTEM_TITLES.SUBSYSTEM2}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema3} onChange={handleCheckboxChange} name="subsistema3" />}
                        label={SUBSYSTEM_TITLES.SUBSYSTEM3}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={selectedSystems.subsistema4} onChange={handleCheckboxChange} name="subsistema4" />}
                        label={SUBSYSTEM_TITLES.SUBSYSTEM4}
                    />
                </Box>

                {(datosSubsistema1.length > 0 || datosSubsistema2.length > 0 || datosSubsistema3.length > 0 || datosSubsistema4.length > 0) && (
                    <Button variant="contained" color="primary" onClick={handleDownloadCSV} align="right" marginTop={2}>
                        {DOWNLOAD_BUTTON}
                    </Button>
                )}
                <Button variant="outlined" color="secondary" onClick={handleBack} align="center" marginTop={4} >
                    {BACK_BUTTON}
                </Button>
            </Box>
        </div>
    );
};

export default DataSummary;