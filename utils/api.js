const BASE_URL = "https://tcgdigibind-production.up.railway.app";

let authToken = null;

export const setToken = (token) => {
  authToken = token;
};

export const getToken = () => authToken;

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return res.json();
  },

  post: async (path, body) => {
    console.log("authToken: ", authToken);
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  put: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (path, body = null) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    return res.json();
  },
};
