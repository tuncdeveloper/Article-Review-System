import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { setAuthHeader, removeAuthHeader } from '../utils/auth';
import { fetchArticles, fetchReferees, fetchRefereeName, assignRefereeToArticle, removeRefereeFromArticle, saveLog, anonymizeArticleContent, censorArticleContent, fetchReviewedArticlesWithComments,saveBildirim} from './Api';
import { handlePdfContent, base64ToArrayBuffer } from '../utils/PdfUtils';
import './AdminPanel.css';

const saveCensorOptionsToStorage = (options) => {
  localStorage.setItem('censorOptions', JSON.stringify(options));
};

const loadCensorOptionsFromStorage = () => {
  const savedOptions = localStorage.getItem('censorOptions');
  return savedOptions ? JSON.parse(savedOptions) : {};
};

const AdminPanel = () => {
    const [articles, setArticles] = useState([]);
    const [referees, setReferees] = useState([]);
    const [reviewedArticlesWithComments, setReviewedArticlesWithComments] = useState([]);
    const [refereeNames, setRefereeNames] = useState({});

    const [selectedArticle, setSelectedArticle] = useState(null);
    const [anonymousContent, setAnonymousContent] = useState('');

    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [loadingStates, setLoadingStates] = useState({});
    const [progressStates, setProgressStates] = useState({});
    const [actionStates, setActionStates] = useState({});

    const [selectedReferees, setSelectedReferees] = useState({});
    const [censorOptions, setCensorOptions] = useState({});

    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');

    const navigate = useNavigate();

    const pendingArticles = articles.filter(article => article.status === 'Beklemede');
    const reviewingArticles = articles.filter(article => article.status === 'İnceleniyor');
    const reviewedArticles = articles.filter(article => article.status === 'Yorumlanmış');


 const showSuccessToast = (message) => {
        setToastMessage(message);
        setToastVariant('success');
        setShowToast(true);
    };

    const showErrorToast = (message) => {
        setToastMessage(message);
        setToastVariant('danger');
        setShowToast(true);
    };

    useEffect(() => {
        setAuthHeader('admin', 'password');
        fetchInitialData();
        return () => removeAuthHeader();
    }, []);

    useEffect(() => {
      const fetchRefereeNames = async () => {
        const names = {};
        for (const article of [...reviewingArticles, ...reviewedArticles]) {
          const refereeId = Number(article.refereeId) || 0;

          if (refereeId > 0 && !refereeNames[refereeId]) {
            const name = await fetchRefereeName(refereeId);
            names[refereeId] = name;
          }
        }
        setRefereeNames(prev => ({ ...prev, ...names }));
      };
      fetchRefereeNames();
    }, [articles]);

    useEffect(() => {
        setTimeout(() => setIsPageLoaded(true), 100);
    }, []);


useEffect(() => {
  const fetchData = async () => {
    try {
      const evaluations = await fetchReviewedArticlesWithComments();

      const formattedData = evaluations.map(item => ({
        id: item.articleId,
        trackingNumber: item.trackingNumber,
        email: item.authorEmail,
        refereeName: item.refereeName,
        comment: item.evaluationText,
        reviewDate: item.evaluationDate,
        anonymizationCategory: item.anonymizationCategory
      }));

      setReviewedArticlesWithComments(formattedData);
    } catch (error) {
      setError('Yorumlanmış makaleler yüklenirken hata: ' + error.message);
    }
  };
  fetchData();
}, []);

    useEffect(() => {
        const intervals = {};
        Object.keys(loadingStates).forEach(key => {
            if (loadingStates[key] && progressStates[key] < 100) {
                intervals[key] = setInterval(() => {
                    setProgressStates(prev => {
                        const newProgress = prev[key] + 7;
                        if (newProgress >= 100) {
                            clearInterval(intervals[key]);
                            return { ...prev, [key]: 100 };
                        }
                        return { ...prev, [key]: newProgress };
                    });
                }, 250);
            }
        });
        return () => Object.values(intervals).forEach(clearInterval);
    }, [loadingStates, progressStates]);

    useEffect(() => {
        Object.keys(progressStates).forEach(key => {
            if (progressStates[key] === 100 && loadingStates[key]) {
                const [articleId, action] = key.split('-');
                if (action === 'assign') assignRefereeLogic(articleId);
                else if (action === 'remove') removeRefereeLogic(articleId);
                else if (action === 'viewPdf') handlePdfContentLogic(articleId);
                else if (action === 'viewCensoredPdf') handleCensoredPdfContentLogic(articleId);
            }
        });
    }, [progressStates, loadingStates]);

    const fetchInitialData = async () => {
        try {
            const [articlesData, refereesData] = await Promise.all([
                fetchArticles(),
                fetchReferees(),
            ]);

            setArticles(articlesData);
            setReferees(refereesData);

            const savedOptions = loadCensorOptionsFromStorage();
            const initialCensorOptions = {};
            articlesData.forEach(article => {
                initialCensorOptions[article.id] = savedOptions[article.id] || {
                    nameSurname: false,
                    contactInformation: false,
                    companyInformation: false,
                };
            });

            setCensorOptions(initialCensorOptions);
        } catch (error) {
            setError('Veriler yüklenirken hata: ' + error.message);
        }
    };

    const handleSelectArticle = async (article) => {
        setSelectedArticle(article);
        try {
            const anonymizedContent = await anonymizeArticleContent(
                article.anonymizedContent || '',
                censorOptions[article.id] || {
                    nameSurname: false,
                    contactInformation: false,
                    companyInformation: false,
                }
            );
            setAnonymousContent(anonymizedContent);
            setLogs([...logs, `${article.trackingNumber} anonimleştirildi: ${new Date().toLocaleString()}`]);
        } catch (error) {
            setError('Anonimleştirme hatası: ' + error.message);
        }
    };

    const handleRefereeChange = (articleId, refereeId) => {
        const sanitizedId = refereeId !== null && !isNaN(refereeId)
            ? Number(refereeId)
            : null;

        setSelectedReferees(prev => ({
            ...prev,
            [articleId]: sanitizedId
        }));
    };

    const handleCensorOptionChange = (articleId, option) => {
        const newOptions = {
            ...censorOptions,
            [articleId]: {
                ...(censorOptions[articleId] || {
                    nameSurname: false,
                    contactInformation: false,
                    companyInformation: false,
                }),
                [option]: !censorOptions[articleId]?.[option],
            },
        };
        setCensorOptions(newOptions);
        saveCensorOptionsToStorage(newOptions);
    };


       const assignReferee = async (articleId) => {
           const refereeId = selectedReferees[articleId];

           if (refereeId === null || refereeId === undefined || isNaN(refereeId)) {
               showErrorToast('Lütfen listeden bir hakem seçin');
               return;
           }

           setLoadingStates(prev => ({ ...prev, [`${articleId}-assign`]: true }));
           setProgressStates(prev => ({ ...prev, [`${articleId}-assign`]: 0 }));

           try {
               if (typeof refereeId !== "number" || refereeId <= 0) {
                   throw new Error('Geçersiz hakem ID formatı');
               }

               const updatedArticle = await assignRefereeToArticle(articleId, refereeId);

               setArticles(prev => prev.map(article =>
                   article.id === articleId ? {
                       ...article,
                       refereeId: Number(updatedArticle.refereeId),
                       status: updatedArticle.status
                   } : article
               ));

               showSuccessToast('Hakem başarıyla atandı!');

           } catch (error) {
               console.error('Hata Detayları:', {
                   articleId,
                   refereeId,
                   error: error.response?.data || error.message
               });
               showErrorToast('İşlem sırasında teknik bir hata oluştu');
           } finally {
               setLoadingStates(prev => ({ ...prev, [`${articleId}-assign`]: false }));
               setProgressStates(prev => ({ ...prev, [`${articleId}-assign`]: 0 }));
           }
       };

       const assignRefereeLogic = async (articleId) => {
         const refereeId = selectedReferees[articleId];
         try {
           const updatedArticle = await assignRefereeToArticle(articleId, refereeId);

           const validRefereeId = Number(updatedArticle.refereeId) || 0;

           setArticles(prev => prev.map(article =>
             article.id === articleId ? {
               ...article,
               refereeId: validRefereeId,
               status: updatedArticle.status
             } : article
           ));

           const refereeName = validRefereeId > 0
             ? await fetchRefereeName(validRefereeId)
             : '';

           setLogs([...logs, `Hakem atandı: ${refereeName}`]);
           showSuccessToast(`Hakem başarıyla atandı: ${refereeName}`);
         } catch (error) {
           const errorMsg = "Hata: " + (error.response?.data?.message || error.message);
           setError(errorMsg);
           showErrorToast(errorMsg);
         } finally {
           setLoadingStates(prev => ({ ...prev, [`${articleId}-assign`]: false }));
         }
       };

    const removeReferee = (articleId) => {
            setLoadingStates(prev => ({ ...prev, [`${articleId}-remove`]: true }));
            setProgressStates(prev => ({ ...prev, [`${articleId}-remove`]: 0 }));
            setActionStates(prev => ({ ...prev, [`${articleId}-remove`]: 'remove' }));
            setError('');
        };

        const removeRefereeLogic = async (articleId) => {
            try {
                await removeRefereeFromArticle(articleId);
                await saveLog({
                    action: `Makaleden hakem kaldırıldı, durum "Beklemede" olarak güncellendi`,
                    articleId: articleId,
                    timestamp: new Date().toISOString(),
                });

                setLogs([...logs, `Makale ${articleId} için hakem kaldırıldı: ${new Date().toLocaleString()}`]);

                const updatedArticles = articles.map(article =>
                    article.id === articleId ? {
                        ...article,
                        assignedRefereeId: null,
                        status: 'Beklemede'
                    } : article
                );
                setArticles(updatedArticles);
                showSuccessToast('Hakem başarıyla kaldırıldı');
            } catch (error) {
                const errorMsg = 'Hakem kaldırılırken hata: ' + error.message;
                setError(errorMsg);
                showErrorToast(errorMsg);
            } finally {
                setLoadingStates(prev => ({ ...prev, [`${articleId}-remove`]: false }));
                setActionStates(prev => ({ ...prev, [`${articleId}-remove`]: null }));
            }
        };




    const handlePdfContentAction = (articleId, content) => {
        setLoadingStates(prev => ({ ...prev, [`${articleId}-viewPdf`]: true }));
        setProgressStates(prev => ({ ...prev, [`${articleId}-viewPdf`]: 0 }));
        setActionStates(prev => ({
            ...prev,
            [`${articleId}-viewPdf`]: 'viewPdf',
            [`${articleId}-content`]: content
        }));
        setError('');
    };

    const handlePdfContentLogic = (articleId) => {
        const content = actionStates[`${articleId}-content`];
        try {
            handlePdfContent(content, 'content.pdf');
        } catch (error) {
            setError('PDF görüntülenirken hata: ' + error.message);
        } finally {
            setLoadingStates(prev => ({ ...prev, [`${articleId}-viewPdf`]: false }));
            setActionStates(prev => ({
                ...prev,
                [`${articleId}-viewPdf`]: null,
                [`${articleId}-content`]: null
            }));
        }
    };

    const handleCensoredPdfContent = (articleId) => {
        setLoadingStates(prev => ({ ...prev, [`${articleId}-viewCensoredPdf`]: true }));
        setProgressStates(prev => ({ ...prev, [`${articleId}-viewCensoredPdf`]: 0 }));
        setActionStates(prev => ({ ...prev, [`${articleId}-viewCensoredPdf`]: 'viewCensoredPdf' }));
        setError('');
    };

   const handleBildirim = async (article) => {
           try {
               setLoadingStates(prev => ({ ...prev, [`${article.id}-sendNotification`]: true }));

               const bildirimData = {
                   articleId: article.id,
                   comment: article.comment,
                   customSubject: "Makale Değerlendirme Sonucu",
                   isHtml: true
               };

               await saveBildirim(bildirimData);

               setLogs(prev => [...prev, `Bildirim gönderildi: ${article.trackingNumber}`]);
               setError('');
               showSuccessToast('Yazara bildirim başarıyla gönderildi');
           } catch (error) {
               const errorMsg = 'Bildirim gönderilirken hata: ' + error.message;
               setError(errorMsg);
               showErrorToast(errorMsg);
           } finally {
               setLoadingStates(prev => ({ ...prev, [`${article.id}-sendNotification`]: false }));
           }
       };

    const handleCensoredPdfContentLogic = async (articleId) => {
        try {
            const censorOptionsForArticle = censorOptions[articleId] || {
                nameSurname: false,
                contactInformation: false,
                companyInformation: false,
            };

            const response = await censorArticleContent(articleId, censorOptionsForArticle);
            const censoredPdfBase64 = response.censoredContent;

            if (!censoredPdfBase64) {
                throw new Error('Sansürlenmiş PDF içeriği boş veya tanımsız.');
            }

            const byteArray = base64ToArrayBuffer(censoredPdfBase64);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                const link = document.createElement('a');
                link.href = url;
                link.download = 'censored.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            setError('PDF görüntülenirken hata: ' + error.message);
        } finally {
            setLoadingStates(prev => ({ ...prev, [`${articleId}-viewCensoredPdf`]: false }));
            setActionStates(prev => ({ ...prev, [`${articleId}-viewCensoredPdf`]: null }));
        }
    };

    return (
        <div className={`admin-panel-container ${isPageLoaded ? 'loaded' : ''}`}>
            <div className="card-body">
                <h2 className="card-title mb-4">Yönetici Paneli</h2>

    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 11 }}>
                        <Toast
                            show={showToast}
                            onClose={() => setShowToast(false)}
                            delay={5000}
                            autohide
                            bg={toastVariant}
                        >
                            <Toast.Header>
                                <strong className="me-auto">Bildirim</strong>
                            </Toast.Header>
                            <Toast.Body className="text-white">
                                {toastMessage}
                            </Toast.Body>
                        </Toast>
                    </ToastContainer>

                {error && <Alert variant="danger" className="alert-error">{error}</Alert>}
                <Button variant="primary" className="mb-4 btn-primary-custom" onClick={() => navigate('/RefereePanel')}>
                    Hakemler
                </Button>

                {/* Beklemede Makaleler */}
                <Row>
                    <Col md={12}>
                        <h3 className="mb-3">Beklemede Makaleler</h3>
                        <div className="article-list">
                            {pendingArticles.map(article => (
                                <div key={article.id} className="article-item">
                                    <div className="article-details">
                                        <p><strong>Takip No:</strong> {article.trackingNumber}</p>
                                        <p><strong>E-posta:</strong> {article.email}</p>
                                        <p><strong>Yükleme Tarihi:</strong> {article.uploadDate}</p>
                                        <p><strong>Durum:</strong> {article.status}</p>
                                    </div>
                                    <div className="censor-options">
                                        <h5>Sansürleme Seçenekleri</h5>
                                        <Form>
                                            <Form.Check
                                                type="checkbox"
                                                label="Ad Soyad"
                                                checked={censorOptions[article.id]?.nameSurname || false}
                                                onChange={() => handleCensorOptionChange(article.id, 'nameSurname')}
                                            />
                                            <Form.Check
                                                type="checkbox"
                                                label="İletişim Bilgileri"
                                                checked={censorOptions[article.id]?.contactInformation || false}
                                                onChange={() => handleCensorOptionChange(article.id, 'contactInformation')}
                                            />
                                            <Form.Check
                                                type="checkbox"
                                                label="Şirket Bilgileri"
                                                checked={censorOptions[article.id]?.companyInformation || false}
                                                onChange={() => handleCensorOptionChange(article.id, 'companyInformation')}
                                            />
                                        </Form>
                                    </div>
                                    <div className="referee-assignment">
                                        <h5>Hakem Atama</h5>
                                       <Form.Select
                                           value={selectedReferees[article.id] || ''}
                                           onChange={(e) => {
                                               const value = e.target.value;
                                               // Sadece geçerli sayısal değerleri kabul et
                                               if (value === "" || isNaN(value)) {
                                                   handleRefereeChange(article.id, null);
                                               } else {
                                                   handleRefereeChange(article.id, Number(value));
                                               }
                                           }}
                                       >
                                           <option value="">Hakem Seç</option>
                                           {referees.map(referee => (
                                               <option key={referee.id} value={referee.id}>
                                                   {referee.name} - {referee.field}
                                               </option>
                                           ))}
                                       </Form.Select>
                                        <Button
                                            variant="success"
                                            className="mt-2 btn-success-custom"
                                            onClick={() => assignReferee(article.id)}
                                            disabled={loadingStates[`${article.id}-assign`]}
                                        >
                                            {loadingStates[`${article.id}-assign`] ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                'Ata'
                                            )}
                                        </Button>
                                        {loadingStates[`${article.id}-assign`] && (
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${progressStates[`${article.id}-assign`]}%` }}>
                                                    {progressStates[`${article.id}-assign`]}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pdf-view">
                                        <Button
                                            variant="info"
                                            className="btn-info-custom"
                                            onClick={() => handlePdfContentAction(article.id, article.content)}
                                            disabled={loadingStates[`${article.id}-viewPdf`]}
                                        >
                                            {loadingStates[`${article.id}-viewPdf`] ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                'PDF Görüntüle'
                                            )}
                                        </Button>
                                        {loadingStates[`${article.id}-viewPdf`] && (
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${progressStates[`${article.id}-viewPdf`]}%` }}>
                                                    {progressStates[`${article.id}-viewPdf`]}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>

                {/* İnceleniyor Makaleler */}
                <Row className="mt-4">
                    <Col md={12}>
                        <h3 className="mb-3">İnceleniyor Makaleler</h3>
                        <div className="article-list">
                            {reviewingArticles.map(article => (
                                <div key={article.id} className="article-item">
                                    <div className="article-details">
                                        <p><strong>Takip No:</strong> {article.trackingNumber}</p>
                                        <p><strong>E-posta:</strong> {article.email}</p>
                                        <p><strong>Yükleme Tarihi:</strong> {article.uploadDate}</p>
                                        <p><strong>Durum:</strong> {article.status}</p>
                                        <p><strong>Atanan Hakem:</strong> {refereeNames[article.assignedRefereeId] || 'Yükleniyor...'}</p>
                                    </div>
                                    <div className="article-actions">
                                        <Button
                                            variant="danger"
                                            className="btn-danger-custom"
                                            onClick={() => removeReferee(article.id)}
                                            disabled={loadingStates[`${article.id}-remove`]}
                                        >
                                            {loadingStates[`${article.id}-remove`] ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                'Hakem Kaldır'
                                            )}
                                        </Button>
                                        {loadingStates[`${article.id}-remove`] && (
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${progressStates[`${article.id}-remove`]}%` }}>
                                                    {progressStates[`${article.id}-remove`]}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pdf-view">
                                        <Button
                                            variant="info"
                                            className="btn-info-custom"
                                            onClick={() => handleCensoredPdfContent(article.id)}
                                            disabled={loadingStates[`${article.id}-viewCensoredPdf`]}
                                        >
                                            {loadingStates[`${article.id}-viewCensoredPdf`] ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                'PDF Görüntüle'
                                            )}
                                        </Button>
                                        {loadingStates[`${article.id}-viewCensoredPdf`] && (
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${progressStates[`${article.id}-viewCensoredPdf`]}%` }}>
                                                    {progressStates[`${article.id}-viewCensoredPdf`]}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>

               {/* Yorumlanmış Makaleler */}
               <Row className="mt-4">
                 <Col md={12}>
                   <h3 className="mb-3">Yorumlanmış Makaleler</h3>
                   {reviewedArticlesWithComments.length > 0 ? (
                     <div className="article-list">
                       {reviewedArticlesWithComments.map(article => (
                         <div key={article.id || article.trackingNumber} className="article-item">
                           <div className="article-details">
                             <p><strong>Takip No:</strong> {article.trackingNumber}</p>
                             <p><strong>Yazarın E-posta:</strong> {article.email || 'E-posta Yok'}</p>
                             <p><strong>Değerlendiren Hakem:</strong> {article.refereeName || article.assignedRefereeId || 'Hakem Bilgisi Yok'}</p>
                             <p><strong>Hakem Yorumu:</strong> {article.comment || 'Yorum Yok'}</p>
                             <p><strong>Değerlendirme Tarihi:</strong> {article.reviewDate ? new Date(article.reviewDate).toLocaleDateString() : 'Tarih Yok'}</p>
                           </div>
                           <div className="article-actions">
                             <div className="pdf-view">
                               <Button
                                 variant="info"
                                 className="btn-info-custom me-2"
                                 onClick={() => handleCensoredPdfContent(article.id)}
                                 disabled={loadingStates[`${article.id}-viewCensoredPdf`]}
                               >
                                 {loadingStates[`${article.id}-viewCensoredPdf`] ? (
                                   <span className="spinner"></span>
                                 ) : (
                                   'PDF Görüntüle'
                                 )}
                               </Button>
                               <Button
                                 variant="success"
                                 className="btn-success-custom"
                                 onClick={() => handleBildirim(article)}
                                 disabled={loadingStates[`${article.id}-sendNotification`]}
                               >
                                 {loadingStates[`${article.id}-sendNotification`] ? (
                                   <span className="spinner"></span>
                                 ) : (
                                   'Yazara Gönder'
                                 )}
                               </Button>
                             </div>
                             {loadingStates[`${article.id}-viewCensoredPdf`] && (
                               <div className="progress-container">
                                 <div className="progress-bar" style={{ width: `${progressStates[`${article.id}-viewCensoredPdf`]}%` }}>
                                   {progressStates[`${article.id}-viewCensoredPdf`]}%
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="alert alert-info">Yorumlanmış makale bulunamadı</div>
                   )}
                 </Col>
               </Row>

                {selectedArticle && (
                    <div className="mt-4 selected-article-section">
                        <h3 className="mb-3">Seçili Makale: {selectedArticle.trackingNumber}</h3>
                        <div>
                            <h4>Anonimleştirilmiş İçerik:</h4>
                            <p>{anonymousContent || 'Anonimleştirme henüz yapılmadı.'}</p>
                        </div>
                        <h4 className="mt-4">Loglar:</h4>
                        <ul className="list-group log-list">
                            {logs.map((log, index) => (
                                <li key={index} className="list-group-item">{log}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;