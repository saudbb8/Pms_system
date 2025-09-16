<?php
// welcome.php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Get user data from session
$userName = isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'Sarah Johnson';
$userEmail = isset($_SESSION['user_email']) ? $_SESSION['user_email'] : '';
$patientId = isset($_SESSION['patient_id']) ? $_SESSION['patient_id'] : 'PAK-2024-001';

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Dashboard - Pakenham Hospital</title>
    <link rel="stylesheet" href="welcome.css">
</head>
<body style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    <div class="welcome-container">
        <!-- Header -->
        <div class="welcome-header">
            <div class="welcome-info">
                <h1>Welcome back, <?php echo htmlspecialchars($userName); ?></h1>
                <p class="patient-id">Patient ID: <?php echo htmlspecialchars($patientId); ?></p>
            </div>
            <div class="header-actions">
                <a href="#" class="btn btn-primary">+ Book Appointment</a>
                <a href="?logout=1" class="btn btn-secondary">↗ Logout</a>
                <div class="avatar"><?php echo strtoupper(substr($userName, 0, 2)); ?></div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="tab-nav">
            <a href="#" class="tab-item active">
                <span>👤</span> Overview
            </a>
            <a href="#" class="tab-item">
                <span>📅</span> Appointments
            </a>
            <a href="#" class="tab-item">
                <span>📋</span> Medical Records
            </a>
            <a href="#" class="tab-item">
                <span>📊</span> Attendance
            </a>
        </nav>

        <!-- Dashboard Stats -->
        <div class="dashboard-grid">
            <div class="stats-card">
                <h3>Next Appointment</h3>
                <div class="appointment-date">Sep 15</div>
                <div class="appointment-doctor">Dr. Sarah Smith</div>
                <div class="appointment-time">10:00 AM</div>
            </div>
            
            <div class="stats-card">
                <h3>Attendance Rate</h3>
                <div class="stat-value green">92%</div>
                <div class="stat-label">11 of 12 appointments</div>
            </div>
            
            <div class="stats-card">
                <h3>Active Treatments</h3>
                <div class="stat-value blue">2</div>
                <div class="stat-label">Ongoing care plans</div>
            </div>
        </div>

        <!-- Personal Information -->
        <div class="personal-info">
            <div class="section-header">
                <h2>Personal Information</h2>
                <a href="#" class="edit-btn">✏️ Edit Profile</a>
            </div>
            
            <div class="info-grid">
                <div class="info-column">
                    <div class="info-item">
                        <span class="info-icon">✉️</span>
                        <div class="info-content">
                            <div class="info-value"><?php echo htmlspecialchars($userEmail); ?></div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-icon">📞</span>
                        <div class="info-content">
                            <div class="info-value">0412 345 678</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-icon">📍</span>
                        <div class="info-content">
                            <div class="info-value">123 Main Street, Pakenham VIC 3810</div>
                        </div>
                    </div>
                </div>
                
                <div class="info-column">
                    <div class="info-item">
                        <div class="info-content">
                            <div class="info-label">Date of Birth</div>
                            <div class="info-value">June 15, 1985</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-content">
                            <div class="info-label">Medicare Number</div>
                            <div class="info-value">1234 56789 0</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-content">
                            <div class="info-label">Emergency Contact</div>
                            <div class="emergency-contact">John Johnson (Husband)</div>
                            <div class="emergency-phone">0413 456 789</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
            <h2>Recent Activity</h2>
            
            <div class="activity-item">
                <div class="activity-indicator green"></div>
                <div class="activity-content">
                    <h4>Blood work results available</h4>
                    <div class="activity-date">August 12, 2024</div>
                </div>
            </div>
            
            <div class="activity-item">
                <div class="activity-indicator blue"></div>
                <div class="activity-content">
                    <h4>Appointment confirmed with Dr. Smith</h4>
                    <div class="activity-date">August 10, 2024</div>
                </div>
            </div>
        </div>
    </div>

    <script src="login.js"></script>
    <script>
        // Welcome page specific JavaScript
        document.addEventListener('DOMContentLoaded', function() {
            // Add smooth transitions
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease-in';
                document.body.style.opacity = '1';
            }, 100);
            
            // Tab navigation
            const tabItems = document.querySelectorAll('.tab-item');
            tabItems.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all tabs
                    tabItems.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Show notification for demo
                    showWelcomeMessage('Tab functionality coming soon!');
                });
            });
            
            // Edit profile button
            const editBtn = document.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showWelcomeMessage('Profile editing functionality coming soon!');
                });
            }
            
            // Book appointment button
            const bookBtn = document.querySelector('.btn-primary');
            if (bookBtn) {
                bookBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showWelcomeMessage('Appointment booking functionality coming soon!');
                });
            }
        });
        
        function showWelcomeMessage(message) {
            // Create or update notification
            let notification = document.getElementById('welcome-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'welcome-notification';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                `;
                document.body.appendChild(notification);
            }
            
            notification.textContent = message;
            notification.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
            }, 3000);
        }
    </script>
</body>
</html>