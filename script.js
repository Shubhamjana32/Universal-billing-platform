// --- Local Storage Keys ---
const BUSINESS_KEY = 'billing_app_business_setup';
const PRODUCTS_KEY = 'billing_app_products';
const PASSWORD_KEY = 'billing_app_secret_password'; // Key for Password
const BILLING_HISTORY_KEY = 'billing_app_history'; // Key for History

// --- State Variables ---
let businessData = null;
let currentBillItems = []; // Items currently added to the bill
let availableProducts = []; // Products loaded from Local Storage
let isHistoryLoggedIn = false; // Tracking history/report login status

// --- Utility Functions (Local Storage) ---

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Failed to load data from Local Storage:", e);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error("Failed to save data to Local Storage:", e);
        showMessage("Could not save data. Check if browser storage is blocked.", 'error');
        return false;
    }
}
 
// --- UI Message and Loading Functions ---

function showMessage(message, type = 'info', targetId = 'status-message') {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    
    target.classList.remove('hidden', 'bg-red-900', 'text-red-300', 'bg-emerald-900', 'text-emerald-300', 'bg-blue-900', 'text-blue-300');
    target.innerHTML = `<p>${message}</p>`;
    
    if (type === 'success') {
        target.classList.add('bg-emerald-900', 'text-emerald-300');
    } else if (type === 'error') {
        target.classList.add('bg-red-900', 'text-red-300');
    } else {
        target.classList.add('bg-blue-900', 'text-blue-300');
    }
    target.classList.remove('hidden');
    
    // Auto hide message after 5 seconds
    setTimeout(() => {
        target.classList.add('hidden');
    }, 5000);
}

function toggleLoading(isLoading, targetId = 'loading-indicator', buttonId = 'setup-submit-button') {
    const loadingIndicator = document.getElementById(targetId);
    const submitButton = document.getElementById(buttonId);

    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('opacity-50');
            }
        } else {
            loadingIndicator.classList.add('hidden');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('opacity-50');
            }
        }
    }
}
 
// --- Initialization and Setup Check ---

function loadProducts() {
    availableProducts = loadFromLocalStorage(PRODUCTS_KEY) || [];
    return availableProducts;
}

function checkExistingSetup() {
    toggleLoading(true, 'loading-indicator-setup');
    
    businessData = loadFromLocalStorage(BUSINESS_KEY);
    loadProducts(); // Load products

    if (businessData) {
        // If setup data exists, switch to app mode
        renderApp(true);
        document.getElementById('business-name-display').textContent = businessData.businessName;
        renderProductsList();
    } else {
        // If no setup data exists, show the setup form
        renderApp(false);
        showMessage("Please set up your business information and password.", 'info', 'status-message-setup');
    }
    toggleLoading(false, 'loading-indicator-setup');
}
 
// Setup Form Submit Handler
function handleSetupSubmit(e) {
    e.preventDefault();
    
    toggleLoading(true, 'loading-indicator-setup', 'setup-submit-button');
    showMessage('Saving data...', 'info', 'status-message-setup');

    const setupPassword = document.getElementById('setupPassword').value.trim();
    const formData = {
        businessName: document.getElementById('businessName').value.trim(),
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        email: document.getElementById('email').value.trim() || null,
        timestamp: new Date().toISOString()
    };

    try {
        if (!formData.businessName || !formData.address || !setupPassword) {
            throw new Error("Please fill in the Business Name, Address, and set a Password.");
        }
        
        // Save Business Data
        let isSaved = saveToLocalStorage(BUSINESS_KEY, formData); 
        // Save Password
        isSaved = isSaved && saveToLocalStorage(PASSWORD_KEY, setupPassword); 
        
        if (isSaved) {
            showMessage("Setup saved successfully! Loading app...", 'success', 'status-message-setup');
            // Reload the entire app upon successful save
            setTimeout(checkExistingSetup, 1000); // Wait briefly for UI update
        }
        
    } catch (error) {
        console.error("Error saving data:", error);
        showMessage(`Save failed: ${error.message}`, 'error', 'status-message-setup');
        toggleLoading(false, 'loading-indicator-setup', 'setup-submit-button');
    }
}

