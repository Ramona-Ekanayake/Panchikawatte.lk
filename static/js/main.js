// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const createPostBtn = document.getElementById('createPostBtn');
const findPartsBtn = document.getElementById('findPartsBtn');
const becomeSupplierBtn = document.getElementById('becomeSupplierBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const newRequestModal = document.getElementById('newRequestModal');
const closeButtons = document.querySelectorAll('.close');
const verifyPhoneBtn = document.getElementById('verifyPhone');
const verificationCodeGroup = document.getElementById('verificationCodeGroup');
const submitCodeBtn = document.getElementById('submitCode');

// Vehicle data
const vehicleModels = {
    Toyota: [
        "Corolla",
        "Camry",
        "RAV4",
        "Land Cruiser",
        "Prado",
        "Hilux",
        "Vitz",
        "Aqua",
        "Premio",
        "Allion"
    ],
    Honda: [
        "Civic",
        "Accord",
        "CR-V",
        "Fit",
        "Vezel",
        "Grace",
        "Jazz",
        "City",
        "BR-V"
    ],
    Nissan: [
        "Sunny",
        "Sylphy",
        "X-Trail",
        "Qashqai",
        "Leaf",
        "Navara",
        "March",
        "Tiida"
    ],
    Suzuki: [
        "Swift",
        "Alto",
        "Wagon R",
        "Vitara",
        "Jimny",
        "Ciaz",
        "Spacia",
        "Every"
    ],
    Mitsubishi: [
        "Lancer",
        "Montero",
        "Outlander",
        "ASX",
        "L200",
        "Attrage",
        "Mirage"
    ],
    BMW: [
        "3 Series",
        "5 Series",
        "7 Series",
        "X1",
        "X3",
        "X5",
        "M3",
        "M5"
    ],
    Mercedes: [
        "C-Class",
        "E-Class",
        "S-Class",
        "GLA",
        "GLC",
        "GLE",
        "A-Class",
        "CLA"
    ],
    Audi: [
        "A3",
        "A4",
        "A6",
        "Q3",
        "Q5",
        "Q7",
        "TT",
        "RS"
    ],
    Mazda: [
        "Axela",
        "Demio",
        "CX-5",
        "CX-3",
        "Premacy",
        "BT-50",
        "3",
        "6"
    ],
    Hyundai: [
        "Elantra",
        "Tucson",
        "Santa Fe",
        "i10",
        "i20",
        "Accent",
        "Creta",
        "Kona"
    ],
    Kia: [
        "Rio",
        "Sportage",
        "Sorento",
        "Picanto",
        "Cerato",
        "Seltos",
        "Carnival"
    ]
};

// Part Categories and Names
const partCategories = {
    engine: [
        "Engine Block",
        "Cylinder Head",
        "Pistons",
        "Crankshaft",
        "Camshaft",
        "Timing Belt/Chain",
        "Oil Pump",
        "Engine Mounts",
        "Valves",
        "Gaskets",
        "Engine Bearings",
        "Connecting Rods",
        "Oil Pan",
        "Engine Control Module (ECM)"
    ],
    transmission: [
        "Gearbox",
        "Clutch Kit",
        "Flywheel",
        "Transmission Mount",
        "Gear Selector",
        "Transmission Control Module",
        "Torque Converter",
        "Differential",
        "CV Joints",
        "Drive Shaft"
    ],
    brakes: [
        "Brake Pads",
        "Brake Discs/Rotors",
        "Brake Calipers",
        "Brake Master Cylinder",
        "Brake Lines",
        "ABS Module",
        "Brake Booster",
        "Wheel Cylinders",
        "Brake Drums",
        "Handbrake Cable"
    ],
    suspension: [
        "Shock Absorbers",
        "Struts",
        "Coil Springs",
        "Control Arms",
        "Ball Joints",
        "Tie Rod Ends",
        "Steering Rack",
        "Sway Bar Links",
        "Wheel Bearings",
        "Power Steering Pump"
    ],
    electrical: [
        "Alternator",
        "Starter Motor",
        "Battery",
        "Ignition Coil",
        "Spark Plugs",
        "Fuse Box",
        "Wiring Harness",
        "Sensors",
        "Light Assemblies",
        "Window Regulators"
    ],
    body: [
        "Hood",
        "Doors",
        "Fenders",
        "Bumpers",
        "Side Mirrors",
        "Grille",
        "Windshield",
        "Body Panels",
        "Trunk/Boot Lid",
        "Window Glass"
    ],
    interior: [
        "Seats",
        "Dashboard",
        "Center Console",
        "Door Panels",
        "Carpet",
        "Headliner",
        "Steering Wheel",
        "Air Bags",
        "Seat Belts",
        "Interior Trim"
    ],
    ac: [
        "AC Compressor",
        "Condenser",
        "Evaporator",
        "Blower Motor",
        "AC Lines",
        "Heater Core",
        "AC Control Unit",
        "Expansion Valve",
        "Cabin Air Filter",
        "Temperature Sensor"
    ],
    fuel: [
        "Fuel Pump",
        "Fuel Injectors",
        "Fuel Tank",
        "Fuel Filter",
        "Fuel Lines",
        "Fuel Pressure Regulator",
        "Carburetor",
        "Fuel Rail",
        "Fuel Cap",
        "Fuel Gauge Sender"
    ],
    exhaust: [
        "Catalytic Converter",
        "Muffler",
        "Exhaust Manifold",
        "Exhaust Pipes",
        "O2 Sensors",
        "EGR Valve",
        "Heat Shields",
        "Exhaust Tips",
        "DPF Filter",
        "Resonator"
    ]
};

// User state with additional properties
let currentUser = {
    name: null,
    type: null,
    credits: 0,
    isSupplier: false
};

// Event listeners for auth
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkAuthStatus();
    
    // Existing event listeners...
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // Fetch user data
        fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            currentUser = data;
            updateUIForLoggedInUser();
            loadUserDashboard();
        })
        .catch(error => {
            console.error('Error:', error);
            handleLogout();
        });
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    
    // Show create post button only for customers
    document.getElementById('createPostBtn').style.display = 
        currentUser.type === 'customer' ? 'inline-block' : 'none';
    
    // Update welcome message with user type badge
    const userTypeText = currentUser.type === 'supplier' ? 'Supplier' : 'Customer';
    const userTypeBadgeClass = currentUser.type === 'supplier' ? 'supplier' : 'customer';
    document.getElementById('userName').innerHTML = `
        ${currentUser.name}
        <span class="user-type-badge ${userTypeBadgeClass}">${userTypeText}</span>
    `;

    // Show credit balance for customers only
    if (currentUser.type === 'customer') {
        const creditBalance = document.createElement('div');
        creditBalance.className = 'credit-balance';
        creditBalance.innerHTML = `
            Credits: <span class="amount">LKR ${currentUser.credits.toFixed(2)}</span>
        `;
        document.querySelector('.dashboard-header').appendChild(creditBalance);
    }

    // Show appropriate dashboard based on user type
    document.getElementById('userDashboard').style.display = 
        currentUser.type === 'customer' ? 'block' : 'none';
    document.getElementById('supplierDashboard').style.display = 
        currentUser.type === 'supplier' ? 'block' : 'none';
    
    if (currentUser.type === 'supplier') {
        loadSupplierDashboard();
    }
}

