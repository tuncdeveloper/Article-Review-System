import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ArticleUpload from './components/ArticleUpload';
import ArticleStatus from './components/ArticleStatus';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import AdminPanel from './components/AdminPanel';
import RefereePanel from './components/RefereePanel';
import RefereeList from './components/RefereeList';
import RefereeExamine from './components/RefereeExamine';


function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="container mt-4">
                    <Routes>
                        <Route path="/" element={<Menu />} /> {/* Ana sayfa */}
                        <Route path="/articleUpload" element={<ArticleUpload />} />
                        <Route path="/articleStatus" element={<ArticleStatus />} />
                        <Route path="/AdminPanel" element={<AdminPanel />} /> {/* Editör (Admin) Paneli */}
                        <Route path="/RefereePanel" element={<RefereePanel />} /> {/* Hakem Paneli */}
                        <Route path="/RefereeList" element={<RefereeList />} /> {/* RefereeList için yeni yol */}
                        <Route path="/RefereeExamine/:refereeId" element={<RefereeExamine />} /> {/* RefereeExamine için dinamik yol */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;