import { useState, useRef, useEffect } from 'react';
import './App.css';

// Organization List with unique webhook URLs for each
const ORGANIZATIONS = [
  { label: "Tata Power", webhookName: "Tata", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Zee Entertainment", webhookName: "ZEE_Entertainment", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Physics Wallah Limited", webhookName: "Physics_Wallah", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Japfa-Comfeed", webhookName: "Japfa_Comfeed", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Impresario", webhookName: "IMPRESARIO", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Infobahn", webhookName: "InfoBahn", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" },
  { label: "Care-life", webhookName: "Care_life", url: "https://workflow.arali.ai/webhook/3f5250d2-ee0f-4fcc-9573-d30d4c0ba6b0" }
];

// Production Webhook URL for the Clear All operation
const CLEAR_ALL_WEBHOOK_URL = "https://workflow.arali.ai/webhook/aba913b4-41cb-4b6c-9973-1312d82cbcd9";

function App() {
  // App States
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Webhook Output States
  const [billingSummary, setBillingSummary] = useState(null);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [filesList, setFilesList] = useState([]);

  // UX States
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Organization Selection
  const handleSelectOrg = (org) => {
    setSelectedOrg(org);
    setDropdownOpen(false);
  };

  // Handle Triggering hidden file upload input
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle File Selection (does NOT trigger webhook yet)
  const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Execute Production Webhook Workflow
  const executeWorkflow = async () => {
    if (!selectedOrg || !selectedFile) return;

    // Reset output panels to initial/loading states
    setJsonOutput(null);
    setBillingSummary(null);
    setErrorText(null);
    setFilesList([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("organization", selectedOrg.webhookName);
      formData.append("file", selectedFile);

      const response = await fetch(selectedOrg.url, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Webhook Error ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid or empty JSON received from webhook.");
      }

      if (!data) {
        throw new Error("Empty response received from webhook.");
      }

      // Render Top Billing Summary
      if (data.organization || data.total_billing_amt !== undefined || data.costing_scheme) {
        setBillingSummary({
          organization: data.organization,
          total_billing_amt: data.total_billing_amt,
          costing_scheme: data.costing_scheme
        });
      }

      // Dynamic JSON Rendering
      if (data.json) {
        setJsonOutput(data.json);
      } else {
        setJsonOutput(data);
      }

      // Graceful File List Handling
      if (data.file && Array.isArray(data.file)) {
        setFilesList(data.file);
      } else if (data.files && Array.isArray(data.files)) {
        setFilesList(data.files);
      } else {
        setFilesList([]);
      }

    } catch (err) {
      console.error("Webhook Execution Error: ", err);
      setErrorText(`Webhook execution failed:\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all dashboard states back to initial and trigger production webhook
  const handleClearAll = async () => {
    // Clear UI states immediately for a fast, responsive feeling
    setSelectedOrg(null);
    setSelectedFile(null);
    setJsonOutput(null);
    setBillingSummary(null);
    setIsLoading(false);
    setErrorText(null);
    setFilesList([]);
    setDropdownOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Trigger production webhook in the background
    try {
      await fetch(CLEAR_ALL_WEBHOOK_URL, {
        method: "POST"
      });
      console.log("Clear All Webhook triggered successfully.");
    } catch (err) {
      console.error("Failed to trigger Clear All webhook:", err);
    }
  };

  // Render file-type specific icons inside cards
  const renderFileIcon = (type) => {
    switch (type) {
      case 'CSV':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="9" y1="11" x2="15" y2="11"></line>
            <line x1="9" y1="19" x2="13" y2="19"></line>
          </svg>
        );
      case 'JSON':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <polyline points="8 13 6 15 8 17"></polyline>
            <polyline points="12 17 14 15 12 13"></polyline>
          </svg>
        );
      case 'XLSX':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <rect x="7" y="12" width="10" height="6" rx="1"></rect>
            <line x1="12" y1="12" x2="12" y2="18"></line>
            <line x1="7" y1="15" x2="17" y2="15"></line>
          </svg>
        );
    }
  };

  // Custom regex-based JSON syntax highlighting
  const renderHighlightedJson = (obj) => {
    if (!obj) return null;
    const jsonStr = JSON.stringify(obj, null, 2);
    const lines = jsonStr.split('\n');

    return (
      <div className="json-viewer-container">
        {lines.map((line, idx) => {
          const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|(true|false|null)|([{}[\]:,])|(\s+)/g;
          let match;
          const lineElements = [];
          let lastIndex = 0;

          while ((match = regex.exec(line)) !== null) {
            const token = match[0];
            const keyMatch = match[1];
            const stringMatch = match[3];
            const numberMatch = match[5];
            const boolMatch = match[6];
            const punctMatch = match[7];
            const spaceMatch = match[8];

            if (keyMatch) {
              const colonIndex = token.lastIndexOf(':');
              const keyPart = token.substring(0, colonIndex);
              const colonPart = token.substring(colonIndex);
              lineElements.push(<span key={lastIndex + '_key'} className="json-key">{keyPart}</span>);
              lineElements.push(<span key={lastIndex + '_colon'} className="json-punctuation">{colonPart}</span>);
            } else if (stringMatch) {
              lineElements.push(<span key={lastIndex + '_str'} className="json-string">{token}</span>);
            } else if (numberMatch) {
              lineElements.push(<span key={lastIndex + '_num'} className="json-number">{token}</span>);
            } else if (boolMatch) {
              lineElements.push(<span key={lastIndex + '_bool'} className="json-boolean">{token}</span>);
            } else if (punctMatch) {
              lineElements.push(<span key={lastIndex + '_punct'} className="json-punctuation">{token}</span>);
            } else if (spaceMatch) {
              lineElements.push(token);
            }
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < line.length) {
            lineElements.push(line.substring(lastIndex));
          }

          return (
            <div key={idx} className="json-line">
              {lineElements.length > 0 ? lineElements : '\u00A0'}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* HEADER SECTION */}
      <header className="header-bar">
        <a href="/" className="header-brand">Arali AI</a>

        <div className="header-right">
          <div className="api-badge live" title={selectedOrg?.url || "No Organization Selected"}>
            <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--json-boolean)', display: 'inline-block' }}></span>
            Production Webhook
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <main className="dashboard-container">

        {/* CENTER ACTION BUTTONS */}
        <section className="action-bar">

          {/* dropdown container */}
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className="btn-pill btn-dark"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isLoading}
            >
              {selectedOrg ? selectedOrg.label.toUpperCase() : "SELECT ORGANIZATION"}
              <span className="dropdown-arrow">˅˅</span>
            </button>

            {/* Slide-out Dropdown List */}
            <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
              {ORGANIZATIONS.map((org) => (
                <button
                  key={org.webhookName}
                  type="button"
                  className={`dropdown-item ${selectedOrg?.webhookName === org.webhookName ? 'selected' : ''}`}
                  onClick={() => handleSelectOrg(org)}
                >
                  {org.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPLOAD FILE PILL */}
          <button
            type="button"
            className="btn-pill btn-dark"
            disabled={isLoading}
            onClick={triggerFileUpload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <polyline points="9 15 12 12 15 15"></polyline>
            </svg>
            Upload File
          </button>

          {/* Hidden File Picker Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: 'none' }}
            onChange={onFileSelected}
          />

          {/* EXECUTE WORKFLOW PILL */}
          <button
            type="button"
            className="btn-pill"
            disabled={!selectedOrg || !selectedFile || isLoading}
            onClick={executeWorkflow}
            style={{
              backgroundColor: '#4B4EFC',
              color: 'white',
              border: 'none',
              opacity: (!selectedOrg || !selectedFile || isLoading) ? 0.6 : 1,
              cursor: (!selectedOrg || !selectedFile || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Execute Workflow
          </button>

          {/* CLEAR ALL PILL */}
          <button
            type="button"
            className="btn-pill btn-danger"
            onClick={handleClearAll}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Clear All
          </button>

        </section>

        {/* LOADING UX INDICATOR */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', color: '#4B4EFC', fontWeight: '600', marginBottom: '24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px', animation: 'spin 1s linear infinite' }}>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Processing billing workflow...
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* FILE DETAILS PANEL */}
        <section className="file-details-section">
          <h2 className="details-title">File Details</h2>
          <div className="details-row">
            <span className="details-label">Name:</span>
            {selectedFile ? (
              <span className="details-tag">{selectedFile.name}</span>
            ) : (
              <span className="details-tag" style={{ visibility: 'hidden' }}>&nbsp;</span>
            )}
          </div>
        </section>

        {/* TOP BILLING SUMMARY PANEL */}
        {billingSummary && !isLoading && (
          <section style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '24px', marginBottom: '32px', border: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
              <div style={{ fontSize: 20, color: '#111827', fontWeight: 600, marginTop: 8 }}>{billingSummary.organization || '-'}</div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Billing Amount</div>
              <div style={{ fontSize: 24, color: '#10B981', fontWeight: 800, marginTop: 4 }}>
                {billingSummary.total_billing_amt ? `₹${billingSummary.total_billing_amt.toLocaleString()}` : '-'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costing Scheme</div>
              <div style={{ fontSize: 16, color: '#374151', fontWeight: 500, marginTop: 8 }}>{billingSummary.costing_scheme || '-'}</div>
            </div>
          </section>
        )}

        {/* TWO COLUMN PANEL GRID */}
        <section className="dashboard-grid">

          {/* LEFT: JSON OUTPUT PANEL */}
          <div className="panel-container">
            <div className="panel-header">
              <h2 className="panel-title">JSON Output</h2>
              <div className="panel-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9CA3AF' }}>
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
            </div>

            <div className="panel-card" style={{ overflowY: 'auto' }}>
              {errorText ? (
                <div className="json-error" style={{ color: '#DC2626', backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '6px', border: '1px solid #F87171', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {errorText}
                </div>
              ) : jsonOutput ? (
                renderHighlightedJson(jsonOutput)
              ) : (
                <div className="json-idle">
                  Awaiting file processing... Select an organization and upload a CSV or XLSX file to execute the workflow.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: FILES PANEL */}
          <div className="panel-container">
            <div className="panel-header">
              <h2 className="panel-title">Files</h2>
              <div className="panel-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9CA3AF' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>

            <div className="panel-card" style={{ padding: '16px' }}>
              <div className="files-list">

                {/* Dynamically Render file cards from Webhook response */}
                {filesList.map((file, index) => (
                  <a
                    key={index}
                    href={file.url || '#'}
                    download={file.name || 'download'}
                    className="file-card"
                    title={`Click to download ${file.name || ''}`}
                  >
                    <div className="file-card-icon-container">
                      {renderFileIcon(file.type || 'CSV')}
                    </div>
                    <div className="file-card-info">
                      <span className="file-card-name">{file.name || 'Unnamed File'}</span>
                      <span className="file-card-meta">{file.size || 'Unknown Size'}</span>
                    </div>
                    <div className="file-card-download">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                  </a>
                ))}

                {/* WAITING FOR NEW EXPORTS Placeholder card */}
                {(!filesList || filesList.length === 0) && (
                  <div className={`file-card-placeholder ${isLoading ? 'active' : ''}`}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9CA3AF' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <span className="placeholder-text">Waiting for new exports...</span>
                  </div>
                )}

              </div>
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="footer-bar">
        <div className="footer-left">Arali AI</div>
        <div className="footer-right">
          <a href="#" className="footer-link">Privacy Policy</a>
          <span className="footer-sep">·</span>
          <a href="#" className="footer-link">Terms of Service</a>
          <span className="footer-sep">·</span>
          <a href="#" className="footer-link">Contact</a>
          <span className="footer-sep" style={{ marginLeft: 6, marginRight: 6 }}></span>
          <span>© 2024 Arali AI. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