function loadUserDashboard() {
    // Fetch user's requests and offers
    const token = localStorage.getItem('token');
    
    Promise.all([
        fetch('/api/user/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/offers', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
    ])
    .then(([requestsResponse, offersResponse]) => 
        Promise.all([requestsResponse.json(), offersResponse.json()])
    )
    .then(([requestsData, offersData]) => {
        updateDashboardStats(requestsData, offersData);
        displayOffers(offersData.offers);
    })
    .catch(error => console.error('Error:', error));
}

function updateDashboardStats(requestsData, offersData) {
    document.getElementById('totalRequests').textContent = requestsData.activeRequests || 0;
    document.getElementById('totalOffers').textContent = offersData.newOffers || 0;
}

function displayOffers(offers) {
    const offersGrid = document.getElementById('offersGrid');
    offersGrid.innerHTML = '';

    offers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        offersGrid.appendChild(offerCard);
    });
}

function createOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    
    card.innerHTML = `
        <div class="offer-header">
            <h4>${offer.partName}</h4>
            <div class="offer-meta">
                <span>Request #${offer.requestId}</span>
                <span>${new Date(offer.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="offer-content">
            <div class="offer-price">
                ${offer.currency} ${offer.price.toLocaleString()}
            </div>
            <div class="offer-details">
                <p>Condition: ${offer.condition}</p>
                <p>${offer.notes}</p>
            </div>
            <div class="offer-supplier">
                <div class="supplier-info-blur">
                    <p>Supplier: ${offer.supplierName}</p>
                    <p>Location: ${offer.location}</p>
                    <p>Contact: ${offer.contactInfo}</p>
                </div>
                <div class="unlock-overlay">
                    <p>🔒 Supplier details are hidden</p>
                    <p>Subscribe to view complete information</p>
                    <button class="btn unlock-btn" onclick="handleUnlock('${offer.id}')">
                        Unlock for LKR ${offer.unlockPrice}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function handleUnlock(offerId) {
    if (!currentUser) {
        alert('Please login to view supplier information');
        openModal(loginModal);
        return;
    }

    if (currentUser.credits < 500) {
        alert('Insufficient credits. Please purchase credits to view supplier information.');
        document.getElementById('requestIdForPayment').value = offerId;
        openModal(document.getElementById('paymentModal'));
        return;
    }

    // Process the unlock with available credits
    processUnlock(offerId);
}

// Add credit package options
const creditPackages = [
    { id: 'basic', credits: 500, price: 500, description: 'Basic Package - 1 supplier unlock' },
    { id: 'standard', credits: 2500, price: 2000, description: 'Standard Package - 5 supplier unlocks (20% off)' },
    { id: 'premium', credits: 6000, price: 4000, description: 'Premium Package - 12 supplier unlocks (33% off)' }
];

// Update payment modal to show credit packages
function showPaymentModal(offerId) {
    const modal = document.getElementById('paymentModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="payment-info">
            <h3>Select Credit Package</h3>
            <div class="credit-packages">
                ${creditPackages.map(pkg => `
                    <div class="package-card" data-package-id="${pkg.id}">
                        <h4>${pkg.id.charAt(0).toUpperCase() + pkg.id.slice(1)} Package</h4>
                        <div class="package-credits">${pkg.credits} Credits</div>
                        <div class="package-price">LKR ${pkg.price.toLocaleString()}</div>
                        <p>${pkg.description}</p>
                        <button class="btn btn-primary select-package" data-package-id="${pkg.id}">
                            Select Package
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        <form id="paymentForm" style="display: none;">
            <input type="hidden" id="requestIdForPayment" value="${offerId}">
            <input type="hidden" id="selectedPackage">
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" required pattern="[0-9]{16}">
            </div>
            <div class="form-group">
                <label for="cardExpiry">Expiry Date</label>
                <input type="text" id="cardExpiry" required placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\/([0-9]{2})">
            </div>
            <div class="form-group">
                <label for="cardCvv">CVV</label>
                <input type="text" id="cardCvv" required pattern="[0-9]{3,4}">
            </div>
            <button type="submit" class="btn btn-primary">Complete Payment</button>
        </form>
    `;

    // Add event listeners for package selection
    modal.querySelectorAll('.select-package').forEach(button => {
        button.addEventListener('click', () => {
            const packageId = button.dataset.packageId;
            document.getElementById('selectedPackage').value = packageId;
            modal.querySelector('.credit-packages').style.display = 'none';
            modal.querySelector('#paymentForm').style.display = 'block';
        });
    });

    openModal(modal);
}

// Populate years (from 1990 to current year)
function populateYears() {
    const yearSelect = document.getElementById('vehicleYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1990; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Handle brand selection
document.getElementById('vehicleBrand').addEventListener('change', function() {
    const modelSelect = document.getElementById('vehicleModel');
    const brand = this.value;
    
    // Clear current options
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
    if (brand) {
        // Enable model select
        modelSelect.disabled = false;
        
        // Add models for selected brand
        vehicleModels[brand].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    } else {
        // Disable model select if no brand selected
        modelSelect.disabled = true;
    }
});

// Handle part category selection
document.getElementById('partCategory').addEventListener('change', function() {
    const partSelect = document.getElementById('partName');
    const category = this.value;
    
    // Clear current options
    partSelect.innerHTML = '<option value="">Select Part</option>';
    
    if (category) {
        // Enable part select
        partSelect.disabled = false;
        
        // Add parts for selected category
        partCategories[category].forEach(part => {
            const option = document.createElement('option');
            option.value = part;
            option.textContent = part;
            partSelect.appendChild(option);
        });
    } else {
        // Disable part select if no category selected
        partSelect.disabled = true;
    }
});

// Initialize year dropdown when modal opens
createPostBtn.addEventListener('click', () => {
    openModal(newRequestModal);
    populateYears();
});

// Check login state on page load
function checkLoginState() {
    const token = localStorage.getItem('token');
    if (token) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        createPostBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        createPostBtn.style.display = 'none';
    }
}

// Modal handling
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));
createPostBtn.addEventListener('click', () => openModal(newRequestModal));

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkLoginState();
    window.location.reload();
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Phone verification handling
verifyPhoneBtn.addEventListener('click', async () => {
    const phoneNumber = document.getElementById('phone').value;
    try {
        const response = await fetch('/api/verify-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
        });

        if (response.ok) {
            verificationCodeGroup.style.display = 'block';
            verifyPhoneBtn.disabled = true;
            alert('Mock verification code is: 123456');
        } else {
            alert('Failed to send verification code. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

submitCodeBtn.addEventListener('click', async () => {
    const code = document.getElementById('verificationCode').value;
    const phoneNumber = document.getElementById('phone').value;

    try {
        const response = await fetch('/api/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber, code }),
        });

        if (response.ok) {
            alert('Phone number verified successfully!');
            verificationCodeGroup.style.display = 'none';
            document.getElementById('phone').readOnly = true;
        } else {
            alert('Invalid verification code. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Form submissions
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.data.token);
            closeModal(loginModal);
            checkLoginState();
            window.location.reload();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Show/hide supplier fields based on user type selection
document.getElementById('userType').addEventListener('change', function() {
    const supplierFields = document.getElementById('supplierFields');
    if (this.value === 'supplier') {
        supplierFields.style.display = 'block';
        document.querySelectorAll('#supplierFields input, #supplierFields select').forEach(input => {
            input.required = true;
        });
    } else {
        supplierFields.style.display = 'none';
        document.querySelectorAll('#supplierFields input, #supplierFields select').forEach(input => {
            input.required = false;
        });
    }
});

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^(?:\+94|0)[1-9][0-9]{8}$/;
    return re.test(phone);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    let errorMessage = formGroup.querySelector('.error-message');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        formGroup.appendChild(errorMessage);
    }
    errorMessage.textContent = message;
}

function showSuccess(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Handle file uploads and previews
function handleFileUpload(input, previewId) {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showError(input, 'File size must be less than 5MB');
        input.value = '';
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showError(input, 'File must be PDF, JPG, or PNG');
        input.value = '';
        return;
    }

    // Create preview
    const preview = document.createElement('div');
    preview.className = 'document-preview';
    preview.innerHTML = `
        <img src="${file.type === 'application/pdf' ? '/static/images/pdf-icon.png' : URL.createObjectURL(file)}">
        <div class="document-info">
            <div>${file.name}</div>
            <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
        </div>
        <button type="button" class="remove-document">&times;</button>
    `;

    const container = document.getElementById(previewId);
    container.innerHTML = '';
    container.appendChild(preview);

    // Handle remove button
    preview.querySelector('.remove-document').addEventListener('click', () => {
        input.value = '';
        container.innerHTML = '';
    });

    showSuccess(input);
}

// Handle file input changes
document.getElementById('businessRegistrationDoc').addEventListener('change', function() {
    handleFileUpload(this, 'businessRegDocPreview');
});

document.getElementById('vatCertificate').addEventListener('change', function() {
    handleFileUpload(this, 'vatCertificatePreview');
});

// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add basic user information
    formData.append('userType', document.getElementById('userType').value);
    formData.append('fullName', document.getElementById('fullName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('password', document.getElementById('password').value);
    
    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Add supplier-specific information if registering as supplier
    if (document.getElementById('userType').value === 'supplier') {
        formData.append('businessName', document.getElementById('businessName').value);
        formData.append('businessRegNumber', document.getElementById('businessRegNumber').value);
        formData.append('vatNumber', document.getElementById('vatNumber').value);
        formData.append('businessAddress', document.getElementById('businessAddress').value);
        formData.append('district', document.getElementById('district').value);
        
        // Get selected specializations
        const specializations = [];
        document.querySelectorAll('input[name="specialization"]:checked').forEach(checkbox => {
            specializations.push(checkbox.value);
        });
        formData.append('specializations[]', specializations);
        
        // Add business registration document
        const businessRegDoc = document.getElementById('businessRegistrationDoc').files[0];
        if (businessRegDoc) {
            formData.append('businessRegistrationDoc', businessRegDoc);
        }
        
        // Add VAT certificate if provided
        const vatCertificate = document.getElementById('vatCertificate').files[0];
        if (vatCertificate) {
            formData.append('vatCertificate', vatCertificate);
        }
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please log in.', 'success');
            closeModal(document.getElementById('registerModal'));
            openModal(document.getElementById('loginModal'));
        } else {
            showMessage(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('An error occurred during registration. Please try again.', 'error');
    }
});

// Handle user type change
document.getElementById('userType').addEventListener('change', function(e) {
    const supplierFields = document.getElementById('supplierFields');
    if (e.target.value === 'supplier') {
        supplierFields.style.display = 'block';
    } else {
        supplierFields.style.display = 'none';
    }
});

// Handle image uploads for each view
const imageInputs = document.querySelectorAll('.image-upload-item input[type="file"]');
const imageViews = ['left', 'right', 'top', 'bottom'];
let uploadedImages = {};

imageInputs.forEach(input => {
    input.addEventListener('change', function(e) {
        const view = this.dataset.view;
        const file = e.target.files[0];
        const preview = document.getElementById(`${view}Preview`);
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="${view} view">`;
                uploadedImages[view] = file;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Update form submission to handle new image structure
