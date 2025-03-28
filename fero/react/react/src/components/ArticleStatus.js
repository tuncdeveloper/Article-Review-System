import React, { useState, useEffect } from 'react';
import './ArticleStatus.css';

function ArticleStatus() {
    const [trackingNumber, setTrackingNumber] = useState('TRK12');
    const [statusResponse, setStatusResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const base64ToArrayBuffer = (base64) => {
        try {
            const binaryString = atob(base64);
            const length = binaryString.length;
            const bytes = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } catch (error) {
            console.error('Base64 decode hatası:', error);
            throw new Error('Base64 decode işlemi başarısız: ' + error.message);
        }
    };

    const handlePdfContent = (content, fileName = 'document.pdf', mimeType = 'application/pdf') => {
        try {
            if (!content) {
                throw new Error('PDF içeriği boş veya tanımsız.');
            }
            const byteArray = base64ToArrayBuffer(content);
            const blob = new Blob([byteArray], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('PDF işleme hatası:', error);
            alert('PDF dosyası işlenirken bir hata oluştu: ' + error.message);
        }
    };

    useEffect(() => {
        let interval;
        if (isLoading && progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 200);
        }
        return () => clearInterval(interval);
    }, [isLoading, progress]);

    useEffect(() => {
        if (progress === 100 && isLoading) {
            queryStatus();
        }
    }, [progress, isLoading]);

    const queryStatus = async () => {
        setStatusResponse(null);
        try {
            const response = await fetch(`https://localhost:8443/api/article/tracking/${trackingNumber}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`Makale bulunamadı: ${response.status}`);
            }
            const data = await response.json();
            console.log('Backend yanıtı:', data);

            const pdfFiles = [
                { content: data.content, fileName: 'content.pdf' },
                { content: data.censoredContent, fileName: 'censoredContent.pdf' },
                { content: data.commentedContent, fileName: 'commentedContent.pdf' },
                { content: data.contentNotCommentedContent, fileName: 'contentNotCommentedContent.pdf' },
                { content: data.decryptedContent, fileName: 'decryptedContent.pdf' },
                { content: data.anonymizedContent, fileName: 'anonymizedContent.pdf' },
            ];

            pdfFiles.forEach((file) => {
                if (file.content) {
                    handlePdfContent(file.content, file.fileName);
                }
            });

            setStatusResponse({ success: true, status: data.status });
        } catch (error) {
            console.error('Hata:', error);
            setStatusResponse({ success: false, message: 'Makale durumu sorgulama başarısız: ' + error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const clearInput = () => {
        setTrackingNumber('');
        setStatusResponse(null);
        setProgress(0);
        setIsLoading(false);
    };

    const handleQueryClick = () => {
        if (!isLoading) {
            setIsLoading(true);
            setProgress(0);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h2>Makale Durum Sorgulama</h2>
                <div className="form-group">
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Takip Numarası Girin"
                        className="form-input"
                    />
                    <div className="button-group">
                        <button
                            onClick={handleQueryClick}
                            disabled={isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                'Sorgula'
                            )}
                        </button>
                        <button
                            onClick={clearInput}
                            className="btn btn-secondary"
                        >
                            Temizle
                        </button>
                    </div>
                </div>
                {isLoading && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>
                            {progress}%
                        </div>
                    </div>
                )}
                {statusResponse ? (
                    statusResponse.success ? (
                        <div className="alert alert-success">
                            Makale Durumu: {statusResponse.status || 'Belirtilmemiş'}
                        </div>
                    ) : (
                        <div className="alert alert-error">
                            {statusResponse.message}
                        </div>
                    )
                ) : (
                    <p className="info-text">Lütfen takip numarasını girip "Sorgula" butonuna basın.</p>
                )}
            </div>
        </div>
    );
}

export default ArticleStatus;