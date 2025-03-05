import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import Grid2 from '@mui/material/Grid2'; // Importación correcta y actualizada
import styles from '../../assets/css/experimentsChooser.module.css';
import {Typography} from '@mui/material';
import Button from '../../components/Elements/Button';
import { PAGE_TITLES, SUBSYSTEMS } from '../../assets/Strings/Experiments/ExperimentChooserStrings.jsx';

const ExperimentChooser = () => {
    const navigate = useNavigate();

    const { MAIN_TITLE, DESCRIPTION, VIEW_SUBSYSTEM_BUTTON } = PAGE_TITLES;

    const handleNavigation = (path) => {
        navigate(path);
    };
   
    return (
        <div>
            <Box className={styles.container}>
                <Typography variant="h3" gutterBottom>
                    {MAIN_TITLE}
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {DESCRIPTION}
                </Typography>
                <Grid2 container spacing={3} justifyContent="center" className={styles.gridContainer}>
                    {SUBSYSTEMS.map((subsistema, index) => (
                            <Grid2 key={index}>
                                <Card className={styles.card}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        {subsistema.title}
                                    </Typography>
                                    <Typography className={styles.description}>
                                        {subsistema.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleNavigation(subsistema.path)}
                                        align="center"
                                    >
                                        {VIEW_SUBSYSTEM_BUTTON}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            </Box>
        </div>
    );
};

export default ExperimentChooser;