document.getElementById('partRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to create a part request');
        return;
    }

    const formData = new FormData();
    formData.append('vehicleModel', document.getElementById('vehicleBrand').value + ' ' + 
                                  document.getElementById('vehicleModel').value + ' ' + 
                                  document.getElementById('vehicleYear').value);
    formData.append('chassisNumber', document.getElementById('chassisNumber').value);
    formData.append('partNumber', document.getElementById('partNumber').value);
    formData.append('partCategory', document.getElementById('partCategory').value);
    formData.append('partName', document.getElementById('partName').value);
    formData.append('description', document.getElementById('partDescription').value);

    // Append images with their views
    Object.entries(uploadedImages).forEach(([view, file]) => {
        formData.append(`image_${view}`, file);
    });

    try {
        const response = await fetch('/api/parts/request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (response.ok) {
            alert('Part request submitted successfully!');
            closeModal(newRequestModal);
            loadPartRequests();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit request. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Load part requests with new structure
async function loadPartRequests() {
    try {
        const response = await fetch('/api/parts/requests');
        if (response.ok) {
            const data = await response.json();
            const requests = data.data;
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';

            requests.forEach(request => {
                const requestCard = createRequestCard(request);
                requestsList.appendChild(requestCard);
            });
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        showMessage('Failed to load requests', 'error');
    }
}

// Update request status
async function updateRequestStatus(requestId, newStatus) {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please login to update request status', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/parts/requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                requestId: requestId,
                status: newStatus
            })
        });

        if (response.ok) {
            showMessage('Request status updated successfully', 'success');
            loadPartRequests(); // Refresh the requests list
        } else {
            const data = await response.json();
            showMessage(data.message || 'Failed to update request status', 'error');
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        showMessage('An error occurred while updating the status', 'error');
    }
}

