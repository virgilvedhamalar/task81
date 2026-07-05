/**
 * Secure RBAC API Utility Library
 */

const API_BASE = '/api';

/**
 * Store and Retrieve Authentication Data
 */
export const Auth = {
  getToken() {
    return localStorage.getItem('rbac_token');
  },
  
  setToken(token) {
    localStorage.setItem('rbac_token', token);
  },

  getUser() {
    const userStr = localStorage.getItem('rbac_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('rbac_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('rbac_token');
    localStorage.removeItem('rbac_user');
    window.location.href = '/login.html';
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
};

/**
 * Automated Fetch wrapper that appends Bearer Authorization header
 */
export async function apiRequest(endpoint, options = {}) {
  const token = Auth.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Automatically handle expired or malformed token kicks
  if (response.status === 401 && Auth.isAuthenticated()) {
    showToast('Session Expired or Unauthorized. Logging out...', 'error');
    setTimeout(() => Auth.logout(), 2000);
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
}

/**
 * Toast Notification Helper
 */
export function showToast(message, type = 'success') {
  // Remove existing toast if any
  const oldToast = document.getElementById('rbac-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.id = 'rbac-toast';
  toast.className = `fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform duration-300 translate-y-10 opacity-0 ${
    type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
  }`;
  toast.innerText = message;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 10);

  // Hide and remove
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Dynamic Role-Based Navigation Menu Render
 */
export function renderNavBar() {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const isAuthenticated = Auth.isAuthenticated();
  const user = Auth.getUser();
  const role = Auth.getRole();

  let navHTML = '';

  if (isAuthenticated && user) {
    const isAdmin = role === 'Admin';
    const initials = (user.name || 'US').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    navHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo Container -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <a href="/index.html" class="text-xl font-bold tracking-tight text-slate-900 hover:opacity-90 transition">
              SecureRBAC <span class="text-indigo-600">Pro</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-4 text-sm font-medium text-slate-600">
              <a href="/index.html" class="hover:text-indigo-600 transition cursor-pointer">Home</a>
              
              ${isAdmin ? `
                <a href="/admin.html" class="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50 hover:bg-indigo-100 transition">
                  Admin Dashboard
                </a>
              ` : `
                <a href="/dashboard.html" class="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50 hover:bg-indigo-100 transition">
                  User Dashboard
                </a>
              `}

              <a href="/profile.html" class="hover:text-indigo-600 transition cursor-pointer">Profile</a>
            </div>

            <div class="h-6 w-px bg-slate-200"></div>

            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-xs font-bold text-slate-900">${user.name}</p>
                <p class="text-[10px] text-slate-500 font-mono">${user.email}</p>
              </div>
              <div class="w-9 h-9 bg-slate-200 rounded-full border-2 border-indigo-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                ${initials}
              </div>
            </div>

            <button id="logout-btn" class="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Unauthenticated Navbar
    navHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo Container -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <a href="/index.html" class="text-xl font-bold tracking-tight text-slate-900 hover:opacity-90 transition">
              SecureRBAC <span class="text-indigo-600">Pro</span>
            </a>
          </div>

          <div class="flex items-center gap-4">
            <a href="/login.html" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
              Sign In
            </a>
            <a href="/register.html" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
              Register
            </a>
          </div>
        </div>
      </div>
    `;
  }

  navContainer.innerHTML = navHTML;
  navContainer.className = 'bg-white border-b border-slate-200 sticky top-0 z-40 h-16 flex items-center';

  // Attach logout handler dynamically if it exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }
}

/**
 * Route Guard helpers
 */
export function guardRoute(allowedRoles = []) {
  const isAuthenticated = Auth.isAuthenticated();
  if (!isAuthenticated) {
    window.location.href = '/login.html';
    return false;
  }

  if (allowedRoles.length > 0) {
    const userRole = Auth.getRole();
    if (!allowedRoles.includes(userRole)) {
      alert(`Access Forbidden: This page requires the following roles: [${allowedRoles.join(', ')}]. You are logged in as a [${userRole}]. Redirecting...`);
      window.location.href = userRole === 'Admin' ? '/admin.html' : '/dashboard.html';
      return false;
    }
  }
  return true;
}
