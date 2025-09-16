
<?php
/**
 * Patient Enrollment Processing Script
 * Pakenham Hospital - Patient Management System
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Database configuration
    $host = 'localhost';
    $dbname = 'pms_system';
    $username = 'root';
    $password = '';
    
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
    // Validate required fields
    $required_fields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone',
        'address', 'city', 'state', 'postcode', 'emergencyName1', 
        'emergencyRelationship1', 'emergencyPhone1', 'username', 'password',
        'confirmPassword', 'securityQuestion', 'securityAnswer'
    ];
    
    $errors = [];
    
    // Check required fields
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
            $errors[] = ucfirst(str_replace(['_', 'Consent'], [' ', ' consent'], $field)) . ' is required';
        }
    }
    
    // Check checkbox fields
    foreach (['termsConsent', 'healthConsent'] as $field) {
        if (!isset($_POST[$field]) || $_POST[$field] !== '1') {
            $errors[] = ucfirst(str_replace(['_', 'Consent'], [' ', ' consent'], $field)) . ' must be accepted';
        }
    }
    
    // Additional validation
    if (empty($errors)) {
        // Email validation
        if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please enter a valid email address';
        }
        
        // Phone validation (Australian format)
        if (!preg_match('/^[\+]?[0-9\s\-\(\)]{8,}$/', $_POST['phone'])) {
            $errors[] = 'Please enter a valid phone number';
        }
        
        // Date of birth validation
        $dob = new DateTime($_POST['dateOfBirth']);
        $today = new DateTime();
        if ($dob > $today) {
            $errors[] = 'Date of birth cannot be in the future';
        }
        $age = $today->diff($dob)->y;
        if ($age > 120) {
            $errors[] = 'Please enter a valid date of birth';
        }
        
        // Postcode validation (Australian)
        if (!preg_match('/^[0-9]{4}$/', $_POST['postcode'])) {
            $errors[] = 'Please enter a valid 4-digit postcode';
        }
        
        // Medicare validation (if provided)
        if (!empty($_POST['medicare']) && !preg_match('/^[0-9]{4}\s?[0-9]{5}\s?[0-9]$/', $_POST['medicare'])) {
            $errors[] = 'Please enter a valid Medicare number';
        }
        
        // Username validation
        if (strlen($_POST['username']) < 3) {
            $errors[] = 'Username must be at least 3 characters long';
        }
        
        // Password validation
        if (strlen($_POST['password']) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/', $_POST['password'])) {
            $errors[] = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        
        // Confirm password validation
        if ($_POST['password'] !== $_POST['confirmPassword']) {
            $errors[] = 'Passwords do not match';
        }
        
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
        $stmt->execute([$_POST['email']]);
        if ($stmt->fetch()) {
            $errors[] = 'An account with this email address already exists';
        }
        
        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE username = ?");
        $stmt->execute([$_POST['username']]);
        if ($stmt->fetch()) {
            $errors[] = 'This username is already taken';
        }
    }
    
    // Return errors if any
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Validation errors: ' . implode(', ', $errors),
            'errors' => $errors
        ]);
        exit;
    }
    
    // Begin transaction
    $pdo->beginTransaction();
    
        // Prepare data for insertion
        $patientData = [
            'first_name' => trim($_POST['firstName']),
            'last_name' => trim($_POST['lastName']),
            'date_of_birth' => $_POST['dateOfBirth'],
            'gender' => $_POST['gender'],
            'email' => $_POST['email'],
            'phone' => $_POST['phone'],
            'address' => $_POST['address'],
            'city' => $_POST['city'],
            'state' => $_POST['state'],
            'postcode' => $_POST['postcode'],
            'medicare' => isset($_POST['medicare']) ? $_POST['medicare'] : null,
            'emergency_name1' => $_POST['emergencyName1'],
            'emergency_relationship1' => $_POST['emergencyRelationship1'],
            'emergency_phone1' => $_POST['emergencyPhone1'],
            'username' => $_POST['username'],
            'password_hash' => password_hash($_POST['password'], PASSWORD_DEFAULT),
            'security_question' => $_POST['securityQuestion'],
            'security_answer' => $_POST['securityAnswer'],
            'terms_consent' => $_POST['termsConsent'],
            'health_consent' => $_POST['healthConsent'],
            'created_at' => date('Y-m-d H:i:s')
        ];
    
        // Insert patient record
        $stmt = $pdo->prepare("
            INSERT INTO patients (
                first_name, last_name, date_of_birth, gender, email, phone, address, city, state, postcode, medicare,
                emergency_name1, emergency_relationship1, emergency_phone1, username, password_hash,
                security_question, security_answer, terms_consent, health_consent, created_at
            ) VALUES (
                :first_name, :last_name, :date_of_birth, :gender, :email, :phone, :address, :city, :state, :postcode, :medicare,
                :emergency_name1, :emergency_relationship1, :emergency_phone1, :username, :password_hash,
                :security_question, :security_answer, :terms_consent, :health_consent, :created_at
            )
        ");
        $stmt->execute($patientData);
    
        // Commit transaction
        $pdo->commit();
    
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Patient enrolled successfully'
        ]);
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }