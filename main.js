// enrollment.js
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
  const enrollmentForm = document.getElementById('enrollmentForm');
  
  if (!enrollmentForm) return; // Skip if no enrollment form on page

  // Show initial step
  updateStepDisplay();

  // Form submission
  enrollmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmission();
  });

  // Format Medicare Number dynamically
  document.addEventListener('input', (e) => {
    if (e.target.name === 'medicareNumber') {
      let value = e.target.value.replace(/\s/g, '');
      if (value.length > 10) value = value.substring(0, 10);
      if (value.length > 4) value = value.substring(0, 4) + ' ' + value.substring(4);
      e.target.value = value;
    }
  });
});

// Update step display and progress
function updateStepDisplay() {
  const progressFill = document.getElementById('progressFill');
  const progressPercentage = (currentStep / totalSteps) * 100;
  progressFill.style.width = progressPercentage + '%';

  const stepDescription = document.getElementById('step-description');
  const descriptions = {
    1: 'Step 1 of 3: Complete your registration',
    2: 'Step 2 of 3: Provide contact information',
    3: 'Step 3 of 3: Medical history details'
  };
  stepDescription.textContent = descriptions[currentStep];

  const labels = ['step1Label', 'step2Label', 'step3Label'];
  labels.forEach((labelId, index) => {
    const label = document.getElementById(labelId);
    if (label) label.classList.toggle('active', index + 1 <= currentStep);
  });

  // Show current step, hide others
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`step${i}`);
    if (stepEl) stepEl.style.display = (i === currentStep) ? 'block' : 'none';
  }
}

// Navigate to next step
function nextStep() {
  if (validateCurrentStep() && currentStep < totalSteps) {
    currentStep++;
    updateStepDisplay();
  }
}

// Navigate to previous step
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

// Reset to step 1
function resetToStep1() {
  currentStep = 1;
  updateStepDisplay();
}

// Validate current step fields
function validateCurrentStep() {
  const currentStepElement = document.getElementById(`step${currentStep}`);
  if (!currentStepElement) return false;

  const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#EF4444'; // red for error
      isValid = false;
    } else {
      field.style.borderColor = '#E5E7EB'; // normal border
    }
  });

  if (!isValid) alert('Please fill in all required fields before continuing.');
  return isValid;
}

// Handle form submission
function handleFormSubmission() {
  if (!validateCurrentStep()) return;

  const formData = new FormData(document.getElementById('enrollmentForm'));
  const data = Object.fromEntries(formData.entries());
  console.log('Form submitted with data:', data);

  alert('Registration completed successfully! Welcome to Pakenham Hospital.');
  resetToStep1();
}
