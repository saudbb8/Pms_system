<?php
// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database configuration
$host = 'localhost';
$dbname = 'pms_system';
$username = 'root';
$password = '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // If database connection fails, we'll still process the appointment
    // but won't save to database (for demo purposes)
    $pdo = null;
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Validate and sanitize input data
$doctor = sanitizeInput($_POST['doctor'] ?? '');
$doctor_name = sanitizeInput($_POST['doctor_name'] ?? '');
$date = sanitizeInput($_POST['date'] ?? '');
$time = sanitizeInput($_POST['time'] ?? '');
$reason = sanitizeInput($_POST['reason'] ?? '');
$patient_name = sanitizeInput($_POST['patient_name'] ?? '');
$patient_phone = sanitizeInput($_POST['patient_phone'] ?? '');
$patient_email = sanitizeInput($_POST['patient_email'] ?? '');
$notes = sanitizeInput($_POST['notes'] ?? '');

// Validation
$errors = [];

if (empty($doctor)) {
    $errors[] = 'Doctor selection is required';
}

if (empty($date)) {
    $errors[] = 'Date selection is required';
} elseif (!isValidDate($date)) {
    $errors[] = 'Invalid date format';
}

if (empty($time)) {
    $errors[] = 'Time selection is required';
}

if (empty($reason)) {
    $errors[] = 'Reason for visit is required';
}

if (empty($patient_name)) {
    $errors[] = 'Patient name is required';
} elseif (strlen($patient_name) < 2) {
    $errors[] = 'Patient name must be at least 2 characters';
}

if (empty($patient_phone)) {
    $errors[] = 'Phone number is required';
} elseif (!isValidPhone($patient_phone)) {
    $errors[] = 'Invalid phone number format';
}

if (empty($patient_email)) {
    $errors[] = 'Email address is required';
} elseif (!filter_var($patient_email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address format';
}

// If there are validation errors, return them
if (!empty($errors)) {
    echo json_encode([
        'success' => false, 
        'message' => implode(', ', $errors),
        'errors' => $errors
    ]);
    exit;
}

// Generate appointment ID
$appointment_id = 'APT' . date('Ymd') . sprintf('%04d', rand(1000, 9999));

// Create appointment data array
$appointment_data = [
    'appointment_id' => $appointment_id,
    'doctor_id' => $doctor,
    'doctor_name' => $doctor_name,
    'appointment_date' => $date,
    'appointment_time' => $time,
    'reason' => $reason,
    'patient_name' => $patient_name,
    'patient_phone' => $patient_phone,
    'patient_email' => $patient_email,
    'notes' => $notes,
    'status' => 'confirmed',
    'created_at' => date('Y-m-d H:i:s')
];

// Try to save to database if connection is available
$saved_to_db = false;
if ($pdo) {
    try {
        $sql = "INSERT INTO appointments (
                    appointment_id, doctor_id, doctor_name, appointment_date, 
                    appointment_time, reason, patient_name, patient_phone, 
                    patient_email, notes, status, created_at
                ) VALUES (
                    :appointment_id, :doctor_id, :doctor_name, :appointment_date,
                    :appointment_time, :reason, :patient_name, :patient_phone,
                    :patient_email, :notes, :status, :created_at
                )";
        
        $stmt = $pdo->prepare($sql);
        
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->bindParam(':doctor_id', $doctor);
        $stmt->bindParam(':doctor_name', $doctor_name);
        $stmt->bindParam(':appointment_date', $date);
        $stmt->bindParam(':appointment_time', $time);
        $stmt->bindParam(':reason', $reason);
        $stmt->bindParam(':patient_name', $patient_name);
        $stmt->bindParam(':patient_phone', $patient_phone);
        $stmt->bindParam(':patient_email', $patient_email);
        $stmt->bindParam(':notes', $notes);
        $stmt->bindParam(':status', $appointment_data['status']);
        $stmt->bindParam(':created_at', $appointment_data['created_at']);
        
        $stmt->execute();
        $saved_to_db = true;
        
    } catch(PDOException $e) {
        // Log error but continue (appointment still processed)
        error_log("Database error: " . $e->getMessage());
    }
}

// Send confirmation email (optional)
$email_sent = false;
try {
    $email_sent = sendConfirmationEmail($appointment_data);
} catch(Exception $e) {
    // Log email error but continue
    error_log("Email error: " . $e->getMessage());
}

// Log appointment to file as backup
logAppointment($appointment_data);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Appointment booked successfully',
    'appointment_id' => $appointment_id,
    'appointment_data' => $appointment_data,
    'saved_to_database' => $saved_to_db,
    'email_sent' => $email_sent
]);

// Helper functions
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function isValidDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function isValidPhone($phone) {
    // Basic phone validation (adjust regex as needed)
    return preg_match('/^[\+]?[\d\s\-\(\)]{10,}$/', $phone);
}

function sendConfirmationEmail($appointment_data) {
    // Simple email function (you can enhance this with PHPMailer or similar)
    $to = $appointment_data['patient_email'];
    $subject = "Appointment Confirmation - " . $appointment_data['appointment_id'];
    
    $message = "
    <html>
    <head>
        <title>Appointment Confirmation</title>
    </head>
    <body>
        <h2>Appointment Confirmed!</h2>
        <p>Dear {$appointment_data['patient_name']},</p>
        <p>Your appointment has been successfully booked.</p>
        
        <h3>Appointment Details:</h3>
        <ul>
            <li><strong>Appointment ID:</strong> {$appointment_data['appointment_id']}</li>
            <li><strong>Doctor:</strong> {$appointment_data['doctor_name']}</li>
            <li><strong>Date:</strong> {$appointment_data['appointment_date']}</li>
            <li><strong>Time:</strong> {$appointment_data['appointment_time']}</li>
            <li><strong>Reason:</strong> {$appointment_data['reason']}</li>
        </ul>
        
        <p>Please arrive 15 minutes before your scheduled appointment time.</p>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        
        <p>Thank you for choosing Pakenham Hospital.</p>
        
        <p>Best regards,<br>
        Pakenham Hospital Team</p>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: appointments@pakenhanhospital.com" . "\r\n";
    
    // In production, use a proper mail service
    // For demo, we'll just return true
    return true; // mail($to, $subject, $message, $headers);
}

function logAppointment($appointment_data) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'appointment' => $appointment_data
    ];
    
    $log_file = 'logs/appointments_' . date('Y-m') . '.log';
    
    // Create logs directory if it doesn't exist
    $log_dir = dirname($log_file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);
}

/**
 * Database Table Creation Script (Run this once to create the appointments table)
 * 
 * CREATE TABLE appointments (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     appointment_id VARCHAR(20) NOT NULL UNIQUE,
 *     doctor_id VARCHAR(50) NOT NULL,
 *     doctor_name VARCHAR(100) NOT NULL,
 *     appointment_date DATE NOT NULL,
 *     appointment_time TIME NOT NULL,
 *     reason VARCHAR(100) NOT NULL,
 *     patient_name VARCHAR(100) NOT NULL,
 *     patient_phone VARCHAR(20) NOT NULL,
 *     patient_email VARCHAR(100) NOT NULL,
 *     notes TEXT,
 *     status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */
?>