// --- Event Listener Setup ---
 
function setupEventListeners() {
    // Setup Form Listener
    const setupForm = document.getElementById('setup-form');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetupSubmit);
    }

    // Other event listeners setup
    const productForm = document.getElementById('product-form');
    if (productForm) productForm.addEventListener('submit', handleAddProduct);
    
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) addItemForm.addEventListener('submit', handleAddItemToBill);
    
    const finalizeBillBtn = document.getElementById('finalize-bill-btn');
    if (finalizeBillBtn) finalizeBillBtn.addEventListener('click', handleFinalizeAndPrint);
    
    const clearBillBtn = document.getElementById('clear-bill-btn');
    if (clearBillBtn) clearBillBtn.addEventListener('click', startNewBill);
    
    // History Login Listener
    const historyLoginForm = document.getElementById('history-login-form');
    if (historyLoginForm) historyLoginForm.addEventListener('submit', handleHistoryLogin);

    // Report Login Listener
    const reportLoginForm = document.getElementById('report-login-form');
    if (reportLoginForm) reportLoginForm.addEventListener('submit', handleHistoryLogin);
    
    // Logout Listener
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // History Clear Button is handled via inline onclick="clearAllHistory()"
}


// --- App Interface Logic ---

function renderApp(isSetupDone) {
    const setupPage = document.getElementById('setup-page');
    const appPage = document.getElementById('app-page');
    
    if (isSetupDone) {
        setupPage.classList.add('hidden');
        appPage.classList.remove('hidden');
        navigateTo('create-bill'); // Default to bill creation
    } else {
        // Clear all setup form fields if returning to setup page
        const setupForm = document.getElementById('setup-form');
        if (setupForm) setupForm.reset();
        
        appPage.classList.add('hidden');
        setupPage.classList.remove('hidden');
    }
}

// Navigation (Page Routing)
window.navigateTo = function(pageId) {
    document.querySelectorAll('.app-page-view').forEach(page => {
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
         targetPage.classList.remove('hidden');
    }

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active-link');
        link.classList.add('text-gray-300', 'hover:bg-[#2a3440]');
    });
    const activeLink = document.getElementById(`nav-${pageId}`);
    if (activeLink) {
        activeLink.classList.add('active-link');
        activeLink.classList.remove('text-gray-300', 'hover:bg-[#2a3440]');
    }
    
    // Extra tasks for specific pages
    if (pageId === 'product-management') {
        renderProductsList();
    } else if (pageId === 'create-bill') {
        populateProductDropdown();
        renderBillItems(); // Render list when creating a bill
        const billDateElement = document.getElementById('bill-date');
        if (billDateElement) billDateElement.textContent = new Date().toLocaleDateString('en-US');
    } else if (pageId === 'billing-history') {
        checkHistoryAccess(renderBillingHistory);
    } else if (pageId === 'sales-report') {
        checkHistoryAccess(renderSalesReport);
    }
}
 
// --- Password Protection Logic for History & Reports ---
 
function checkHistoryAccess(onSuccessCallback) {
    // Determine the current page context to correctly identify view/login elements
    const currentPageId = document.querySelector('.app-page-view:not(.hidden)').id;
    let viewId, loginId;
    
    if (currentPageId === 'billing-history') {
        viewId = 'history-view';
        loginId = 'history-login';
    } else if (currentPageId === 'sales-report') {
        viewId = 'report-view';
        loginId = 'report-login';
    } else {
        return;
    }
    
    const viewElement = document.getElementById(viewId);
    const loginElement = document.getElementById(loginId);
    
    if (!viewElement || !loginElement) return;

    // Check if user is already logged in for this session
    if (isHistoryLoggedIn) {
        loginElement.classList.add('hidden');
        viewElement.classList.remove('hidden');
        if (onSuccessCallback) onSuccessCallback(); 
    } else {
        // Show login screen
        viewElement.classList.add('hidden');
        loginElement.classList.remove('hidden');
        
        // Clear the specific password input field for the current page
        const passwordInputId = (currentPageId === 'billing-history') ? 'history-password' : 'history-password-report';
        const passwordInput = document.getElementById(passwordInputId);
        if (passwordInput) passwordInput.value = ''; 
    }
}
 
