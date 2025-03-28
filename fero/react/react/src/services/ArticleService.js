// src/services/ArticleService.js
import axios from 'axios';

class ArticleService {
  static getAllArticles() {
    return axios.get('http://localhost:8080/api/article/get-all');
  }

  static assignReferee(articleId, data) {
    return axios.put(`http://localhost:8080/api/article/assign-referee/${articleId}`, data);
  }

  static removeReferee(articleId, data) {
    return axios.put(`http://localhost:8080/api/article/remove-referee/${articleId}`, data);
  }

  static anonymizeContent(data) {
    return axios.post('http://localhost:8080/api/article/anonymize', data);
  }

  static assignCensor(articleId, data) {
    return axios.put(`http://localhost:8080/api/article/assign-censor/${articleId}`, data);
  }
}

export default ArticleService;