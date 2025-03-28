import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import './ArticleUpload.css';

const ArticleUpload = () => {
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    useEffect(() => {
        setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
    }, []);

    useEffect(() => {
        let interval;
        if (isLoading && progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 250);
        }
        return () => clearInterval(interval);
    }, [isLoading, progress]);

    useEffect(() => {
        if (progress === 100 && isLoading) {
            handleSubmitLogic();
        }
    }, [progress, isLoading]);

    const handleSubmitLogic = async () => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('file', new Blob([file], { type: "application/octet-stream" }));

        try {
            const uploadResponse = await axios.post('https://localhost:8443/api/article/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (uploadResponse.status === 200) {
                const logData = {
                    action: `Makale Gönderildi`,
                    articleId: uploadResponse.data.id,
                    timestamp: new Date().toISOString(),
                };

                await axios.post('https://localhost:8443/api/log/save-log', logData);

                setMessage('Makale başarıyla gönderildi.');
                setError('');
                setEmail('');
                setFile(null);
            }
        } catch (error) {
            let errorMessage = 'Makale yükleme başarısız';
            if (error.response && error.response.data) {
                errorMessage += ': ' + (typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data));
            } else {
                errorMessage += ': ' + error.message;
            }
            setError(errorMessage);
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !file) {
            setError('E-posta ve PDF dosyası gereklidir.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Geçerli bir e-posta adresi girin.');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setMessage('');
        setError('');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFile(event.target.result);
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    return (
        <Container className={`upload-container ${isPageLoaded ? 'loaded' : ''}`}>
            <Row className="justify-content-center">
                <Col md={12} lg={10}>
                    <Card className="upload-card shadow">
                        <Card.Body>
                            <h2 className="text-center mb-4">Makale Yükle</h2>

                            {message && <Alert variant="success" className="alert-success">{message}</Alert>}
                            {error && <Alert variant="danger" className="alert-error">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3 form-group">
                                    <Form.Label>E-posta</Form.Label>
                                    <div className="input-wrapper">
                                        <Form.Control
                                            type="email"
                                            placeholder="E-posta adresinizi girin"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        {email && validateEmail(email) && (
                                            <span className="input-icon success">✔</span>
                                        )}
                                        {email && !validateEmail(email) && (
                                            <span className="input-icon error">✖</span>
                                        )}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3 form-group">
                                    <Form.Label>PDF Dosyası</Form.Label>
                                    <div className="input-wrapper">
                                        <Form.Control
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            required
                                            className="form-input"
                                        />
                                        {file && <span className="input-icon success">✔</span>}
                                    </div>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="upload-btn w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner"></span>
                                    ) : (
                                        'Yükle'
                                    )}
                                </Button>

                                {isLoading && (
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${progress}%` }}>
                                            {progress}%
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ArticleUpload;