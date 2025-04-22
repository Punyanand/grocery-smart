const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:10000";

// Ensure the URL doesn't end with a slash
export default API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