// Update the request card to include status management
function createRequestCard(request) {
    const isAuthor = currentUser && currentUser.id === request.userId;
    const statusOptions = isAuthor ? `
        <div class="status-management ${request.status}">
            <label>Update Status:</label>
            <select onchange="updateRequestStatus('${request.id}', this.value)" class="status-select">
                <option value="open" ${request.status === 'open' ? 'selected' : ''}>Open</option>
                <option value="received_offer" ${request.status === 'received_offer' ? 'selected' : ''}>Received Offer</option>
                <option value="purchased" ${request.status === 'purchased' ? 'selected' : ''}>Purchased</option>
                <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
        </div>
    ` : '';

    // Update the loadPartRequests function to use the new status management
    const requestCard = document.createElement('div');
    requestCard.className = 'request-card';
    requestCard.innerHTML = `
        <div class="request-header">
            <h3>${request.partName}</h3>
            <span class="category-badge">${request.partCategory}</span>
        </div>
        <div class="request-meta">
            <span class="request-date">Posted: ${new Date(request.createdAt).toLocaleString()}</span>
            <span class="status-badge ${request.status}">${request.status.replace('_', ' ')}</span>
        </div>
        ${request.imageUrls ? `
            <div class="request-images">
                ${Object.entries(request.imageUrls).map(([view, url]) => `
                    <div class="request-image" data-view="${view}">
                        <img src="${url}" alt="${view} view" onclick="showFullImage('${url}', '${view}')">
                    </div>
                `).join('')}
            </div>
        ` : ''}
        <div class="vehicle-info">
            <p><strong>Vehicle:</strong> ${request.vehicleModel}</p>
            <p><strong>Part Number:</strong> ${request.partNumber}</p>
        </div>
        <div class="description">
            <p>${request.description}</p>
        </div>
        ${isAuthor ? statusOptions : ''}
        <div class="request-footer">
            ${currentUser && currentUser.type === 'supplier' && request.status === 'open' ? 
                `<button class="btn btn-primary" onclick="showQuoteModal('${request.id}')">Submit Quote</button>` : ''
            }
            <button class="btn btn-secondary" onclick="showPartDetails('${request.id}')">See More</button>
        </div>
    `;
    return requestCard;
}

