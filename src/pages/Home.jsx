import React from 'react';
import { Link } from 'react-router-dom';
import SliderComponent from '../components/SliderComponent';
import TableComponent from '../components/TableComponent';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
//importar paths
import { ROUTES } from '../assets/Strings/routes';
import './Home.css'; // Importa los estilos para Home

const Home = () => {
    return (
        <div className="home">
            {/* <Header /> */}
            <h1>Bienvenido a la Página de Inicio</h1>
            <nav className="nav-tabs">
                <Link to="/" className="nav-tab">Inicio</Link>
                <Link to={ROUTES.EXPERIMENTSCH} className="nav-tab">Experiments</Link>
                <Link to={ROUTES.SUBSISTEMA1} className="nav-tab">Subsistema 1</Link>
                <Link to={ROUTES.SUBSISTEMA2} className="nav-tab">Subsistema 2</Link>
                <Link to={ROUTES.SUBSISTEMA3} className="nav-tab">Subsistema 3</Link>
                <Link to={ROUTES.SUBSISTEMA4} className="nav-tab">Subsistema 4</Link>
                <Link to={ROUTES.DATA_SUMMARY} className="nav-tab">Data Summary</Link>
            </nav>

            {/* Contenido de la página de inicio */}
            <SliderComponent />
            <TableComponent />
            {/* <Footer /> */}
        </div>
    );
};

export default Home;