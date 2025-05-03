interface FetchOptions extends RequestInit {
  body?: string | FormData;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Accept': 'application/json',
  };

  // Only add Content-Type for JSON requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}; 