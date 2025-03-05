import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/TableComponent.css';

const TableComponent = () => {
    const navigate = useNavigate();
  
    const handleClick = () => {
      navigate('/subsistema1'); // Navega a la página Subsistema1
    };
  
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Ciudad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Juan</td>
              <td>25</td>
              <td>Madrid</td>
            </tr>
            <tr>
              <td>Ana</td>
              <td>30</td>
              <td>Barcelona</td>
            </tr>
          </tbody>
        </table>
        {/* <button onClick={handleClick}>Ir a Subsistema 1</button> */}
      </div>
    );
  };
  
  export default TableComponent;