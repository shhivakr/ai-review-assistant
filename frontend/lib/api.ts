const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json();
}
    