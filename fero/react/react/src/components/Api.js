// api.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:8443/api';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Article Endpoints
export const uploadArticle = async (email, file) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/article/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteArticle = async (id) => {
  await axios.delete(`${API_BASE_URL}/article/${id}`);
};

export const getArticlesByStatus = async (status) => {
  const response = await axios.get(`${API_BASE_URL}/article/get-status/${status}`);
  return response.data;
};

// Api.js
export const assignRefereeToArticle = async (articleId, refereeId) => {
  const response = await axios.put(
    `${API_BASE_URL}/article/assign-referee/${articleId}?refereeId=${refereeId}`,
    null,
    {
      headers: {
        'Authorization': `Basic ${btoa('admin:password')}`
      }
    }
  );
  return response.data;
};

export const updateCensoredContent = async (articleId, articleDto) => {
  const response = await axios.put(`${API_BASE_URL}/article/assign-censor/${articleId}`, articleDto);
  return response.data;
};

export const updateCensoredCommentedContent = async (articleId, articleDto) => {
  const response = await axios.put(`${API_BASE_URL}/article/assign-censorCommented/${articleId}`, articleDto);
  return response.data;
};

export const removeRefereeFromArticle = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/article/remove-referee/${id}`);
  return response.data;
};

export const getArticlesByReferee = async (refereeId) => {
  const response = await axios.get(`${API_BASE_URL}/article/get-article-by-refereeId/${refereeId}`);
  return response.data;
};

export const fetchArticles = async () => {
  const response = await axios.get(`${API_BASE_URL}/article/get-all`);
  return response.data;
};

export const getArticleByTrackingNumber = async (trackingNumber) => {
  const response = await axios.get(`${API_BASE_URL}/article/tracking/${trackingNumber}`);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/article/get-article/${id}`);
  return response.data;
};

export const getArticleByEmail = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/article/email/${email}`);
  return response.data;
};

export const fetchReferees = async () => {
  const response = await axios.get(`${API_BASE_URL}/referee/get-all`);
  return response.data;
};

export const fetchRefereeName = async (refereeId) => {
  if (!refereeId || isNaN(refereeId) || refereeId <= 0) {
    return 'Bilinmeyen Hakem';
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/referee/get-referee/${refereeId}`);
    return response.data.name;
  } catch (error) {
    console.error('Hakem ismi alınamadı:', refereeId);
    return 'Bilinmeyen Hakem';
  }
};

export const saveLog = async (logData) => {
  const response = await axios.post(`${API_BASE_URL}/log/save-log`, logData);
  return response.data;
};

export const fetchReviewedArticlesWithComments = async () => {
  const response = await axios.get(`${API_BASE_URL}/evaluation/article-comment`);
  return response.data;
};


export const saveBildirim = async (bildirimData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/log/save-bildirim`, bildirimData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa('admin:password')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Bildirim gönderilemedi');
  }
};

export const anonymizeArticleContent = async (content, censorOptions) => {
  const response = await axios.post(`${API_BASE_URL}/article/anonymize`, {
    content,
    censorOptions
  });
  return response.data;
};

export const censorArticleContent = async (articleId, censorOptions) => {
  const response = await axios.put(`${API_BASE_URL}/article/assign-censor/${articleId}`, censorOptions);
  return response.data;
};