
import React from 'react';
import '../../assets/css/Elements/UniversityList.css';

const UniversityList = ({ universities, onUniversityClick }) => {
    return (
        <div className="university-list">
            <ul>
                {universities.map((university, index) => (
                    <li key={index} onClick={() => onUniversityClick(university)}>
                        {university.name}
                    </li>
                ))}
            </ul>
            <p className="funding-text">
            These laboratories were financed through the Erasmus EUBGP project of the European Union and collaborating universities.            </p>
        </div>
    );
};

export default UniversityList;