function handleHistoryLogin(e) {
    e.preventDefault();
    
    // Determine the current page context
    const targetPage = document.querySelector('.app-page-view:not(.hidden)').id;
    
    let inputId, statusId, viewId, loginId, renderCallback;
    
    if (targetPage === 'billing-history') {
        inputId = 'history-password';
        statusId = 'history-status-message';
        viewId = 'history-view';
        loginId = 'history-login';
        renderCallback = renderBillingHistory;
    } else if (targetPage === 'sales-report') {
        // Use the ID specific to the sales report login form
        inputId = 'history-password-report'; 
        statusId = 'report-status-message';
        viewId = 'report-view';
        loginId = 'report-login';
        renderCallback = renderSalesReport; // Crucial: Calls the report rendering function
    } else {
        return;
    }
    
    const inputPassword = document.getElementById(inputId).value.trim();
    const savedPassword = loadFromLocalStorage(PASSWORD_KEY);

    if (inputPassword === savedPassword && savedPassword !== null) {
        isHistoryLoggedIn = true;
        showMessage("Login Successful! Loading data...", 'success', statusId);
        
        // Hide Login, Show View
        document.getElementById(loginId).classList.add('hidden');
        document.getElementById(viewId).classList.remove('hidden');
        
        if (renderCallback) renderCallback();
        
    } else {
        showMessage("Login Failed: Incorrect Password or Setup Data Missing.", 'error', statusId);
        isHistoryLoggedIn = false;
    }
}
 
// --- PERMANENT LOGOUT FUNCTION (REVISED to clear ALL data) ---
function handleLogout() {
    const confirmLogout = window.confirm("WARNING: This action will permanently clear ALL Business Setup data (Name, Address, Password), ALL Product List data, and ALL Bill History from this browser. Are you sure you want to proceed?");
    if (!confirmLogout) return;

    // 1. Clear ALL critical data from Local Storage (This is the key change)
    localStorage.removeItem(BUSINESS_KEY);
    localStorage.removeItem(PASSWORD_KEY); 
    localStorage.removeItem(PRODUCTS_KEY);     
    localStorage.removeItem(BILLING_HISTORY_KEY); 
    
    // 2. Reset in-memory state
    isHistoryLoggedIn = false;
    businessData = null; 
    availableProducts = []; 
    currentBillItems = []; 

    // 3. Reset UI and force user back to the setup page
    renderApp(false); // Show the setup form again
    
    // 4. Force a clean check and navigation
    checkExistingSetup(); 
    
    // Clear history and report views to ensure they show login
    const historyView = document.getElementById('history-view');
    const historyLogin = document.getElementById('history-login');
    const reportView = document.getElementById('report-view');
    const reportLogin = document.getElementById('report-login');

    if (historyView) historyView.classList.add('hidden');
    if (historyLogin) historyLogin.classList.remove('hidden');
    if (reportView) reportView.classList.add('hidden');
    if (reportLogin) reportLogin.classList.remove('hidden');
    
    showMessage("You have been permanently logged out. All data has been cleared from Local Storage. Please re-enter your business setup details to continue.", 'info', 'status-message-setup');
}


