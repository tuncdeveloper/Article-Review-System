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
    navigate(`/referee-examine/${refereeId}`);
  };

  return (
    <div style={styles.container}>
      {referees.map((referee) => (
        <div key={referee.id} style={styles.card}>
          <h3>{referee.name}</h3>
          <p>{referee.description}</p>
          <button
            style={styles.button}
            onClick={() => handleDetailsClick(referee.id)}
          >
            Detaylar
          </button>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    width: '300px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    margin: '5px',
    cursor: 'pointer',
  },
};

export default RefereeList;