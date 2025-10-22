// Global variables
let currentUser = null;
let token = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = '/';
        return;
    }

    currentUser = JSON.parse(userStr);

    // Update UI with user info
    document.getElementById('user-name').textContent = currentUser.name;
    const roleElement = document.getElementById('user-role');
    roleElement.textContent = currentUser.role.toUpperCase();
    roleElement.className = `badge badge-${currentUser.role}`;

    // Show staff management tab if manager
    if (currentUser.role === 'manager') {
        document.getElementById('staff-tab').style.display = 'block';
    }

    // Load initial data
    loadCustomers();
});

// API Helper function
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(endpoint, { ...defaultOptions, ...options });

    if (response.status === 401 || response.status === 403) {
        logout();
        return;
    }

    return response;
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load data for the tab
    switch(tabName) {
        case 'customers':
            loadCustomers();
            break;
        case 'punchcards':
            loadPunchcards();
            break;
        case 'redemptions':
            loadRedemptions();
            break;
        case 'staff':
            loadStaff();
            break;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Modal Functions
function showModal(modalId) {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById(modalId).classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// CUSTOMERS
async function loadCustomers() {
    try {
        const response = await apiCall('/api/customers');
        const customers = await response.json();

        const tbody = document.getElementById('customers-tbody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td><span class="badge badge-active">${customer.active_punchcards || 0}</span></td>
                <td>
                    <button onclick="viewCustomer(${customer.id})" class="btn btn-small btn-secondary">View</button>
                    <button onclick="addPunch(${customer.id})" class="btn btn-small btn-success">Add Punch</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Load customers error:', error);
    }
}

async function searchCustomers() {
    const query = document.getElementById('customer-search').value;
    if (!query) {
        loadCustomers();
        return;
    }

    try {
        const response = await apiCall(`/api/customers/search/${query}`);
        const customers = await response.json();

        const tbody = document.getElementById('customers-tbody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>-</td>
                <td>
                    <button onclick="viewCustomer(${customer.id})" class="btn btn-small btn-secondary">View</button>
                    <button onclick="addPunch(${customer.id})" class="btn btn-small btn-success">Add Punch</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Search customers error:', error);
    }
}

function showAddCustomerModal() {
    showModal('add-customer-modal');
}

document.getElementById('add-customer-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    try {
        const response = await apiCall('/api/customers', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            e.target.reset();
            loadCustomers();
            alert('Customer added successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add customer');
        }
    } catch (error) {
        console.error('Add customer error:', error);
        alert('An error occurred');
    }
});

async function viewCustomer(customerId) {
    try {
        const response = await apiCall(`/api/customers/${customerId}`);
        const customer = await response.json();

        const detailsHtml = `
            <div class="customer-details-grid">
                <div class="detail-item">
                    <label>Name</label>
                    <span>${customer.name}</span>
                </div>
                <div class="detail-item">
                    <label>Email</label>
                    <span>${customer.email || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Phone</label>
                    <span>${customer.phone || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Total Punchcards</label>
                    <span>${customer.total_punchcards || 0}</span>
                </div>
            </div>

            <h4>Punchcards</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Punches</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${customer.punchcards.map(pc => `
                        <tr>
                            <td>${pc.id}</td>
                            <td>${pc.punches}/${pc.max_punches}</td>
                            <td><span class="badge ${pc.is_redeemed ? 'badge-redeemed' : (pc.punches >= pc.max_punches ? 'badge-full' : 'badge-active')}">
                                ${pc.is_redeemed ? 'Redeemed' : (pc.punches >= pc.max_punches ? 'Full' : 'Active')}
                            </span></td>
                            <td>
                                ${!pc.is_redeemed && pc.punches >= pc.max_punches ?
                                    `<button onclick="showRedeemModal(${pc.id}, '${customer.name}')" class="btn btn-small btn-success">Redeem</button>` :
                                    '-'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('customer-details').innerHTML = detailsHtml;
        showModal('customer-details-modal');
    } catch (error) {
        console.error('View customer error:', error);
    }
}

async function addPunch(customerId) {
    if (!confirm('Add a punch to this customer\'s punchcard?')) {
        return;
    }

    try {
        const response = await apiCall(`/api/punchcards/punch/${customerId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message + (data.isFull ? ' - Punchcard is now full and ready for redemption!' : ''));
            loadCustomers();
        } else {
            alert(data.error || 'Failed to add punch');
        }
    } catch (error) {
        console.error('Add punch error:', error);
        alert('An error occurred');
    }
}

// PUNCHCARDS
async function loadPunchcards() {
    try {
        const response = await apiCall('/api/punchcards');
        const punchcards = await response.json();

        const tbody = document.getElementById('punchcards-tbody');
        tbody.innerHTML = '';

        punchcards.forEach(pc => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${pc.id}</td>
                <td>${pc.customer_name}</td>
                <td>
                    <div class="punchcard-progress">
                        ${Array.from({length: pc.max_punches}, (_, i) =>
                            `<div class="punch-dot ${i < pc.punches ? 'filled' : ''}"></div>`
                        ).join('')}
                        <span style="margin-left: 10px;">${pc.punches}/${pc.max_punches}</span>
                    </div>
                </td>
                <td><span class="badge ${pc.is_redeemed ? 'badge-redeemed' : (pc.punches >= pc.max_punches ? 'badge-full' : 'badge-active')}">
                    ${pc.is_redeemed ? 'Redeemed' : (pc.punches >= pc.max_punches ? 'Full' : 'Active')}
                </span></td>
                <td>
                    ${!pc.is_redeemed && pc.punches >= pc.max_punches ?
                        `<button onclick="showRedeemModal(${pc.id}, '${pc.customer_name}')" class="btn btn-small btn-success">Redeem</button>` :
                        '-'
                    }
                </td>
            `;
        });
    } catch (error) {
        console.error('Load punchcards error:', error);
    }
}

function showRedeemModal(punchcardId, customerName) {
    document.getElementById('redeem-punchcard-id').value = punchcardId;
    document.getElementById('redeem-customer-name').textContent = `Customer: ${customerName}`;
    showModal('redeem-modal');
}

document.getElementById('redeem-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const punchcardId = document.getElementById('redeem-punchcard-id').value;
    const formData = new FormData(e.target);
    const notes = formData.get('notes');

    try {
        const response = await apiCall(`/api/punchcards/redeem/${punchcardId}`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });

        const data = await response.json();

        if (response.ok) {
            closeModal();
            e.target.reset();
            alert(data.message);
            loadPunchcards();
            loadCustomers();
        } else {
            alert(data.error || 'Failed to redeem punchcard');
        }
    } catch (error) {
        console.error('Redeem punchcard error:', error);
        alert('An error occurred');
    }
});

