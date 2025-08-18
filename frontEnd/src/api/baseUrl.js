// export const BASE_URL = "http://43.200.182.46";
// export const BASE_URL = "http://localhost";

// src/api/baseUrl.js
export const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";
export const PYTHON_URL = process.env.REACT_APP_PYTHON_API_BASE_URL ?? "";