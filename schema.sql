-- Smart Patient Management System Database Schema
-- MySQL/MariaDB

CREATE DATABASE IF NOT EXISTS smart_patient_system;
USE smart_patient_system;

-- Patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer-not-to-say') NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    emergency_name VARCHAR(200) NOT NULL,
    emergency_relationship VARCHAR(50) NOT NULL,
    emergency_phone VARCHAR(20) NOT NULL,
    emergency_email VARCHAR(255),
    medicare_number VARCHAR(20),
    private_health_insurance VARCHAR(255),
    allergies TEXT,
    medical_conditions TEXT,
    medications TEXT,
    preferred_gp VARCHAR(100),
    communication_preference ENUM('email', 'sms', 'phone', 'mail') DEFAULT 'email',
    marketing_consent BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    password_reset_required BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_patient_id (patient_id)
);

-- Healthcare providers table
CREATE TABLE healthcare_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(10) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    provider_id INT NOT NULL,
    department_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    appointment_type ENUM('consultation', 'follow-up', 'emergency', 'procedure', 'test') DEFAULT 'consultation',
    reason_for_visit TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    
    INDEX idx_patient_date (patient_id, appointment_date),
    INDEX idx_provider_date (provider_id, appointment_date),
    INDEX idx_status (status)
);

-- Appointment slots table (for managing availability)
CREATE TABLE appointment_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    department_id INT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    is_available BOOLEAN DEFAULT TRUE,
    max_bookings INT DEFAULT 1,
    current_bookings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    
    UNIQUE KEY unique_slot (provider_id, slot_date, slot_time),
    INDEX idx_availability (slot_date, is_available)
);

-- Medical records table
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    provider_id INT NOT NULL,
    appointment_id INT,
    record_type ENUM('consultation', 'diagnosis', 'treatment', 'test_result', 'prescription') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis_codes TEXT,
    treatment_plan TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    
    INDEX idx_patient_date (patient_id, created_at),
    INDEX idx_record_type (record_type)
);

-- Test results table
CREATE TABLE test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    result_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    provider_id INT NOT NULL,
    appointment_id INT,
    test_type VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    result_data JSON,
    normal_range VARCHAR(255),
    status ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    is_abnormal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_test_date (test_date)
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    provider_id INT NOT NULL,
    appointment_id INT,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    refills_allowed INT DEFAULT 0,
    refills_used INT DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    prescribed_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_expiry (expiry_date)
);

-- Billing table
CREATE TABLE billing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    insurance_covered DECIMAL(10, 2) DEFAULT 0.00,
    patient_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_due_date (due_date)
);

-- Patient check-ins table (for tracking attendance)
CREATE TABLE patient_checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    appointment_id INT NOT NULL,
    checkin_method ENUM('biometric', 'rfid', 'mobile', 'manual') NOT NULL,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    
    INDEX idx_patient_date (patient_id, checkin_time),
    INDEX idx_appointment (appointment_id)
);

-- Support tickets table
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    category ENUM('technical', 'billing', 'appointment', 'medical', 'general') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to INT NULL,
    resolution TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_priority_status (priority, status)
);

-- Chat messages table (for AI chatbot and support)
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    patient_id INT NULL,
    ticket_id INT NULL,
    message_type ENUM('user', 'bot', 'agent') NOT NULL,
    message TEXT NOT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    
    INDEX idx_session (session_id),
    INDEX idx_patient_session (patient_id, session_id)
);

-- Login attempts table (for security)
CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ip_time (ip_address, created_at),
    INDEX idx_email_time (email, created_at)
);

-- Remember tokens table (for "remember me" functionality)
CREATE TABLE remember_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES patients(id) ON DELETE CASCADE,
    
    INDEX idx_token (token_hash),
    INDEX idx_expiry (expires_at)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES patients(id) ON DELETE SET NULL,
    
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_action_time (action, created_at)
);

-- Email queue table
CREATE TABLE email_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    to_email VARCHAR(255) NOT NULL,
    cc_emails TEXT NULL,
    bcc_emails TEXT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    attachments JSON NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status_priority (status, priority),
    INDEX idx_created (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data

-- Departments
INSERT INTO departments (name, description) VALUES
('General Practice', 'Primary healthcare and general consultations'),
('Cardiology', 'Heart and cardiovascular specialist care'),
('Emergency Department', '24/7 emergency medical care'),
('Laboratory', 'Diagnostic testing and pathology services'),
('Radiology', 'Medical imaging and diagnostic radiology'),
('Orthopedics', 'Bone, joint, and musculoskeletal care'),
('Neurology', 'Brain and nervous system specialist care'),
('Pediatrics', 'Specialized care for children and adolescents');

-- Healthcare providers
INSERT INTO healthcare_providers (provider_id, first_name, last_name, title, specialization, department, email, phone) VALUES
('DR001', 'Sarah', 'Smith', 'Dr.', 'General Practice', 'General Practice', 'sarah.smith@pakenhamhospital.vic.gov.au', '03 5940 8001'),
('DR002', 'Michael', 'Johnson', 'Dr.', 'Cardiology', 'Cardiology', 'michael.johnson@pakenhamhospital.vic.gov.au', '03 5940 8002'),
('DR003', 'Emily', 'Williams', 'Dr.', 'Emergency Medicine', 'Emergency Department', 'emily.williams@pakenhamhospital.vic.gov.au', '03 5940 8003'),
('DR004', 'David', 'Brown', 'Dr.', 'Orthopedics', 'Orthopedics', 'david.brown@pakenhamhospital.vic.gov.au', '03 5940 8004'),
('DR005', 'Lisa', 'Davis', 'Dr.', 'Neurology', 'Neurology', 'lisa.davis@pakenhamhospital.vic.gov.au', '03 5940 8005');

-- System settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('hospital_name', 'Pakenham Hospital', 'Hospital name', TRUE),
('hospital_address', '123 Hospital Drive, Pakenham VIC 3810', 'Hospital address', TRUE),
('hospital_phone', '(03) 5940-8000', 'Hospital main phone number', TRUE),
('emergency_phone', '000', 'Emergency phone number', TRUE),
('appointment_booking_enabled', '1', 'Enable online appointment booking', FALSE),
('max_advance_booking_days', '90', 'Maximum days in advance for booking', FALSE),
('default_appointment_duration', '30', 'Default appointment duration in minutes', FALSE);