// --- Product Management Logic ---
function renderProductsList() {
    const products = loadProducts();
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    productsList.innerHTML = ''; 

    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500 p-4">No products have been added yet.</td></tr>';
        return;
    }
    
    let listHTML = '';
    let index = 1;
    products.forEach(product => {
        listHTML += `
            <tr class="border-b border-gray-700 hover:bg-[#2a3440] transition duration-150">
                <td class="py-3 px-4 text-sm font-medium text-gray-300">${index++}</td>
                <td class="py-3 px-4 text-sm font-medium text-cyan-400">${product.name}</td>
                <td class="py-3 px-4 text-sm text-gray-300">₹ ${parseFloat(product.price).toFixed(2)}</td>
                <td class="py-3 px-4 text-sm text-gray-300">${product.unit}</td>
            </tr>
        `;
    });
    productsList.innerHTML = listHTML;
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const productStatus = document.getElementById('product-status-message');
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const unitInput = document.getElementById('product-unit');
    const productForm = document.getElementById('product-form');

    if (!productForm || !nameInput || !priceInput || !unitInput) return; // Check existence

    const newProduct = {
        id: Date.now(), 
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value),
        unit: unitInput.value.trim() || 'Pcs',
        createdAt: new Date().toISOString()
    };

    if (!newProduct.name || isNaN(newProduct.price) || newProduct.price <= 0) {
        showMessage("Please provide a valid name and positive price.", 'error', 'product-status-message');
        return;
    }

    try {
        toggleLoading(true, 'loading-indicator-product', 'product-submit-button');
        showMessage('Adding product...', 'info', 'product-status-message');

        const products = loadProducts();
        products.push(newProduct);
        
        const isSaved = saveToLocalStorage(PRODUCTS_KEY, products);

        if (isSaved) {
            showMessage('Product added successfully.', 'success', 'product-status-message');
            productForm.reset();
            nameInput.focus();
            renderProductsList();
        }

    } catch (error) {
        console.error("Failed to add product:", error);
        showMessage(`Failed to add product: ${error.message}`, 'error', 'product-status-message');
    } finally {
        toggleLoading(false, 'loading-indicator-product', 'product-submit-button');
    }
}
 
// --- Bill Creation and Saving Logic ---

function populateProductDropdown() {
    // Logic for dropdown population 
    const productSelect = document.getElementById('item-product-select');
    const addItemBtn = document.getElementById('add-item-btn');
    if (!productSelect || !addItemBtn) return;
    
    productSelect.innerHTML = '<option value="" disabled selected>Select a Product</option>';
    
    if (availableProducts.length === 0) {
         productSelect.innerHTML = '<option value="" disabled selected>Please add products first</option>';
         addItemBtn.disabled = true;
         return;
    }
    
    addItemBtn.disabled = false;
    
    availableProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (₹ ${product.price.toFixed(2)})`;
        option.dataset.price = product.price;
        option.dataset.name = product.name;
        productSelect.appendChild(option);
    });
}
 
function handleAddItemToBill(e) {
      // Logic for adding item to currentBillItems 
    e.preventDefault();
    
    const selectElement = document.getElementById('item-product-select');
    const quantityInput = document.getElementById('item-quantity');
    
    if (!selectElement || !quantityInput) return;

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const quantity = parseFloat(quantityInput.value);
    
    if (!selectedOption || selectedOption.value === "" || isNaN(quantity) || quantity <= 0) {
         showMessage("Please select a product and enter a valid quantity.", 'error', 'bill-status-message');
         return;
    }
    
    const price = parseFloat(selectedOption.dataset.price);
    const name = selectedOption.dataset.name;
    const subtotal = price * quantity;
    
    const newItem = {
        id: Date.now(),
        productId: selectedOption.value,
        name: name,
        price: price,
        quantity: quantity,
        subtotal: subtotal
    };
    
    // For simplicity, we just push the new item
    currentBillItems.push(newItem);
    
    showMessage(`${name} (${quantity}) added to the bill list.`, 'success', 'bill-status-message');
    quantityInput.value = '1'; // Reset
    
    renderBillItems();
}
 
function renderBillItems() {
      // Logic for rendering current bill items 
    const billItemsTableBody = document.getElementById('bill-items-table-body');
    const grandTotalDisplay = document.getElementById('grand-total-display');
    const savePrintArea = document.getElementById('save-print-area');
    
    if (!billItemsTableBody || !grandTotalDisplay || !savePrintArea) return;
    
    billItemsTableBody.innerHTML = '';
    let grandTotal = 0;
    let index = 1;

    if (currentBillItems.length === 0) {
        billItemsTableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-gray-500">Add products to the bill.</td></tr>';
        savePrintArea.classList.add('hidden');
        grandTotalDisplay.textContent = `₹ 0.00`;
        return;
    }
    
    savePrintArea.classList.remove('hidden');

    currentBillItems.forEach(item => {
        grandTotal += item.subtotal;
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-[#2a3440] transition duration-150';
        row.innerHTML = `
            <td class="py-2 px-3 text-sm">${index++}</td>
            <td class="py-2 px-3 text-sm font-medium text-gray-200">${item.name}</td>
            <td class="py-2 px-3 text-sm text-right">₹ ${item.price.toFixed(2)}</td>
            <td class="py-2 px-3 text-sm text-right">${item.quantity}</td>
            <td class="py-2 px-3 text-sm font-semibold text-right text-emerald-400">₹ ${item.subtotal.toFixed(2)}</td>
            <td class="py-2 px-1 text-center">
                <button onclick="removeItemFromBill(${item.id})" class="text-red-500 hover:text-red-300 p-1 rounded transition duration-150">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;
        billItemsTableBody.appendChild(row);
    });
    
    grandTotalDisplay.textContent = `₹ ${grandTotal.toFixed(2)}`;
}
 
