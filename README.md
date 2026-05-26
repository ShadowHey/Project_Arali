# Arali AI — Billing Dashboard & Webhook Orchestrator

A premium, interactive React-based data processing and billing orchestration dashboard. This application allows users to select client organizations, upload billing spreadsheets (CSV/XLSX), trigger high-performance processing workflows via production webhooks, view real-time highlighted JSON analytics, and export files.

---

## 🚀 Key Features

* **Dynamic Organization Selector**: Multi-client support for organizations including *Tata Power*, *Zee Entertainment*, *Physics Wallah Limited*, *Japfa-Comfeed*, *Impresario*, *Infobahn*, and *Care-life*.
* **Multi-Format Sheet Upload**: Complete drag-and-click support for `.csv` and `.xlsx` (Excel) formats.
* **Instant Workflow Execution**: Directly coordinates with the production webhook processing system.
* **Real-time Metrics Summary**: Visualized cards representing parsed values (Organization, Total Billing Amount in ₹, Costing Scheme).
* **High-Fidelity JSON Viewer**: Integrated client-side regex-based JSON syntax highlighting engine for analyzing pipeline responses.
* **Export File Downloader**: Dynamically generated cards mapping exported CSV/JSON/XLSX files, including sizing metadata and secure download handles.
* **Interactive Workspace Reset**: A **Clear All** trigger that resets the interface instantly while calling the production workspace-cleanup webhook in the background.

---

## 🛠️ Tech Stack

* **Core**: React 19 (Functional Hooks & Refs)
* **Build System & HMR**: Vite
* **Styling**: Modern, responsive HSL-variables based CSS design system (Vanilla CSS with dark grid aesthetic elements).

---

## ⚙️ Setup & Installation

Follow these steps to set up and run the project locally on your system:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version **18.x** or higher is highly recommended).

### 2. Clone & Navigate
Clone your project repository and open the workspace directory:
```bash
cd Billing_Landing_Page
```

### 3. Install Dependencies
Install all required Node modules and dev dependencies:
```bash
npm install
```

### 4. Run Development Server
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Once started, open your browser and navigate to the address displayed in the console (usually `http://localhost:5173/`).

### 5. Build for Production
To build the application into a highly optimized, minified bundle suitable for static web hosting:
```bash
npm run build
```
This command compiles all assets and outputs them into the `dist/` directory.

### 6. Preview Production Build
To spin up a local server to test the production bundle in `dist/`:
```bash
npm run preview
```

---

## 📡 Webhook Integration Specifications

The frontend coordinates with two primary production webhooks:

### 1. Execute Sheet Processing
* **Trigger**: Clicked via the **Execute Workflow** button.
* **Endpoint URL**: `https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0`
* **HTTP Method**: `POST`
* **Payload Type**: `multipart/form-data`
* **Fields**:
  * `organization`: String (webhook key corresponding to the selected client)
  * `file`: Binary (the uploaded spreadsheet file)

### 2. Clear Workspace Sheets
* **Trigger**: Clicked via the **Clear All** button.
* **Endpoint URL**: `https://workflow.arali.ai/webhook/aba913b4-41cb-4b6c-9973-1312d82cbcd9`
* **HTTP Method**: `POST`
* **Payload Type**: None (empty body, background call)

---

## 📂 Project Structure

```text
Billing_Landing_Page/
├── dist/                   # Production-compiled assets (generated on build)
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images, SVG icons, and media files
│   ├── App.css             # Base App style overrides
│   ├── App.jsx             # Main React Application, states, and event handling
│   ├── index.css           # Global typography, color tokens, and design layouts
│   └── main.jsx            # Application mount point
├── .gitignore              # Configured Git exclusion patterns
├── index.html              # Core HTML structure and mounting div
├── package.json            # Scripts and project dependencies
└── vite.config.js          # Vite configuration options
```
