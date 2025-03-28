import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const EVALUATION_API = `${API_BASE_URL}/evaluation`;
const LOG_API = `${API_BASE_URL}/log`;

export const handleAddOrUpdateComment = async (
  articleId,
  newComment,
  refereeId,
  comments,
  setComments,
  setNewComment,
  isUpdateMode,
  setIsUpdateMode,
  evaluationId,
  setEditingCommentId
) => {
  if (!newComment.trim()) {
    alert('Yorum alanı boş olamaz!');
    return;
  }

  try {
    const endpoint = isUpdateMode
      ? `${EVALUATION_API}/update-comment/${evaluationId}`
      : `${EVALUATION_API}/save-evaluation`;
    const method = isUpdateMode ? 'put' : 'post';

    const evaluationResponse = await axios[method](endpoint, {
      evaluationText: newComment,
      anonymizationCategory: "Anonim",
      evaluationDate: new Date().toISOString(),
      refereeId: refereeId,
      articleId: articleId,
    });

    if (evaluationResponse.status === 200) {
      await axios.post(`${LOG_API}/save-log`, {
        action: `Hakem yorumunu ${isUpdateMode ? 'güncelledi' : 'ekledi'}: ${newComment}`,
        userId: refereeId,
        articleId: articleId,
        timestamp: new Date().toISOString(),
      });

      const updatedComments = await fetchComments(articleId);
      setComments((prevComments) => ({
        ...prevComments,
        [articleId]: updatedComments,
      }));

      setNewComment('');
      setIsUpdateMode(false);
      setEditingCommentId(null);

      alert(`Yorum başarıyla ${isUpdateMode ? 'güncellendi' : 'eklendi'} ve log kaydedildi!`);
    } else {
      alert(`Yorum ${isUpdateMode ? 'güncellenirken' : 'eklenirken'} bir hata oluştu: ${evaluationResponse.data.message}`);
    }
  } catch (error) {
    console.error('İşlem sırasında hata oluştu:', error);
    alert(
      error.response?.data?.message ||
      'İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    );
  }
};

export const fetchComments = async (articleId) => {
  try {
    const response = await axios.get(`${EVALUATION_API}/article-comment/${articleId}`);
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 404) {
      console.warn(`articleId=${articleId} için yorum bulunamadı.`);
      return [];
    }
  } catch (error) {
    console.error('Yorumlar çekilirken hata oluştu:', error);
    return [];
  }
};