window.removeItemFromBill = function(itemId) {
      // Logic for removing item from currentBillItems 
    currentBillItems = currentBillItems.filter(item => item.id !== itemId);
    renderBillItems();
    showMessage('Item removed from the bill.', 'info', 'bill-status-message');
}
 
function startNewBill() {
      // Logic for starting a new bill 
    const confirmAction = window.confirm("Are you sure you want to cancel the current bill and start a new one?");
    
    if (!confirmAction) {
        return;
    }
    
    currentBillItems = [];
    const customerForm = document.getElementById('customer-form');
    if(customerForm) customerForm.reset();
    
    renderBillItems();
    const billDateElement = document.getElementById('bill-date');
    if (billDateElement) billDateElement.textContent = new Date().toLocaleDateString('en-US');
    showMessage('New bill started.', 'info', 'bill-status-message');
}
 
// Function to save the finalized bill to history
function saveBillToHistory(customerName, customerPhone, grandTotal) {
    const newBill = {
        billId: Date.now(), 
        date: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        items: JSON.parse(JSON.stringify(currentBillItems)), // Deep copy the items
        grandTotal: grandTotal,
    };

    let history = loadFromLocalStorage(BILLING_HISTORY_KEY) || [];
    history.push(newBill);
    return saveToLocalStorage(BILLING_HISTORY_KEY, history);
}

// Handle Finalize, Save, and Print
function handleFinalizeAndPrint() {
    if (currentBillItems.length === 0) {
        showMessage("Please add items before finalizing the bill.", 'error', 'bill-status-message');
        return;
    }
    
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    
    const customerName = customerNameInput ? customerNameInput.value.trim() || "Cash Customer" : "Cash Customer";
    const customerPhone = customerPhoneInput ? customerPhoneInput.value.trim() || "N/A" : "N/A";
    const grandTotal = currentBillItems.reduce((acc, item) => acc + item.subtotal, 0);

    // 1. Save to History
    const isSaved = saveBillToHistory(customerName, customerPhone, grandTotal);
    
    if (!isSaved) {
         showMessage("ERROR: Could not save bill history. Printing anyway...", 'error', 'bill-status-message');
    } else {
         showMessage("Bill finalized and saved to history!", 'success', 'bill-status-message');
    }
    
    // 2. Print the bill
    generatePrintableBill(customerName, customerPhone, grandTotal);
    
    // 3. Start a new bill after a slight delay
    setTimeout(startNewBill, 500);
}


