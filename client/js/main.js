// Main utilities for front-end manipulation

class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'success') {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let color = '#38ec83';
        if(type === 'error') color = '#ff006e';
        else if(type === 'info') color = '#3a86ff';

        toast.style.borderLeft = `4px solid ${color}`;
        toast.innerHTML = `<div style="font-weight: 500">${message}</div>`;
        
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

class AuthGuard {
    static checkAuth() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token) {
            // Not logged in, redirect if on secure pages
            if(window.location.pathname.includes('dashboard')) {
                window.location.href = '/pages/login.html';
            }
            return null;
        }

        // Redirect logic for logged in users sitting on auth pages or index pages
        const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
        
        if (isAuthPage) {
            if (role === 'Candidate') {
                window.location.href = '/pages/candidate-dashboard.html';
            } else if (role === 'Recruiter') {
                window.location.href = '/pages/recruiter-dashboard.html';
            }
        }

        return { token, role };
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/index.html';
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated and needs redirecting
    // We wrap inside try-catch to prevent breaking dev env when files run locally
    try {
        AuthGuard.checkAuth();
    } catch(e) {}
    
    // Attach event listeners for any logout buttons
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthGuard.logout();
        });
    });
});
