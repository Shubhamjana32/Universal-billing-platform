# 🧾 Universal Billing Software (Local Storage Edition)

[![GitHub Pages Status](https://github.com/Shubhamjana32/Universal-billing-platform/actions/workflows/github-pages.yml/badge.svg)](https://shubhamjana32.github.io/Universal-billing-platform/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/Shubhamjana32/Universal-billing-platform?style=social)](https://github.com/Shubhamjana32/Universal-billing-platform/stargazers)

> This project is a **standalone, client-side, responsive billing and invoicing application** built entirely with **HTML, Tailwind CSS, and vanilla JavaScript**. It provides a complete, local solution for small businesses to generate professional bills, manage products, track sales history, and view reports—all without requiring a backend server or external database.

## 🚀 Live Demo

You can try the application directly in your browser:

👉 **[Launch Universal Billing Platform](https://shubhamjana32.github.io/Universal-billing-platform/)**

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **⚡ Serverless Operation** | The entire application runs directly in the browser (`index.html`), offering rapid deployment and execution. |
| **💾 Local Storage Persistence** | All setup data, products, and billing history are securely saved and retrieved from the browser's **Local Storage**, persisting across sessions. |
| **🧾 Professional Invoicing** | Generate and instantly **Print** thermal receipt-style bills, complete with customer details and itemized product lists. |
| **📦 Product Management** | A dedicated view to easily add, list, and manage inventory items, including name, price, and units (Pcs, Kg, Hour, etc.). |
| **🔒 Password-Protected History** | Billing History and Sales Reports are secured by a user-defined password set during initial setup, ensuring data privacy. |
| **📊 Sales Reporting** | Automatically compiles a product-wise **Sales Report** and calculates **Total Revenue** based on historical transactions. |
| **🌙 Dark Mode UI** | Features a modern, sleek interface styled with **Tailwind CSS**. |
| **⚠️ Data Management** | Includes an option for a permanent logout/reset, which performs a destructive clear of all local application data. |

---

## 🛠️ Technology Stack

* **Frontend Language:** Vanilla **JavaScript** (ES6+) for all logic and state management.
* **Styling:** **Tailwind CSS** for a utility-first, responsive, and dark-mode-ready design.
* **Data Persistence:** Browser's **Local Storage API** (acts as the database).
* **Markup:** Semantic **HTML5**.

---

## ⚙️ How to Use / Setup Guide

### 1. Initial Setup

When you first open the application, you will be guided through a one-time setup:

1.  Enter your **Business/Store Name** and **Full Address**.
2.  Set a strong **History Password**. This is crucial for accessing history and reports.
3.  Click **"Complete Setup and Save Data"**.

### 2. Managing Products

1.  Navigate to the **Product Management** tab.
2.  Use the form on the left to add a new item, specifying its **Name**, **Price (₹)**, and **Unit**.
3.  Click **"Add Product"**. Your products will immediately appear in the list and be available for billing.

### 3. Creating and Printing a Bill

1.  Navigate to the **Create New Bill** tab.
2.  (Optional) Enter **Customer Name** and **Phone Number**.
3.  In the **Add Bill Item** section, select a product from the dropdown.
4.  Enter the **Quantity** and click **"Add to Bill List"**.
5.  Repeat for all items. The **Grand Total** updates in real-time.
6.  Click **"Finalize, Save & Print Bill"** to save the transaction to history and open the print dialog.

---

## 🛑 Important Note on Data

Since this application uses your browser's **Local Storage**:

* **Data is Local:** Your data is only stored on the specific computer/browser you are using. Clearing your browser's data (specifically "Local Storage" or "Site Data") will permanently erase all bills, products, and setup information.
* **Security:** The password protection is only a basic front-end gate; it does not encrypt the data in Local Storage itself.