// REDEMPTIONS
async function loadRedemptions() {
    try {
        const response = await apiCall('/api/punchcards/redemptions');
        const redemptions = await response.json();

        const tbody = document.getElementById('redemptions-tbody');
        tbody.innerHTML = '';

        redemptions.forEach(r => {
            const row = tbody.insertRow();
            const date = new Date(r.created_at).toLocaleString();
            row.innerHTML = `
                <td>${r.id}</td>
                <td>${r.customer_name}</td>
                <td>${r.redeemed_by_name}</td>
                <td>${date}</td>
                <td>${r.notes || '-'}</td>
            `;
        });
    } catch (error) {
        console.error('Load redemptions error:', error);
    }
}

// SHOPIFY SYNC
async function syncAllCustomers() {
    if (!confirm('This will sync all customers from Shopify. Continue?')) {
        return;
    }

    const resultDiv = document.getElementById('sync-result');
    resultDiv.textContent = 'Syncing...';
    resultDiv.className = 'sync-result';

    try {
        const response = await apiCall('/api/shopify/sync-all-customers', {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.textContent = `Success! Total: ${data.total}, Created: ${data.created}, Updated: ${data.updated}`;
            resultDiv.className = 'sync-result success-message';
            loadCustomers();
        } else {
            resultDiv.textContent = `Error: ${data.error}`;
            resultDiv.className = 'sync-result error-message';
        }
    } catch (error) {
        console.error('Sync error:', error);
        resultDiv.textContent = 'An error occurred';
        resultDiv.className = 'sync-result error-message';
    }
}

async function searchShopify() {
    const query = document.getElementById('shopify-search').value;
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    try {
        const response = await apiCall(`/api/shopify/search/${query}`);
        const customers = await response.json();

        const resultsDiv = document.getElementById('shopify-results');

        if (customers.length === 0) {
            resultsDiv.innerHTML = '<p>No customers found</p>';
            return;
        }

        resultsDiv.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Orders</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => `
                            <tr>
                                <td>${c.first_name} ${c.last_name}</td>
                                <td>${c.email}</td>
                                <td>${c.orders_count || 0}</td>
                                <td>
                                    <button onclick="syncShopifyCustomer(${c.id})" class="btn btn-small btn-primary">Sync</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Search Shopify error:', error);
    }
}

async function syncShopifyCustomer(shopifyCustomerId) {
    try {
        const response = await apiCall(`/api/shopify/sync-customer/${shopifyCustomerId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            loadCustomers();
        } else {
            alert(data.error || 'Sync failed');
        }
    } catch (error) {
        console.error('Sync customer error:', error);
        alert('An error occurred');
    }
}

// STAFF MANAGEMENT (Manager only)
async function loadStaff() {
    if (currentUser.role !== 'manager') {
        return;
    }

    try {
        const response = await apiCall('/api/staff');
        const staff = await response.json();

        const tbody = document.getElementById('staff-tbody');
        tbody.innerHTML = '';

        staff.forEach(s => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td><span class="badge badge-${s.role}">${s.role.toUpperCase()}</span></td>
                <td>
                    ${s.id !== currentUser.id ?
                        `<button onclick="deleteStaff(${s.id}, '${s.name}')" class="btn btn-small btn-danger">Delete</button>` :
                        '-'
                    }
                </td>
            `;
        });
    } catch (error) {
        console.error('Load staff error:', error);
    }
}

function showAddStaffModal() {
    showModal('add-staff-modal');
}

document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await apiCall('/api/staff', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            e.target.reset();
            loadStaff();
            alert('Staff member added successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add staff member');
        }
    } catch (error) {
        console.error('Add staff error:', error);
        alert('An error occurred');
    }
});

async function deleteStaff(staffId, staffName) {
    if (!confirm(`Are you sure you want to delete ${staffName}?`)) {
        return;
    }

    try {
        const response = await apiCall(`/api/staff/${staffId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Staff member deleted successfully');
            loadStaff();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete staff member');
        }
    } catch (error) {
        console.error('Delete staff error:', error);
        alert('An error occurred');
    }
}
