// patient-enrolment.js
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4;
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('enrollmentForm');
    const successModal = document.getElementById('successModal');

    // Initialize form
    showStep(currentStep);

    // Next button event
    nextBtn.addEventListener('click', function() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    // Previous button event
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Form submission event
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateCurrentStep()) {
            // Show loading state
            submitBtn.textContent = 'Processing...';
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Prepare form data
            const formData = new FormData(form);
            
            // Log form data for debugging
            console.log('Submitting form with data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Send AJAX request to PHP
            fetch('process-enrollment.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Reset button state
                submitBtn.textContent = 'Complete Enrollment';
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                console.log('Server response:', data);
                
                if (!successModal) {
                    console.error('Success modal element not found in the DOM');
                    showNotification('Error: Success modal not found. Please contact support.', 'error');
                    return;
                }

                if (data.success) {
                    console.log('Enrollment successful, showing success modal');
                    showSuccessModal();
                    showNotification('Enrollment completed successfully!', 'success');
                } else {
                    console.error('Enrollment failed:', data.message, data.errors || []);
                    showNotification(data.message || 'Enrollment failed. Please check the form and try again.', 'error');
                    // Highlight fields with errors
                    if (data.errors && Array.isArray(data.errors)) {
                        data.errors.forEach(error => {
                            const fieldName = error.field || '';
                            const field = form.querySelector(`[name="${fieldName}"]`);
                            if (field) {
                                const formGroup = field.closest('.form-group') || field.closest('.consent-group');
                                formGroup.classList.add('error');
                                showFieldError(field, error.message);
                            }
                        });
                    }
                }
            })
            .catch(error => {
                // Reset button state
                submitBtn.textContent = 'Complete Enrollment';
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                console.error('Fetch error:', error);
                showNotification('A network or server error occurred. Please try again later.', 'error');
            });
        } else {
            console.log('Client-side validation failed on step', currentStep);
            showNotification('Please correct the errors in the form before submitting.', 'error');
        }
    });

    function showStep(step) {
        const steps = document.querySelectorAll('.form-step');
        const stepIndicators = document.querySelectorAll('.step');
        
        steps.forEach(s => s.classList.remove('active'));
        stepIndicators.forEach(s => {
            s.classList.remove('active', 'completed');
        });

        const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
        const currentStepIndicator = document.querySelector(`.step[data-step="${step}"]`);
        if (currentFormStep) {
            currentFormStep.classList.add('active');
        }
        if (currentStepIndicator) {
            currentStepIndicator.classList.add('active');
        }

        stepIndicators.forEach((indicator, index) => {
            if (index + 1 < step) {
                indicator.classList.add('completed');
            }
        });

        prevBtn.style.display = step === 1 ? 'none' : 'block';
        nextBtn.style.display = step === totalSteps ? 'none' : 'block';
        submitBtn.style.display = step === totalSteps ? 'block' : 'none';

        currentFormStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateCurrentStep() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const requiredInputs = currentFormStep.querySelectorAll('input[required], select[required]');
        let isValid = true;

        currentFormStep.querySelectorAll('.form-group, .consent-group').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        requiredInputs.forEach(input => {
            if (!validateField(input)) {
                const formGroup = input.closest('.form-group') || input.closest('.consent-group');
                formGroup.classList.add('error');
                isValid = false;
            }
        });

        if (currentStep === 1) {
            isValid = validateStep1() && isValid;
        } else if (currentStep === 4) {
            isValid = validateStep4() && isValid;
        }

        if (!isValid) {
            showNotification('Please fill in all required fields correctly.', 'error');
        }

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;

        if (field.hasAttribute('required') && !value) {
            if (type !== 'checkbox') {
                showFieldError(field, 'This field is required');
                return false;
            }
        }

        if (type === 'checkbox' && field.hasAttribute('required')) {
            if (!field.checked) {
                showFieldError(field, 'This consent is required');
                return false;
            }
        }

        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        if (type === 'date' && value) {
            const date = new Date(value);
            const today = new Date();
            const minAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
            if (date > today) {
                showFieldError(field, 'Date cannot be in the future');
                return false;
            }
            if (date < minAge) {
                showFieldError(field, 'Please enter a valid date');
                return false;
            }
        }

        return true;
    }

    function validateStep1() {
        let isValid = true;
        
        const postcode = document.getElementById('postcode');
        if (postcode.value && !/^[0-9]{4}$/.test(postcode.value)) {
            showFieldError(postcode, 'Please enter a valid 4-digit postcode');
            postcode.closest('.form-group').classList.add('error');
            isValid = false;
        }

        const medicare = document.getElementById('medicare');
        if (medicare.value && !/^[0-9]{4}\s?[0-9]{5}\s?[0-9]$/.test(medicare.value)) {
            showFieldError(medicare, 'Please enter a valid Medicare number (1234 56789 0)');
            medicare.closest('.form-group').classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    function validateStep4() {
        let isValid = true;
        
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');

        if (username.value && username.value.length < 3) {
            showFieldError(username, 'Username must be at least 3 characters long');
            username.closest('.form-group').classList.add('error');
            isValid = false;
        }

        if (password.value) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password.value)) {
                showFieldError(password, 'Password must be at least 8 characters with uppercase, lowercase, and number');
                password.closest('.form-group').classList.add('error');
                isValid = false;
            }
        }

        if (confirmPassword.value !== password.value) {
            showFieldError(confirmPassword, 'Passwords do not match');
            confirmPassword.closest('.form-group').classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group') || field.closest('.consent-group');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `⚠️ ${message}`;
        
        formGroup.appendChild(errorDiv);
    }

    function showSuccessModal() {
        if (!successModal) {
            console.error('Success modal not found');
            showNotification('Error: Success modal not found. Please contact support.', 'error');
            return;
        }
        successModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Success modal displayed');
    }

    function closeSuccessModal() {
        if (!successModal) return;
        successModal.classList.remove('show');
        document.body.style.overflow = '';
        console.log('Success modal closed');
    }

    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 12px;
            color: white;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F8EF7'};
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            min-width: 300px;
            max-width: 400px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;

        notification.querySelector('.notification-icon').style.cssText = `
            font-weight: bold;
            font-size: 1.1rem;
        `;

        notification.querySelector('.notification-message').style.cssText = `
            flex: 1;
            font-weight: 500;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => { 
            notification.style.transform = 'translateX(0)'; 
        }, 100);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.8';
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 7000); // Extended to 7s for better visibility
    }

    // Real-time validation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() || this.hasAttribute('required')) {
                validateField(this);
            }
        });

        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group') || this.closest('.consent-group');
            formGroup.classList.remove('error');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    });

    // Medicare number formatting
    document.getElementById('medicare').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length && i < 10; i++) {
            if (i === 4 || i === 9) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    });

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('61')) {
                value = value.substring(2);
            }
            if (value.startsWith('0')) {
                value = value.substring(1);
            }
            
            if (value.length >= 9) {
                if (value.startsWith('4')) {
                    e.target.value = `04${value.substring(1, 3)} ${value.substring(3, 6)} ${value.substring(6, 9)}`;
                } else if (value.length >= 8) {
                    e.target.value = `0${value.substring(0, 1)} ${value.substring(1, 5)} ${value.substring(5, 9)}`;
                }
            }
        });
    });

    // Auto-fill city based on postcode
    document.getElementById('postcode').addEventListener('blur', function() {
        const postcode = this.value;
        const cityField = document.getElementById('city');
        
        const postcodeMap = {
            '3810': 'Pakenham',
            '3000': 'Melbourne',
            '3141': 'South Yarra',
            '3182': 'St Kilda',
            '3006': 'Southbank',
            '2000': 'Sydney',
            '4000': 'Brisbane',
            '5000': 'Adelaide',
            '6000': 'Perth',
            '7000': 'Hobart'
        };
        
        if (postcodeMap[postcode] && !cityField.value) {
            cityField.value = postcodeMap[postcode];
            cityField.classList.add('success');
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal.classList.contains('show')) {
            closeSuccessModal();
        }
    });

    // Prevent form submission on Enter key
    form.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
            e.preventDefault();
            
            if (currentStep === totalSteps && validateCurrentStep()) {
                form.dispatchEvent(new Event('submit'));
            } else if (currentStep < totalSteps && validateCurrentStep()) {
                nextBtn.click();
            }
        }
    });

    console.log('Patient enrollment form initialized successfully');
});