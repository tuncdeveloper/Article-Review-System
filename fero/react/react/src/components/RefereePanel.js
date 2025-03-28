import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RefereePanel.css';

const RefereeList = () => {
  const [referees, setReferees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferees = async () => {
      try {
        const response = await axios.get('https://localhost:8443/api/referee/get-all');
        setReferees(response.data);
      } catch (error) {
        console.error('API isteği sırasında hata oluştu:', error);
      }
    };

    fetchReferees();
  }, []);

  const handleDetailsClick = (refereeId) => {
    navigate(`/RefereeExamine/${refereeId}`);
  };

  return (
    <div className="referee-panel-container">
      {referees.map((referee) => (
        <div key={referee.id} className="referee-panel-card">
          <h3>{referee.name}</h3>
          <p>{referee.description}</p>
          <button onClick={() => handleDetailsClick(referee.id)}>
            Detaylar
          </button>
        </div>
      ))}
    </div>
  );
};

export default RefereeList;