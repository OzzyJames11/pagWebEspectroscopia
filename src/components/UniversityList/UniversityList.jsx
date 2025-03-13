// // src/components/UniversityList/UniversityList.jsx
// import React from 'react';
// import '../../assets/css/Elements/UniversityList.css';

// const UniversityList = ({ universities, onUniversityClick }) => {
//     return (
//         <div className="university-list">
//             <h2>Universidades</h2>
//             <ul>
//                 {universities.map((university, index) => (
//                     <li key={index} onClick={() => onUniversityClick(university)}>
//                         {university.name}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default UniversityList;

// src/components/UniversityList/UniversityList.jsx
// import React from 'react';
// import '../../assets/css/Elements/UniversityList.css';

// const UniversityList = ({ universities, onUniversityClick }) => {
//     return (
//         <div className="university-list">
//             <h2>Universidades</h2>
//             <ul>
//                 {universities.map((university, index) => (
//                     <li key={index} onClick={() => onUniversityClick(university)}>
//                         {university.name}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default UniversityList;


// import React from 'react';
// import '../../assets/css/Elements/UniversityList.css';

// const UniversityList = ({ universities, onUniversityClick }) => {
//     return (
//         <div className="university-list">
//             <h2>Universidades</h2>
//             <ul>
//                 {universities.map((university, index) => (
//                     <li key={index} onClick={() => onUniversityClick(university)}>
//                         {university.name}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default UniversityList;

// src/components/UniversityList/UniversityList.jsx
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
                Estos laboratorios fueron financiados mediante el proyecto Erasmus EUBGP de la Unión Europea y las universidades colaboradoras.
            </p>
        </div>
    );
};

export default UniversityList;