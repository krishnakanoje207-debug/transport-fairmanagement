const API_PREFIX = "/api/v1";

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

export async function apiRequest(path, options = {}) {
  const token = options.token || getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      payload?.error ||
      payload?.rawText ||
      "Request failed";
    throw new Error(message);
  }

  return payload;
}

export async function loginWithPassword(email, password) {
  const formBody = new URLSearchParams({
    username: email,
    password,
  });

  const response = await fetch(`${API_PREFIX}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.rawText || "Login failed");
  }
  return payload;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!bodyText) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyText);
    } catch {
      return { rawText: bodyText };
    }
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return { rawText: bodyText };
  }
}
