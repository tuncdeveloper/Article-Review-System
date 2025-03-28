import React from 'react';
import { Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg">
            <BootstrapNavbar.Brand as={Link} to="/">Güvenli Belge Sistemi</BootstrapNavbar.Brand>
            <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
            <BootstrapNavbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">

                  <Nav.Link as={Link} to="/articleUpload">Makale Yükle</Nav.Link>
                  <Nav.Link as={Link} to="/articleStatus">Durum Sorgula</Nav.Link>
                  <Nav.Link as={Link} to="/AdminPanel">Yönetici Paneli</Nav.Link>
                  <Nav.Link as={Link} to="/RefereePanel">Hakem Paneli</Nav.Link>
                </Nav>
            </BootstrapNavbar.Collapse>
        </BootstrapNavbar>
    );
}

export default Navbar;