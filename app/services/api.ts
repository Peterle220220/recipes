import axios from "axios";
import { Alert } from "react-native"; // Optional: for basic error alerts

// --- Configuration ---

// IMPORTANT: Choose the correct Base URL based on your testing environment
// const API_BASE_URL = 'http://localhost:5000/api';      // For iOS Simulator
// const API_BASE_URL = 'http://10.0.2.2:5000/api';     // For Android Emulator
const API_BASE_URL = "http://10.3.2.41:3000/api"; // For Physical Device (Replace with your IP)

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json", // Expect JSON responses
    "Content-Type": "application/json", // Send data as JSON
    // Add other default headers if needed, like Authorization tokens:
    // 'Authorization': `Bearer YOUR_AUTH_TOKEN`,
  },
  timeout: 15000, // Set a request timeout (15 seconds)
});

// --- Optional: Add Request/Response Interceptors ---
// Example: Log requests or handle token refresh
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Requesting: ${config.method?.toUpperCase()} ${config.url}`,
      config.params || "",
      config.data || ""
    );
    // You could add or modify headers here (e.g., inject auth token)
    return config;
  },
  (error) => {
    console.error("Request Error Interceptor:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `Response: ${response.status} ${response.config.url}`,
      response.data
    );
    // Process successful responses
    return response; // Return the full response object initially
  },
  (error) => {
    console.error(
      "Response Error Interceptor:",
      error.response || error.request || error.message
    );
    // Get the endpoint from the error config
    const endpoint = error.config?.url?.replace(API_BASE_URL, "") || "";
    // Centralized error handling with endpoint
    handleApiError(error, endpoint);
    return Promise.reject(error); // Important to reject the promise
  }
);

// --- API Methods ---

/**
 * Performs a GET request.
 * @param {string} endpoint - The specific API path (e.g., '/users').
 * @param {object} [params] - Optional query parameters object (e.g., { page: 1, limit: 10 }).
 * @returns {Promise<object>} The data from the API response.
 * @throws {Error} If the request fails.
 */
const get = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data; // Return only the data part of the response
  } catch (error) {
    // Error is already handled by the interceptor, but we re-throw
    // so calling functions know the request failed.
    console.error(`GET ${endpoint} failed:`, error.message);
    throw error;
  }
};

/**
 * Performs a POST request.
 * @param {string} endpoint - The specific API path (e.g., '/items').
 * @param {object} [data] - The data payload to send in the request body.
 * @returns {Promise<object>} The data from the API response.
 * @throws {Error} If the request fails.
 */
const post = async (endpoint, data = {}) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error.message);
    throw error;
  }
};

/**
 * Performs a PUT request.
 * @param {string} endpoint - The specific API path, often including an ID (e.g., '/items/123').
 * @param {object} [data] - The data payload to send for the update.
 * @returns {Promise<object>} The data from the API response.
 * @throws {Error} If the request fails.
 */
const put = async (endpoint, data = {}) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error.message);
    throw error;
  }
};

/**
 * Performs a DELETE request.
 * @param {string} endpoint - The specific API path, often including an ID (e.g., '/items/123').
 * @param {object} [params] - Optional query parameters (less common for DELETE, but possible).
 * @returns {Promise<object>} The data from the API response (often empty or a confirmation).
 * @throws {Error} If the request fails.
 */
// Use 'del' function name because 'delete' is a reserved keyword in JS
const del = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.delete(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error.message);
    throw error;
  }
};

// --- Centralized Error Handler ---
/**
 * Basic error handler. Customize as needed (e.g., show toast messages, logout on 401).
 * @param {Error} error - The error object from Axios.
 * @param {string} endpoint - The API endpoint being called
 */
const handleApiError = (error, endpoint) => {
  // Skip error handling for login endpoint
  if (endpoint === "/auth/login") {
    return;
  }

  if (error.response) {
    // Server responded with a status code outside the 2xx range
    const { status, data } = error.response;
    console.error(`API Error: Status ${status}`, data);
    // Example: Show a user-friendly message based on status
    if (status === 401) {
      Alert.alert("Unauthorized", "Please log in again.");
      // Potentially trigger logout logic here
    } else if (status === 404) {
      Alert.alert("Not Found", "The requested resource could not be found.");
    } else if (status >= 500) {
      Alert.alert(
        "Server Error",
        "Something went wrong on our end. Please try again later."
      );
    } else {
      // Handle other client errors (4xx)
      const message = data?.message || "An error occurred."; // Try to get message from response data
      Alert.alert(`Error ${status}`, message);
    }
  } else if (error.request) {
    // Request was made but no response received (e.g., network error, timeout)
    console.error("Network/Request Error:", error.request);
    Alert.alert(
      "Network Error",
      "Could not connect to the server. Please check your connection and try again."
    );
  } else {
    // Something else happened in setting up the request
    console.error("Error Setting Up Request:", error.message);
    Alert.alert("Error", "An unexpected error occurred.");
  }
};

// --- Export Methods ---
// Export the individual methods for clarity when importing
export const api = {
  get,
  post,
  put,
  delete: del, // Map internal 'del' function to 'delete' export name
};

// You could also export the apiClient instance if needed elsewhere
// export { apiClient };