// Print function
function generatePrintableBill(customerName, customerPhone, grandTotal) {
    // Ensure businessData is loaded
    if (!businessData) {
        businessData = loadFromLocalStorage(BUSINESS_KEY);
        if (!businessData) {
            showMessage("Business information not loaded. Please go to Setup page.", 'error', 'bill-status-message');
            return;
        }
    }

    const billDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Create bill table content
    let billTableContent = '';
    let index = 1;
    currentBillItems.forEach(item => {
        billTableContent += `
            <tr>
                <td style="border: 1px solid #e5e7eb; padding: 6px; font-size: 13px; text-align: left;">${index++}</td>
                <td style="border: 1px solid #e5e7eb; padding: 6px; font-size: 13px; text-align: left; font-weight: 600;">${item.name}</td>
                <td style="border: 1px solid #e5e7eb; padding: 6px; font-size: 13px; text-align: right;">${item.price.toFixed(2)}</td>
                <td style="border: 1px solid #e5e7eb; padding: 6px; font-size: 13px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #e5e7eb; padding: 6px; font-size: 13px; text-align: right; font-weight: 700;">${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    // Billing HTML Template
    const billHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Invoice - ${customerName}</title>
            <style>
                body { font-family: sans-serif; margin: 0; padding: 20px; color: #1f2937; background-color: #fff; }
                /* Keep receipt size fixed for printing */
                .bill-page { width: 100%; max-width: 80mm; margin: 0 auto; padding: 10px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1f2937; padding-bottom: 10px; }
                .header h1 { margin: 0; font-size: 18px; color: #1f2937; }
                .header p { margin: 2px 0; font-size: 12px; color: #4b5563; }
                .details { font-size: 13px; margin-bottom: 15px; }
                .details div { margin-bottom: 4px; }
                .details strong { width: 60px; display: inline-block; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 12px; }
                th { background-color: #f3f4f6; font-weight: 700; text-align: right; }
                .total-row td { text-align: right; font-size: 14px; font-weight: 700; background-color: #e0f2f1; color: #0d9488; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #9ca3af; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="bill-page">
                    <div class="header">
                        <h1>${businessData.businessName}</h1>
                        <p>${businessData.address}</p>
                        <p>Phone: ${businessData.phone || 'N/A'} | Email: ${businessData.email || 'N/A'}</p>
                    </div>

                    <div class="details">
                        <div><strong>Date:</strong> ${billDate}</div>
                        <div><strong>Bill No:</strong> #${Date.now().toString().slice(-6)}</div>
                        <div><strong>Customer:</strong> ${customerName}</div>
                        <div><strong>Mobile:</strong> ${customerPhone}</div>
                    </div>

                    <table>
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="width: 5%; text-align: left;">#</th>
                                <th style="width: 40%; text-align: left;">Description</th>
                                <th style="width: 15%; text-align: right;">Price (₹)</th>
                                <th style="width: 15%; text-align: right;">Qty</th>
                                <th style="width: 25%; text-align: right;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${billTableContent}
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right; font-size: 16px; background-color: #e0f2f1; color: #0d9488; border: none;">GRAND TOTAL:</td>
                                <td style="text-align: right; font-size: 16px; background-color: #e0f2f1; color: #0d9488; border: none;">₹ ${grandTotal.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Thank you, visit again! | Bill generated using Local Storage.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Open a new window and print the bill
    const printWindow = window.open('', 'PrintBill', 'width=400,height=600');
    printWindow.document.write(billHTML);
    printWindow.document.close();
    
    // Trigger print dialog after the window loads
    printWindow.onload = function() {
        printWindow.print();
    };
}
 
// --- History Rendering and Deletion ---

function renderBillingHistory() {
    const history = loadFromLocalStorage(BILLING_HISTORY_KEY) || [];
    const historyTableBody = document.getElementById('history-table-body');
    const historyCountDisplay = document.getElementById('history-count');
    
    if (!historyTableBody || !historyCountDisplay) return;

    historyTableBody.innerHTML = '';
    historyCountDisplay.textContent = history.length;

    if (history.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No bills saved yet.</td></tr>';
        document.getElementById('clear-all-history-btn').classList.add('hidden');
        return;
    }
    
    document.getElementById('clear-all-history-btn').classList.remove('hidden');

    let listHTML = '';
    // Reverse the array to show the latest bill first
    history.slice().reverse().forEach(bill => {
        const billDate = new Date(bill.date).toLocaleString('en-US', { 
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        
        listHTML += `
            <tr class="border-b border-gray-700 hover:bg-[#2a3440] transition duration-150">
                <td class="py-3 px-4 text-sm font-medium text-gray-300">${bill.billId.toString().slice(-6)}</td>
                <td class="py-3 px-4 text-sm font-medium text-cyan-400">${bill.customerName}</td>
                <td class="py-3 px-4 text-sm text-gray-300">${billDate}</td>
                <td class="py-3 px-4 text-sm font-semibold text-right text-emerald-400">₹ ${bill.grandTotal.toFixed(2)}</td>
                <td class="py-3 px-2 text-center">
                    <button onclick="deleteSingleBill(${bill.billId})" class="text-red-500 hover:text-red-300 p-1 rounded transition duration-150">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    historyTableBody.innerHTML = listHTML;
}

window.deleteSingleBill = function(billId) {
    const confirmAction = window.confirm("Are you sure you want to permanently delete this bill?");
    if (!confirmAction) return;

    let history = loadFromLocalStorage(BILLING_HISTORY_KEY) || [];
    const initialLength = history.length;
    
    history = history.filter(bill => bill.billId !== billId);
    
    if (history.length < initialLength) {
        saveToLocalStorage(BILLING_HISTORY_KEY, history);
        renderBillingHistory();
        showMessage('Bill deleted successfully.', 'success', 'history-status-message');
    } else {
        showMessage('Error: Bill not found.', 'error', 'history-status-message');
    }
}

window.clearAllHistory = function() {
    const confirmAction = window.confirm("WARNING: This will permanently delete ALL saved bill history. Are you absolutely sure?");
    if (!confirmAction) return;
    
    saveToLocalStorage(BILLING_HISTORY_KEY, []);
    renderBillingHistory();
    showMessage('All selling history cleared successfully.', 'success', 'history-status-message');
}

// --- Sales Report Logic ---

function renderSalesReport() {
    const history = loadFromLocalStorage(BILLING_HISTORY_KEY) || [];
    const reportTableBody = document.getElementById('report-table-body');
    const totalRevenueDisplay = document.getElementById('total-revenue-display');
    
    if (!reportTableBody || !totalRevenueDisplay) return;
    
    reportTableBody.innerHTML = '';
    let grandTotalRevenue = 0;
    const reportData = {}; // {productId: {name, totalQty, totalIncome}}

    history.forEach(bill => {
        bill.items.forEach(item => {
            const id = item.productId;
            if (!reportData[id]) {
                reportData[id] = {
                    name: item.name,
                    totalQty: 0,
                    totalIncome: 0
                };
            }
            reportData[id].totalQty += item.quantity;
            reportData[id].totalIncome += item.subtotal;
            grandTotalRevenue += item.subtotal;
        });
    });

    const productIds = Object.keys(reportData);

    if (productIds.length === 0) {
        reportTableBody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">No sales data available.</td></tr>';
        totalRevenueDisplay.textContent = '₹ 0.00';
        return;
    }

    let listHTML = '';
    let index = 1;
    // Sort by Total Income (descending)
    productIds.sort((a, b) => reportData[b].totalIncome - reportData[a].totalIncome).forEach(id => {
        const data = reportData[id];
        listHTML += `
            <tr class="border-b border-gray-700 hover:bg-[#2a3440] transition duration-150">
                <td class="py-3 px-4 text-sm font-medium text-gray-300">${index++}</td>
                <td class="py-3 px-4 text-sm font-medium text-cyan-400">${data.name}</td>
                <td class="py-3 px-4 text-sm font-semibold text-right text-yellow-400">${data.totalQty}</td>
                <td class="py-3 px-4 text-sm font-extrabold text-right text-emerald-400">₹ ${data.totalIncome.toFixed(2)}</td>
            </tr>
        `;
    });
    
    reportTableBody.innerHTML = listHTML;
    document.getElementById('report-count').textContent = productIds.length;
    totalRevenueDisplay.textContent = `₹ ${grandTotalRevenue.toFixed(2)}`;
}


// --- Entry Point ---
window.onload = function () {
    setupEventListeners();
    checkExistingSetup();
};