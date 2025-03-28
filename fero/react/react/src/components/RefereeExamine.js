import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { base64ToArrayBuffer, handlePdfContent } from '../utils/PdfUtils';
import { handleAddOrUpdateComment, fetchComments } from '../utils/CommentUtils';
import './RefereeExamine.css';

const RefereeExamine = () => {
  const { refereeId } = useParams();
  const [referee, setReferee] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [refereeResponse, articlesResponse] = await Promise.all([
          axios.get(`https://localhost:8443/api/referee/get-referee/${refereeId}`),
          axios.get(`https://localhost:8443/api/article/get-article-by-refereeId/${refereeId}`)
        ]);

        setReferee(refereeResponse.data);
        setArticles(articlesResponse.data);

        const commentsPromises = articlesResponse.data.map(article =>
          fetchComments(article.id).then(articleComments => ({
            articleId: article.id,
            comments: articleComments
          }))
        );

        const commentsResults = await Promise.all(commentsPromises);
        const initialComments = {};
        commentsResults.forEach(({ articleId, comments }) => {
          initialComments[articleId] = comments;
        });
        setComments(initialComments);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        setError('Veri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refereeId]);

  const handleCommentAction = async (articleId) => {
    if (!newComment.trim()) {
      alert('Yorum alanı boş olamaz!');
      return;
    }

    try {
      if (isUpdateMode && editingCommentId) {
        await axios.put(`https://localhost:8443/api/evaluation/update-comment/${editingCommentId}`, {
          evaluationText: newComment
        });

        setComments(prev => ({
          ...prev,
          [articleId]: prev[articleId].map(comment =>
            comment.id === editingCommentId
              ? { ...comment, evaluationText: newComment }
              : comment
          )
        }));
      } else {
        await handleAddOrUpdateComment(
          articleId,
          newComment,
          refereeId,
          comments,
          setComments
        );
      }

      setNewComment('');
      setIsUpdateMode(false);
      setEditingCommentId(null);
    } catch (error) {
      console.error('Yorum işlemi sırasında hata:', error);
      alert('Yorum işlemi sırasında bir hata oluştu!');
    }
  };

  const handleEditComment = (articleId, comment) => {
    setNewComment(comment.evaluationText);
    setIsUpdateMode(true);
    setEditingCommentId(comment.id);
  };

  const handleViewCommentedPdf = async (articleId, censoredContent) => {
      try {
          handlePdfContent(censoredContent, 'censoredContent.pdf');

          const response = await axios.put(
              `https://localhost:8443/api/article/assign-censorCommented/${articleId}`,
              {
                  commentedContent: censoredContent,
                  refereeId: refereeId,
                  status: 'Yorumlanmış'
              }
          );

          setArticles(prev => prev.map(article =>
              article.id === articleId ? {
                  ...article,
                  commentedContent: censoredContent,
                  status: 'Yorumlanmış',
                  ...response.data
              } : article
          ));

          const updatedArticles = await axios.get(
              `https://localhost:8443/api/article/get-article-by-refereeId/${refereeId}`
          );
          setArticles(updatedArticles.data);

      } catch (error) {
          console.error('PDF güncellenirken hata oluştu:', error);
          alert('PDF güncellenirken bir hata oluştu!');
      }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h2>{referee.name}</h2>
      <p>{referee.description}</p>
      <p><strong>Uzmanlık Alanı:</strong> {referee.field}</p>

      <h3>Makaleler</h3>
      {articles.length > 0 ? (
        <ul className="articleList">
          {articles.map((article) => (
            <li key={article.id} className="articleItem">
              <h4>{article.title}</h4>
              <p><strong>Takip Numarası:</strong> {article.trackingNumber}</p>
              <p><strong>E-posta:</strong> {article.email}</p>
              <p><strong>Yüklendiği Tarih:</strong> {new Date(article.uploadDate).toLocaleDateString()}</p>
              <p><strong>Durum:</strong> {article.status}</p>

              <div className="pdfButtons">
                <button
                  onClick={() => handlePdfContent(article.censoredContent, 'censoredContent.pdf')}
                  className="pdfButton"
                >
                  Makaleyi Görüntüle
                </button>
              </div>

              <div className="commentsSection">
                <h5>Yorumlar</h5>
                {comments[article.id]?.map((comment) => (
                  <div key={comment.id} className="comment">
                    <p>{comment.evaluationText}</p>
                    <div className="commentButtons">
                      <button
                        onClick={() => handleEditComment(article.id, comment)}
                        className="editButton"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleViewCommentedPdf(article.id, article.censoredContent)}
                        className="viewPdfButton"
                      >
                        Yorumlanmış PDF'i Görüntüle
                      </button>
                    </div>
                  </div>
                ))}

                {(comments[article.id]?.length === 0 || isUpdateMode) && (
                  <div className="commentForm">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Yorumunuzu buraya yazın..."
                      className="commentInput"
                    />
                    <div className="formButtons">
                      <button
                        onClick={() => handleCommentAction(article.id)}
                        className="commentButton"
                      >
                        {isUpdateMode ? 'Güncelle' : 'Ekle'}
                      </button>
                      {isUpdateMode && (
                        <button
                          onClick={() => {
                            setNewComment('');
                            setIsUpdateMode(false);
                            setEditingCommentId(null);
                          }}
                          className="cancelButton"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Bu hakeme atanmış makale bulunmamaktadır.</p>
      )}
    </div>
  );
};

export default RefereeExamine;