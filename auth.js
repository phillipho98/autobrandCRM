/**
 * AutoBrand CRM Authentication
 * Secure client-side authentication with SHA-256 hashing
 */

// ==================== CRYPTO UTILITIES ====================

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== AUTH CONFIGURATION CHECK ====================

function checkConfig() {
    if (typeof AUTH_CONFIG === 'undefined') {
        // Config file not loaded
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('config-missing').classList.add('show');
        return false;
    }
    return true;
}

// ==================== SESSION MANAGEMENT ====================

const SESSION_KEY = 'autobrand-crm-session';
const REMEMBER_KEY = 'autobrand-crm-remember';

function createSession(remember = false) {
    const session = {
        authenticated: true,
        timestamp: Date.now(),
        expires: remember 
            ? Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            : Date.now() + (24 * 60 * 60 * 1000)     // 24 hours
    };
    
    // Generate a session token
    const token = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    
    session.token = token;
    
    if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify(session));
    } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    
    return session;
}

function getSession() {
    // Check session storage first (current session)
    let session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
        session = JSON.parse(session);
        if (session.expires > Date.now()) {
            return session;
        }
        sessionStorage.removeItem(SESSION_KEY);
    }
    
    // Check local storage (remembered session)
    session = localStorage.getItem(REMEMBER_KEY);
    if (session) {
        session = JSON.parse(session);
        if (session.expires > Date.now()) {
            return session;
        }
        localStorage.removeItem(REMEMBER_KEY);
    }
    
    return null;
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
}

function isAuthenticated() {
    return getSession() !== null;
}

// ==================== AUTH FUNCTIONS ====================

async function authenticate(username, password) {
    if (typeof AUTH_CONFIG === 'undefined') {
        throw new Error('Configuration not loaded');
    }
    
    // Hash the provided credentials
    const usernameHash = await sha256(username.toLowerCase().trim());
    const passwordHash = await sha256(password);
    
    // Compare with stored hashes
    if (usernameHash === AUTH_CONFIG.usernameHash && 
        passwordHash === AUTH_CONFIG.passwordHash) {
        return true;
    }
    
    return false;
}

// ==================== LOGIN PAGE LOGIC ====================

function initLoginPage() {
    // Check if config exists
    if (!checkConfig()) {
        return;
    }
    
    // Check if already authenticated
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const loginBtn = document.getElementById('login-btn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Show loading state
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        errorMessage.classList.remove('show');
        
        // Small delay for UX
        await new Promise(r => setTimeout(r, 500));
        
        try {
            const success = await authenticate(username, password);
            
            if (success) {
                createSession(remember);
                window.location.href = 'index.html';
            } else {
                errorText.textContent = 'Invalid username or password';
                errorMessage.classList.add('show');
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                
                // Shake the password field
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        } catch (error) {
            errorText.textContent = 'Authentication error. Please try again.';
            errorMessage.classList.add('show');
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            console.error('Auth error:', error);
        }
    });
}

// ==================== PROTECTED PAGE LOGIC ====================

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

// ==================== INITIALIZATION ====================

// Auto-initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page
    if (document.getElementById('login-form')) {
        initLoginPage();
    }
});