// Show part details modal with appropriate visibility
window.showPartDetails = async function(requestId) {
    try {
        const response = await fetch(`/api/parts/requests/${requestId}`);
        if (response.ok) {
            const data = await response.json();
            const request = data.data;
            
            // Format the date and time
            const formattedDate = new Date(request.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            // Only show submit quote button for suppliers
            const submitQuoteButton = currentUser && currentUser.type === 'supplier' 
                ? `<button class="btn btn-primary" onclick="showQuoteModal('${request.id}')">Submit Quote</button>`
                : '';

            // Determine if the current user is the author
            const isAuthor = currentUser && currentUser.id === request.authorId;

            // Prepare quotes section based on user status
            let quotesSection = '';
            if (request.quotes && request.quotes.length > 0) {
                if (!currentUser) {
                    quotesSection = `<h4>${request.quotes.length} Quotes Received</h4>`;
                } else if (isAuthor) {
                    quotesSection = `
                        <div class="quotes-section">
                            <h4>Quotes (${request.quotes.length})</h4>
                            ${request.quotes.map(quote => `
                                <div class="quote-item">
                                    <div class="quote-header">
                                        <span class="quote-price">${quote.currency} ${quote.price.toFixed(2)}</span>
                                        <span class="quote-condition ${quote.condition}">${quote.condition}</span>
                                    </div>
                                    <div class="supplier-info ${quote.isUnlocked ? '' : 'supplier-info-blur'}">
                                        <p>Supplier: ${quote.supplierName}</p>
                                        <p>Location: ${quote.location}</p>
                                        <p>Contact: ${quote.contactInfo}</p>
                                        ${quote.notes ? `<p>Notes: ${quote.notes}</p>` : ''}
                                    </div>
                                    ${!quote.isUnlocked ? `
                                        <div class="unlock-overlay">
                                            <p>🔒 Supplier details are hidden</p>
                                            <p>Purchase credits to view complete information</p>
                                            <button class="btn unlock-btn" onclick="handleUnlock('${quote.id}')">
                                                Unlock for LKR 500
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    quotesSection = `<h4>${request.quotes.length} Quotes Received</h4>`;
                }
            }
            
            const content = document.getElementById('partDetailsContent');
            content.innerHTML = `
                <div class="part-details-content">
                    <h2>${request.partName}</h2>
                    <div class="request-meta">
                        <span class="request-date">Posted: ${formattedDate}</span>
                    </div>
                    <div class="part-details-images">
                        ${Object.entries(request.imageUrls).map(([view, url]) => `
                            <div class="request-image" data-view="${view}">
                                <img src="${url}" alt="${view} view" onclick="showFullImage('${url}', '${view}')">
                            </div>
                        `).join('')}
                    </div>
                    <div class="part-details-info">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Vehicle Model</label>
                                <p>${request.vehicleModel}</p>
                            </div>
                            <div class="info-item">
                                <label>Chassis Number</label>
                                <p>${request.chassisNumber}</p>
                            </div>
                            <div class="info-item">
                                <label>Part Number</label>
                                <p>${request.partNumber}</p>
                            </div>
                            <div class="info-item">
                                <label>Category</label>
                                <p>${request.partCategory}</p>
                            </div>
                        </div>
                        <h3>Description</h3>
                        <p>${request.description}</p>
                    </div>
                    ${submitQuoteButton}
                    ${quotesSection}
                </div>
            `;
            openModal(document.getElementById('partDetailsModal'));
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Show quote modal
window.showQuoteModal = function(requestId) {
    if (!currentUser) {
        alert('Please login to submit a quote');
        openModal(loginModal);
        return;
    }

    if (currentUser.type !== 'supplier') {
        alert('Only registered suppliers can submit quotes');
        return;
    }

    document.getElementById('requestId').value = requestId;
    openModal(document.getElementById('quoteModal'));
};

// Handle quote submission
document.getElementById('quoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to submit a quote');
        return;
    }

    const requestId = document.getElementById('requestId').value;
    const formData = {
        requestId,
        price: parseFloat(document.getElementById('price').value),
        currency: document.getElementById('currency').value,
        condition: document.getElementById('condition').value,
        notes: document.getElementById('notes').value
    };

    try {
        const response = await fetch('/api/parts/quotes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Quote submitted successfully!');
            closeModal(document.getElementById('quoteModal'));
            loadPartRequests();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit quote. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Image viewer with view label
window.showFullImage = function(url, view) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    viewer.innerHTML = `
        <div class="viewer-content">
            <img src="${url}" alt="${view} view">
            <span class="image-view-label">${view} view</span>
            <button class="close-viewer">×</button>
        </div>
    `;
    document.body.appendChild(viewer);

    viewer.addEventListener('click', function(e) {
        if (e.target === viewer || e.target.className === 'close-viewer') {
            viewer.remove();
        }
    });
};

// Event listeners for hero buttons
findPartsBtn.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        openModal(loginModal);
        return;
    }
    
    if (currentUser.type === 'supplier') {
        alert('Suppliers cannot create part requests. You can only submit quotes for existing requests.');
        return;
    }
    
    openModal(newRequestModal);
    populateYears();
});

becomeSupplierBtn.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        openModal(registerModal);
    } else {
        // Redirect to supplier dashboard or show supplier registration modal
        alert('Supplier registration coming soon!');
    }
});

// Initial setup
checkLoginState();
loadPartRequests();

// Process payment and unlock supplier information
document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const packageId = document.getElementById('selectedPackage').value;
    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    
    try {
        const response = await fetch('/api/purchase-credits', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                packageId,
                amount: selectedPackage.price,
                credits: selectedPackage.credits,
                cardNumber: document.getElementById('cardNumber').value,
                cardExpiry: document.getElementById('cardExpiry').value,
                cardCvv: document.getElementById('cardCvv').value
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser.credits = data.newBalance;
            updateUIForLoggedInUser();
            closeModal(document.getElementById('paymentModal'));
            alert(`Successfully purchased ${selectedPackage.credits} credits!`);
        } else {
            alert('Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

async function processUnlock(offerId) {
    try {
        const response = await fetch(`/api/unlock-supplier/${offerId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser.credits = data.newBalance;
            updateUIForLoggedInUser();
            
            // Update the offer card to show supplier information
            const offerCard = document.querySelector(`[data-offer-id="${offerId}"]`);
            if (offerCard) {
                const supplierInfo = offerCard.querySelector('.supplier-info-blur');
                const unlockOverlay = offerCard.querySelector('.unlock-overlay');
                
                supplierInfo.style.filter = 'none';
                unlockOverlay.style.display = 'none';
            }
        } else {
            alert('Failed to unlock supplier information. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Handle unlocking supplier information
async function handleUnlock(quoteId) {
    if (!currentUser) {
        showMessage('Please log in to unlock supplier information', 'error');
        return;
    }

    if (currentUser.credits < 500) {
        // Show payment modal if user doesn't have enough credits
        showPaymentModal();
        return;
    }

    try {
        const response = await fetch(`/api/quotes/${quoteId}/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                credits: 500
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Update user credits
            currentUser.credits -= 500;
            updateCreditDisplay();
            // Refresh the requests to show unlocked supplier info
            loadPartRequests();
            showMessage('Supplier information unlocked successfully!', 'success');
        } else {
            showMessage('Failed to unlock supplier information. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error unlocking supplier information:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Update credit display
function updateCreditDisplay() {
    const creditDisplay = document.getElementById('creditBalance');
    if (creditDisplay) {
        creditDisplay.textContent = `Credits: ${currentUser.credits} LKR`;
    }
}

// Show payment modal
function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Purchase Credits</h2>
                <span class="close" onclick="closeModal(this.closest('.modal'))">&times;</span>
            </div>
            <div class="modal-body">
                <p>You need 500 LKR credits to unlock supplier information.</p>
                <form id="paymentForm" onsubmit="handlePayment(event)">
                    <div class="form-group">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" required pattern="[0-9]{16}" placeholder="1234 5678 9012 3456">
                    </div>
                    <div class="form-group">
                        <label for="expiryDate">Expiry Date</label>
                        <input type="text" id="expiryDate" required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" placeholder="MM/YY">
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" required pattern="[0-9]{3,4}" placeholder="123">
                    </div>
                    <button type="submit" class="btn btn-primary">Pay 500 LKR</button>
                </form>
            </div>
        </div>
    `;
    openModal(modal);
}

// Handle payment submission
async function handlePayment(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    try {
        const response = await fetch('/api/credits/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: 500,
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser.credits += 500;
            updateCreditDisplay();
            closeModal(document.getElementById('paymentModal'));
            showMessage('Credits purchased successfully!', 'success');
            // Refresh the requests to show unlocked supplier info
            loadPartRequests();
        } else {
            showMessage('Payment failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

// Show notification message
function showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
} 