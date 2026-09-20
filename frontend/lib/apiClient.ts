// A simple client-side API wrapper

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.message || "An API error occurred");
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  
  const headers = new Headers(options.headers || {});
  
  // Only add Content-Type if we're sending JSON and not form data
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Attempt refresh if not already trying to refresh
    if (!path.includes("/refresh") && !path.includes("/login")) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/admin/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          // Retry original request
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          const retryResponse = await fetch(url, { credentials: "include", ...options, headers });
          if (!retryResponse.ok) {
            throw new ApiError(retryResponse.status, await retryResponse.json().catch(() => ({})));
          }
          if (retryResponse.status === 204) return null;
          return retryResponse.json();
        } else {
          // Refresh failed, user is logged out
          setAccessToken(null);
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      } catch (err) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
  }

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
