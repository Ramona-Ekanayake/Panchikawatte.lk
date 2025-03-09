// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const createPostBtn = document.getElementById('createPostBtn');
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

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value,
        idNumber: document.getElementById('idNumber').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            closeModal(registerModal);
            openModal(loginModal);
        } else {
            const data = await response.json();
            alert(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
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
                const requestCard = document.createElement('div');
                requestCard.className = 'request-card';

                // Create image gallery if there are images
                let imageGallery = '';
                if (request.imageUrls && Object.keys(request.imageUrls).length > 0) {
                    imageGallery = `
                        <div class="request-images">
                            ${Object.entries(request.imageUrls).map(([view, url]) => `
                                <div class="request-image" data-view="${view}">
                                    <img src="${url}" alt="${view} view" onclick="showFullImage('${url}', '${view}')">
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                requestCard.innerHTML = `
                    <div class="request-header">
                        <h3>${request.partName}</h3>
                        <span class="category-badge">${request.partCategory}</span>
                    </div>
                    ${imageGallery}
                    <div class="vehicle-info">
                        <p><strong>Vehicle:</strong> ${request.vehicleModel}</p>
                        <p><strong>Part Number:</strong> ${request.partNumber}</p>
                    </div>
                    <div class="description">
                        <p>${request.description.substring(0, 150)}${request.description.length > 150 ? '...' : ''}</p>
                    </div>
                    <button class="see-more-btn" onclick="showPartDetails('${request.id}')">See More</button>
                    <div class="request-footer">
                        <span class="status-badge ${request.status}">${request.status}</span>
                        <button class="btn btn-primary" onclick="showQuoteModal('${request.id}')">
                            Submit Quote
                        </button>
                    </div>
                    ${request.quotes && request.quotes.length > 0 ? `
                        <div class="quotes-section">
                            <h4>Quotes (${request.quotes.length})</h4>
                            ${request.quotes.map(quote => `
                                <div class="quote-item">
                                    <span class="quote-price">${quote.currency} ${quote.price.toFixed(2)}</span>
                                    <span class="quote-condition ${quote.condition}">${quote.condition}</span>
                                    <p>${quote.notes}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
                requestsList.appendChild(requestCard);
            });
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Show part details modal
window.showPartDetails = async function(requestId) {
    try {
        const response = await fetch(`/api/parts/requests/${requestId}`);
        if (response.ok) {
            const data = await response.json();
            const request = data.data;
            
            const content = document.getElementById('partDetailsContent');
            content.innerHTML = `
                <div class="part-details-content">
                    <h2>${request.partName}</h2>
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
                    <button class="btn btn-primary" onclick="showQuoteModal('${request.id}')">
                        Submit Quote
                    </button>
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

// Initial setup
checkLoginState();
loadPartRequests(); 