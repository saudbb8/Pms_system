<?php
// config.php - Configuration file for the Patient Management System

// Start session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Login credentials configuration
// TO CHANGE ALLOWED CREDENTIALS:
// 1. Edit the array below
// 2. Add or modify email => password pairs
// 3. Save the file
$ALLOWED_CREDENTIALS = [
    // Format: 'email' => 'password'
    'sarah.johnson@email.com' => 'demo123',
    'patient@demo.com' => 'demo123',
    'saudbb433@gmail.com' => 'password123',
    // Add more credentials here as needed
    // 'new.user@example.com' => 'newpassword',
];

// User profiles (optional - for displaying different user information)
$USER_PROFILES = [
    'sarah.johnson@email.com' => [
        'name' => 'Sarah Johnson',
        'patient_id' => 'PAK-2024-001',
        'phone' => '0412 345 678',
        'address' => '123 Main Street, Pakenham VIC 3810',
        'dob' => 'June 15, 1985',
        'medicare' => '1234 56789 0',
        'emergency_contact' => 'John Johnson (Husband)',
        'emergency_phone' => '0413 456 789'
    ],
    'patient@demo.com' => [
        'name' => 'Demo Patient',
        'patient_id' => 'PAK-2024-002',
        'phone' => '0412 000 000',
        'address' => '456 Demo Street, Pakenham VIC 3810',
        'dob' => 'January 1, 1990',
        'medicare' => '9876 54321 0',
        'emergency_contact' => 'Demo Contact',
        'emergency_phone' => '0413 000 000'
    ],
    'saudbb433@gmail.com' => [
        'name' => 'Saud Ahmed',
        'patient_id' => 'PAK-2024-003',
        'phone' => '0412 111 111',
        'address' => '789 Test Avenue, Pakenham VIC 3810',
        'dob' => 'March 20, 1988',
        'medicare' => '5555 66666 7',
        'emergency_contact' => 'Emergency Contact',
        'emergency_phone' => '0413 111 111'
    ]
];

// Application settings
$APP_SETTINGS = [
    'app_name' => 'Pakenham Hospital Patient Management System',
    'version' => '1.0.0',
    'session_timeout' => 3600, // 1 hour in seconds
    'max_login_attempts' => 5,
    'lockout_duration' => 900 // 15 minutes in seconds
];

// Error messages
$ERROR_MESSAGES = [
    'invalid_credentials' => 'Invalid email or password',
    'missing_email' => 'Email is required',
    'missing_password' => 'Password is required',
    'invalid_email' => 'Please enter a valid email address',
    'short_password' => 'Password must be at least 3 characters',
    'session_expired' => 'Your session has expired. Please log in again.',
    'access_denied' => 'Access denied. Please log in to continue.',
    'too_many_attempts' => 'Too many login attempts. Please try again later.'
];

// Helper functions
function getCredentials() {
    global $ALLOWED_CREDENTIALS;
    return $ALLOWED_CREDENTIALS;
}

function getUserProfile($email) {
    global $USER_PROFILES;
    return isset($USER_PROFILES[$email]) ? $USER_PROFILES[$email] : null;
}

function getAppSetting($key) {
    global $APP_SETTINGS;
    return isset($APP_SETTINGS[$key]) ? $APP_SETTINGS[$key] : null;
}

function getErrorMessage($key) {
    global $ERROR_MESSAGES;
    return isset($ERROR_MESSAGES[$key]) ? $ERROR_MESSAGES[$key] : 'An error occurred';
}

// Security functions
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function checkSessionTimeout() {
    $timeout = getAppSetting('session_timeout');
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > $timeout) {
        session_destroy();
        return false;
    }
    return true;
}

// Rate limiting (basic implementation)
function checkRateLimit($identifier) {
    $max_attempts = getAppSetting('max_login_attempts');
    $lockout_duration = getAppSetting('lockout_duration');
    
    $attempts_key = 'login_attempts_' . $identifier;
    $lockout_key = 'lockout_until_' . $identifier;
    
    // Check if currently locked out
    if (isset($_SESSION[$lockout_key]) && $_SESSION[$lockout_key] > time()) {
        return false;
    }
    
    // Initialize attempts if not set
    if (!isset($_SESSION[$attempts_key])) {
        $_SESSION[$attempts_key] = 0;
    }
    
    return $_SESSION[$attempts_key] < $max_attempts;
}

function recordFailedAttempt($identifier) {
    $max_attempts = getAppSetting('max_login_attempts');
    $lockout_duration = getAppSetting('lockout_duration');
    
    $attempts_key = 'login_attempts_' . $identifier;
    $lockout_key = 'lockout_until_' . $identifier;
    
    $_SESSION[$attempts_key] = ($_SESSION[$attempts_key] ?? 0) + 1;
    
    if ($_SESSION[$attempts_key] >= $max_attempts) {
        $_SESSION[$lockout_key] = time() + $lockout_duration;
    }
}

function clearFailedAttempts($identifier) {
    $attempts_key = 'login_attempts_' . $identifier;
    $lockout_key = 'lockout_until_' . $identifier;
    
    unset($_SESSION[$attempts_key]);
    unset($_SESSION[$lockout_key]);
}
?>