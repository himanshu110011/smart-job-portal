const API_URL = 'http://localhost:5000/api';

// Utility for making API requests with automatically injected auth tokens
async function apiClient(endpoint, { method = 'GET', body, headers = {} } = {}) {
    const token = localStorage.getItem('token');
    
    // Default headers
    const reqHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // Inject token if available
    if (token) {
        reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Configure fetch options
    const options = {
        method,
        headers: reqHeaders,
    };

    if (body) {
        // Handle FormData vs JSON
        if (body instanceof FormData) {
            delete options.headers['Content-Type']; // Let browser set multipart boundary
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw new Error(data.message || response.statusText || 'API Request Failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Client Error:', error);
        throw error;
    }
}

// Named API exports for cleaner usage
const Api = {
    Auth: {
        login: (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials }),
        register: (userData) => apiClient('/auth/register', { method: 'POST', body: userData }),
        getProfile: () => apiClient('/auth/me')
    },
    Candidate: {
        uploadResume: (formData) => apiClient('/candidate/upload', { method: 'POST', body: formData }),
        getRecommendations: () => apiClient('/candidate/recommendations'),
        applyJob: (jobId) => apiClient('/candidate/apply', { method: 'POST', body: { jobId } })
    },
    Recruiter: {
        postJob: (jobData) => apiClient('/jobs', { method: 'POST', body: jobData }),
        getJobs: () => apiClient('/jobs'),
        getJobApplications: (jobId) => apiClient(`/jobs/${jobId}/applications`)
    }
};
