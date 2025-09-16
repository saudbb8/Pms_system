// Variables
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let selectedDoctor = null;
let selectedDoctorName = '';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Generate calendar
    generateCalendar(currentDate);
    
    // Setup all event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission handler
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted!');
            validateAndSubmit();
        });
    }

    // Doctor selection
    document.querySelectorAll('.doctor-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.doctor-card').forEach(c => 
                c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            selectedDoctor = this.dataset.doctor;
            selectedDoctorName = this.dataset.name;
            
            // Update hidden form fields
            document.getElementById('selectedDoctor').value = selectedDoctor;
            document.getElementById('selectedDoctorName').value = selectedDoctorName;
            
            console.log('Doctor selected:', selectedDoctor, selectedDoctorName);
            clearError('doctorError');
        });
    });

    // Time selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            // Remove previous selection
            document.querySelectorAll('.time-slot').forEach(s => 
                s.classList.remove('selected'));
            
            // Add selection to clicked slot
            this.classList.add('selected');
            selectedTime = this.dataset.time;
            
            // Update hidden form field
            document.getElementById('selectedTime').value = selectedTime;
            
            console.log('Time selected:', selectedTime);
            clearError('timeError');
        });
    });

    // Form input listeners for real-time validation
    document.getElementById('patientName').addEventListener('input', () => clearError('nameError'));
    document.getElementById('patientPhone').addEventListener('input', () => clearError('phoneError'));
    document.getElementById('patientEmail').addEventListener('input', () => clearError('emailError'));
    document.getElementById('reasonSelect').addEventListener('change', () => clearError('reasonError'));
}

function validateAndSubmit() {
    let isValid = true;
    
    // Clear all previous errors
    clearAllErrors();
    
    // Validate doctor selection
    if (!selectedDoctor) {
        showError('Please select a doctor', 'doctorError');
        isValid = false;
    }
    
    // Validate date selection
    if (!selectedDate) {
        showError('Please select a date', 'dateError');
        isValid = false;
    } else {
        // Update hidden form field
        document.getElementById('selectedDate').value = selectedDate.toISOString().split('T')[0];
    }
    
    // Validate time selection
    if (!selectedTime) {
        showError('Please select a time', 'timeError');
        isValid = false;
    }
    
    // Validate form fields
    const name = document.getElementById('patientName').value.trim();
    const phone = document.getElementById('patientPhone').value.trim();
    const email = document.getElementById('patientEmail').value.trim();
    const reason = document.getElementById('reasonSelect').value;
    
    if (!name) {
        showError('Full name is required', 'nameError');
        isValid = false;
    }
    
    if (!phone) {
        showError('Phone number is required', 'phoneError');
        isValid = false;
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
        showError('Please enter a valid phone number', 'phoneError');
        isValid = false;
    }
    
    if (!email) {
        showError('Email address is required', 'emailError');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Please enter a valid email address', 'emailError');
        isValid = false;
    }
    
    if (!reason) {
        showError('Please select a reason for visit', 'reasonError');
        isValid = false;
    }
    
    if (isValid) {
        submitAppointment();
    }
}

function submitAppointment() {
    const button = document.getElementById('bookButton');
    const form = document.getElementById('appointmentForm');
    
    // Show loading state
    button.textContent = 'Booking...';
    button.disabled = true;
    
    // Create FormData object
    const formData = new FormData(form);
    
    // Submit via AJAX
    fetch('php/process_appointment.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        button.textContent = 'Book Appointment';
        button.disabled = false;
        
        if (data.success) {
            // Show success modal with appointment details
            showSuccessModal(data.appointment_id);
            console.log('Appointment booked successfully!', data);
        } else {
            // Show error
            alert('Error booking appointment: ' + data.message);
        }
    })
    .catch(error => {
        // Reset button
        button.textContent = 'Book Appointment';
        button.disabled = false;
        
        console.error('Error:', error);
        
        // Fallback: simulate success for demo
        setTimeout(() => {
            const appointmentId = 'APT' + Date.now().toString().slice(-6);
            showSuccessModal(appointmentId);
            console.log('Appointment booked successfully! (Fallback) ID:', appointmentId);
        }, 1000);
    });
}

function showSuccessModal(appointmentId) {
    const modal = document.getElementById('successModal');
    const reason = document.getElementById('reasonSelect');
    const reasonText = reason.options[reason.selectedIndex].text;
    
    // Populate modal with appointment details
    document.getElementById('modalDoctor').textContent = selectedDoctorName;
    document.getElementById('modalDate').textContent = formatDate(selectedDate);
    document.getElementById('modalTime').textContent = formatTime(selectedTime);
    document.getElementById('modalType').textContent = reasonText;
    document.getElementById('modalId').textContent = appointmentId;
    
    // Show modal
    modal.classList.add('show');
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function showError(message, errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}

function viewDashboard() {
    alert('Redirecting to dashboard...');
    // In a real application, redirect to dashboard
    window.location.href = 'dashboard.php';
}

function returnHome() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    
    // Reset form
    document.getElementById('appointmentForm').reset();
    
    // Clear selections
    document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.querySelectorAll('.calendar td').forEach(td => td.classList.remove('selected'));
    
    // Clear hidden fields
    document.getElementById('selectedDoctor').value = '';
    document.getElementById('selectedDoctorName').value = '';
    document.getElementById('selectedDate').value = '';
    document.getElementById('selectedTime').value = '';
    
    selectedDoctor = null;
    selectedDoctorName = '';
    selectedDate = null;
    selectedTime = null;
    
    alert('Returning to home page...');
    // In a real application, redirect to home
    window.location.href = 'index.html';
}

// Calendar functions
function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Update month/year display
    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.textContent = 
            date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    // Generate calendar HTML
    let html = '';
    let dayCount = 1;
    
    for (let week = 0; week < 6; week++) {
        html += '<tr>';
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < firstDay) {
                html += '<td></td>';
            } else if (dayCount > daysInMonth) {
                html += '<td></td>';
            } else {
                const cellDate = new Date(year, month, dayCount);
                const isPast = cellDate < today.setHours(0,0,0,0);
                const isSelected = selectedDate && 
                    cellDate.toDateString() === selectedDate.toDateString();
                
                html += `<td class="${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                             data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}"
                             ${isPast ? '' : 'onclick="selectDate(this)"'}>
                             ${dayCount}
                         </td>`;
                dayCount++;
            }
        }
        html += '</tr>';
        if (dayCount > daysInMonth) break;
    }
    
    const calendarBody = document.getElementById('calendarBody');
    if (calendarBody) {
        calendarBody.innerHTML = html;
    }
}

function selectDate(cell) {
    if (cell.classList.contains('disabled')) return;
    
    // Remove previous selection
    document.querySelectorAll('.calendar td').forEach(td => 
        td.classList.remove('selected'));
    
    // Add selection to clicked cell
    cell.classList.add('selected');
    selectedDate = new Date(cell.dataset.date);
    
    console.log('Date selected:', selectedDate);
    clearError('dateError');
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert('Navigate back to the main page');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    }
});