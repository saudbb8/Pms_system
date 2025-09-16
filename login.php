<?php
// login.php
session_start();

// Allowed credentials
$ALLOWED_CREDENTIALS = [
    'sarah.johnson@email.com' => 'demo123',
    'patient@demo.com' => 'demo123',
    'saudbb433@gmail.com' => 'password123'
];

// JSON response helper
function sendJsonResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Redirect if already logged in
if (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        sendJsonResponse(true, 'Already logged in', ['redirect' => 'welcome.php']);
    } else {
        header('Location: welcome.php');
        exit;
    }
}

// Handle login POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $password = isset($_POST['password']) ? sanitizeInput($_POST['password']) : '';
    $errors = [];

    if (empty($email)) $errors[] = 'Email is required';
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email format';

    if (empty($password)) $errors[] = 'Password is required';
    elseif (strlen($password) < 3) $errors[] = 'Password must be at least 3 characters';

    if (empty($errors)) {
        if (isset($ALLOWED_CREDENTIALS[$email]) && $ALLOWED_CREDENTIALS[$email] === $password) {
            // Successful login
            $_SESSION['user_logged_in'] = true;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = 'Sarah Johnson'; 
            $_SESSION['patient_id'] = 'PAK-2024-001';
            session_regenerate_id(true);

            sendJsonResponse(true, 'Login successful');
        } else {
            sendJsonResponse(false, 'Invalid email or password');
        }
    } else {
        sendJsonResponse(false, implode(', ', $errors));
    }
}

// Show login form (GET request)
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Portal Login - Pakenham Hospital</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="icon-circle">
                <div class="loading-spinner" id="loadingSpinner"></div>
            </div>

            <h1>Patient Portal Login</h1>
            <p class="subtitle">Access your secure patient dashboard</p>

            <div id="error-message" class="error-message" role="alert" aria-live="polite"></div>
            <div id="success-message" class="success-message" role="alert" aria-live="polite"></div>

            <form id="login-form" method="POST" action="login.php" novalidate>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required aria-describedby="email-error" autocomplete="username">
                    <div id="email-error" class="field-error" role="alert"></div>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-container">
                        <input type="password" id="password" name="password" required aria-describedby="password-error" autocomplete="current-password">
                        <button type="button" class="password-toggle" onclick="togglePassword()" aria-label="Toggle password visibility">
                            <span id="password-icon">👁️</span>
                        </button>
                    </div>
                    <div id="password-error" class="field-error" role="alert"></div>
                </div>

                <button type="submit" class="login-btn" id="login-btn">Login to Dashboard</button>
                <a href="#" class="forgot-password" onclick="forgotPassword()">Forgot your password?</a>
            </form>

            <div class="divider">Don't have an account?</div>
            <a href="#" class="register-link" onclick="registerNewPatient()">Register as New Patient</a>

            <div class="demo-section">
                <div class="demo-title">Demo Credentials:</div>
                <div class="demo-credentials">
                    <div><strong>Email:</strong> sarah.johnson@email.com</div>
                    <div><strong>Password:</strong> demo123</div>
                </div>
            </div>

            <div class="footer">
                Your data is protected with bank-level security. By logging in, you agree to our 
                <a href="#" onclick="showPrivacyPolicy()">privacy policy</a>.
            </div>
        </div>
    </div>

    <script src="login.js"></script>
    
</body>
</html>
