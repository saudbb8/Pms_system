// DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    setupAccessibility();
    loadFormData();
});

// Event Listeners
function setupEventListeners() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (emailInput) {
        emailInput.addEventListener('input', clearFieldError);
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', saveFormData);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', clearFieldError);
        passwordInput.addEventListener('blur', validatePassword);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hideMessages();
        if (e.altKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            fillDemoCredentials();
            showMessage('success', 'Demo credentials filled');
        }
    });
}

// Accessibility Setup
function setupAccessibility() {
    if (emailInput) emailInput.focus();
    if (errorMessage) errorMessage.setAttribute('tabindex', '-1');
    if (successMessage) successMessage.setAttribute('tabindex', '-1');
}

// Form Validation
function validateEmail() {
    const email = emailInput.value.trim();
    if (!email) {
        showFieldError('email-error', 'Email is required');
        return false;
    }
    if (!isValidEmail(email)) {
        showFieldError('email-error', 'Please enter a valid email address');
        return false;
    }
    hideFieldError('email-error');
    return true;
}

function validatePassword() {
    const password = passwordInput.value;
    if (!password) {
        showFieldError('password-error', 'Password is required');
        return false;
    }
    if (password.length < 3) {
        showFieldError('password-error', 'Password must be at least 3 characters');
        return false;
    }
    hideFieldError('password-error');
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Error Display Functions
function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        const input = errorElement.closest('.form-group')?.querySelector('input');
        if (input) input.setAttribute('aria-invalid', 'true');
    }
}

function hideFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.remove('show');
        const input = errorElement.closest('.form-group')?.querySelector('input');
        if (input) input.removeAttribute('aria-invalid');
    }
}

function clearFieldError(e) {
    const input = e.target;
    const errorId = input.getAttribute('aria-describedby');
    if (errorId) hideFieldError(errorId);
}

// Message Display
function showMessage(type, message) {
    hideMessages();
    const messageElement = document.getElementById(`${type}-message`);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.add('show');
        messageElement.setAttribute('aria-live', 'polite');
        messageElement.focus();
    }
}

function hideMessages() {
    if (errorMessage) errorMessage.classList.remove('show');
    if (successMessage) successMessage.classList.remove('show');
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    hideMessages();
    hideFieldError('email-error');
    hideFieldError('password-error');

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) {
        showMessage('error', 'Please fix the errors below');
        return;
    }

    setLoadingState(true);

    try {
        const formData = new FormData(loginForm);
        const response = await fetch('login.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showMessage('success', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'welcome.php';
            }, 1500);
        } else {
            showMessage('error', result.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('error', 'Connection error. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Loading State
function setLoadingState(isLoading) {
    if (loginBtn) {
        loginBtn.disabled = isLoading;
        loginBtn.innerHTML = isLoading ? `Logging in... <span id="loadingSpinner"></span>` : 'Login to Dashboard';
    }
    if (loadingSpinner) {
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';
    }
}

// Password Toggle
function togglePassword() {
    const passwordIcon = document.getElementById('password-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        passwordIcon.textContent = '👁️';
    }
    passwordInput.focus();
}

// Demo & Extras
function forgotPassword() {
    showMessage('success', 'Password reset instructions would be sent to your email.');
}

function registerNewPatient() {
    alert('Redirecting to patient registration...');
    window.location.href = 'patient-enrolment.html'; // change to your actual form page
  }

function showPrivacyPolicy() {
    showMessage('success', 'Privacy policy would open in a new window.');
}

function fillDemoCredentials() {
    if (emailInput) emailInput.value = 'sarah.johnson@email.com';
    if (passwordInput) passwordInput.value = 'demo123';
}

// Form auto-save
function saveFormData() {
    if (emailInput && emailInput.value) {
        localStorage.setItem('loginEmail', emailInput.value);
    }
}

function loadFormData() {
    const savedEmail = localStorage.getItem('loginEmail');
    if (savedEmail && emailInput && !emailInput.value) {
        emailInput.value = savedEmail;
    }
}
