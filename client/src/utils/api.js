import axios from "axios";

// Flag to prevent multiple logout calls
let isLoggingOut = false;

//Creating axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


//Request interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evangadi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);




//Response interceptor for handling token expiration
axiosInstance.interceptors.response.use(
  (response) => {                         //SUCCESS FUNCTION
     
    return response;           //Success response
  },
  (error) => {                           //ERROR FUNCTION 
    const { response } = error;          //Extracting axios  response data from  error
    
    //Handle token expiration and invalid token errors
    if (response?.status === 401 || response?.status === 403) {
      const errorData = response.data;
      
      // Check if backend is telling us to logout
      if (errorData?.shouldLogout || 
          errorData?.error === 'TOKEN_EXPIRED' || 
          errorData?.error === 'INVALID_TOKEN' ||
          errorData?.error === 'ACCESS_DENIED') {
        
        // Preventing multiple logout calls
        if (!isLoggingOut) {
          isLoggingOut = true;
          
          console.warn('Token expired or invalid. Logging out user...');
          
          
          localStorage.removeItem('evangadi_token');
          localStorage.removeItem('evangadi_user');
          
          //Dispatch custom browser event for AuthContext to listen(global way)
          window.dispatchEvent(new CustomEvent('token-expired', {
            detail: { 
              reason: errorData?.error || 'TOKEN_EXPIRED',
              message: errorData?.message || 'Your session has expired. Please login again.'
            }
          }));
          
          // Resetting flag after a short delay
          setTimeout(() => {
            isLoggingOut = false;
          }, 1000);
        }
      }
    }
    
    // Better error logging
    console.error('API Error:', {
      status: response?.status,
      message: response?.data?.message || error.message,
      endpoint: error.config?.url
    });
    
    return Promise.reject(error);
  }
);




// Auth API calls
export const authAPI = {
  register: (userData) => axiosInstance.post("/auth/register", userData),  //passes the userData to the Backend
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  checkUser: () => axiosInstance.get("/auth/checkUser"),

    // Refresh token endpoint (for my future use)
  refreshToken: () => axiosInstance.post("/auth/refresh"),
  
  // Logout endpoint (for my future use)
  logout: () => axiosInstance.post("/auth/logout"),

  // Password Reset API calls
  requestReset: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  verifyToken: (token) => axiosInstance.get(`/auth/verify-token/${token}`),
  resetPassword: (token, password, confirmPassword) => 
    axiosInstance.post(`/auth/reset-password/${token}`, { 
      password, 
      confirmPassword 
    })
};


// Questions API calls
export const questionsAPI = {
  //Get All Questions With Pagination Parameters
  getAllQuestions: (page = 1, limit = 4, search = '') => {
    let url = `/questions?page=${page}&limit=${limit}`;
    if (search && search.trim()){
      url += `&search=${encodeURIComponent(search.trim())}`   //adding the search params to the existing URL
    }
    return axiosInstance.get(url)
  },
  getQuestionById: (id) => axiosInstance.get(`/questions/${id}`), //questionId
  postQuestion: (questionData) => axiosInstance.post('/questions', questionData),
  updateQuestion: (id, questionData) => axiosInstance.patch(`/questions/${id}`, questionData), //questionId
  deleteQuestion: (id) => axiosInstance.delete(`/questions/${id}`) //questionId
};


// Answers API calls
export const answersAPI = {
  getAnswers: (questionId) => axiosInstance.get(`/answers/${questionId}`),  //questionId
  postAnswer: (answerData) => axiosInstance.post('/answers', answerData),
  getAnswersByUser: (userId) => axiosInstance.get(`/answers/user/${userId}`),     //for future use
};

export default axiosInstance