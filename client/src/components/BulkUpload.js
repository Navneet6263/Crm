import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Users, UserPlus, Download, CheckCircle, AlertCircle, X } from 'lucide-react';
import { showToast } from './ToastNotification';
import * as XLSX from 'xlsx';

const BulkUpload = ({ darkMode, onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState(''); // 'leads' or 'customers'
  const [preview, setPreview] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      showToast('error', 'Please select Excel (.xlsx, .xls) or CSV file only');
      return;
    }

    setFile(selectedFile);
    previewFile(selectedFile);
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setPreview(jsonData.slice(0, 5)); // Show first 5 rows
      } catch (error) {
        showToast('error', 'Error reading file. Please check file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = (type) => {
    let templateData = [];
    
    if (type === 'leads') {
      templateData = [{
        'Contact Person': 'John Doe',
        'Company Name': 'Tech Solutions Pvt Ltd',
        'Email': 'john@techsolutions.com',
        'Phone': '9876543210',
        'Industry': 'Technology',
        'Lead Source': 'google',
        'Estimated Value': '150000',
        'Priority': 'high',
        'Requirements': 'Need CRM software for 50 users'
      }];
    } else {
      templateData = [{
        'Customer Name': 'Jane Smith',
        'Company': 'Healthcare Corp',
        'Email': 'jane@healthcare.com',
        'Phone': '9876543211',
        'Address': '123 Main St, City',
        'Industry': 'Healthcare',
        'Customer Type': 'Enterprise'
      }];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'leads' ? 'Leads' : 'Customers');
    XLSX.writeFile(wb, `${type}_template.xlsx`);
    showToast('success', `${type} template downloaded!`);
  };

  const handleUpload = async () => {
    if (!file || !uploadType) {
      showToast('error', 'Please select file and upload type');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const results = await processUpload(jsonData, uploadType);
          setUploadResults(results);
          
          if (results.success > 0) {
            showToast('success', `✅ ${results.success} ${uploadType} uploaded successfully!`);
            if (results.failed > 0) {
              showToast('warning', `⚠️ ${results.failed} records failed to upload`);
            }
            onUploadComplete();
          } else if (results.failed > 0) {
            showToast('error', `❌ All ${results.failed} records failed to upload`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          showToast('error', error.message || 'Error processing file');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      showToast('error', error.message || 'Upload failed');
    }
  };

  const processUpload = async (data, type) => {
    try {
      // Transform data to match backend expectations
      const transformedData = data.map(row => {
        if (type === 'leads') {
          return {
            contactPerson: row['Contact Person'] || row['Name'] || '',
            companyName: row['Company Name'] || row['Company'] || '',
            email: row['Email'] || '',
            phone: row['Phone'] || '',
            industry: row['Industry'] || '',
            leadSource: row['Lead Source'] || 'bulk_upload',
            estimatedValue: parseInt(row['Estimated Value']) || 0,
            priority: row['Priority'] || 'medium',
            requirements: row['Requirements'] || ''
          };
        } else {
          return {
            name: row['Customer Name'] || row['Name'] || '',
            company: row['Company'] || '',
            email: row['Email'] || '',
            phone: row['Phone'] || '',
            address: row['Address'] || '',
            industry: row['Industry'] || '',
            customerType: row['Customer Type'] || 'Standard'
          };
        }
      });

      // Process in very small chunks to avoid header size issues
      const CHUNK_SIZE = 5; // Process 5 records at a time
      let totalSuccess = 0;
      let totalFailed = 0;
      const errors = [];

      // Get token once
      const token = localStorage.getItem('authToken');
      
      for (let i = 0; i < transformedData.length; i += CHUNK_SIZE) {
        const chunk = transformedData.slice(i, i + CHUNK_SIZE);
        
        try {
          const response = await fetch(`/api/${type}/bulk-upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              data: chunk,
              token: token
            })
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();


          totalSuccess += result.success || 0;
          totalFailed += result.failed || 0;
          
        } catch (error) {
          console.error(`Chunk ${i}-${i + chunk.length} error:`, error);
          totalFailed += chunk.length;
          errors.push(`Batch ${Math.floor(i/CHUNK_SIZE) + 1}: ${error.message}`);
        }
      }

      return {
        success: totalSuccess,
        failed: totalFailed,
        errors: errors
      };
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: darkMode ? '#1f2937' : 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Upload size={32} color="#22c55e" />
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Bulk Upload
              </h2>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                Upload Excel/CSV file to add multiple records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#9ca3af' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Upload Type Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1rem'
            }}>
              Select Upload Type
            </h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setUploadType('leads')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${uploadType === 'leads' ? '#22c55e' : (darkMode ? '#374151' : '#e5e7eb')}`,
                  borderRadius: '8px',
                  background: uploadType === 'leads' ? '#dcfce7' : (darkMode ? '#374151' : 'white'),
                  color: uploadType === 'leads' ? '#166534' : (darkMode ? 'white' : '#1f2937'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1
                }}
              >
                <UserPlus size={20} />
                Upload Leads
              </button>
              <button
                onClick={() => setUploadType('customers')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${uploadType === 'customers' ? '#22c55e' : (darkMode ? '#374151' : '#e5e7eb')}`,
                  borderRadius: '8px',
                  background: uploadType === 'customers' ? '#dcfce7' : (darkMode ? '#374151' : 'white'),
                  color: uploadType === 'customers' ? '#166534' : (darkMode ? 'white' : '#1f2937'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1
                }}
              >
                <Users size={20} />
                Upload Customers
              </button>
            </div>
          </div>

          {/* Template Download */}
          {uploadType && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem'
              }}>
                Download Template
              </h3>
              <button
                onClick={() => downloadTemplate(uploadType)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={16} />
                Download {uploadType} Template
              </button>
            </div>
          )}

          {/* File Upload */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1rem'
            }}>
              Select File
            </h3>
            <div style={{
              border: `2px dashed ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              background: darkMode ? '#374151' : '#f9fafb'
            }}>
              <FileSpreadsheet size={48} color={darkMode ? '#9ca3af' : '#6b7280'} style={{ margin: '0 auto 1rem' }} />
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#22c55e',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                Choose File
              </label>
              {file && (
                <p style={{
                  marginTop: '1rem',
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem'
              }}>
                Preview (First 5 rows)
              </h3>
              <div style={{
                overflow: 'auto',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: darkMode ? '#374151' : '#f9fafb' }}>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} style={{
                            padding: '0.75rem',
                            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            color: darkMode ? '#d1d5db' : '#374151',
                            fontSize: '0.875rem'
                          }}>
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem'
              }}>
                Upload Results
              </h3>
              <div style={{
                padding: '1rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color="#22c55e" />
                  <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    Success: {uploadResults.success}
                  </span>
                </div>
                {uploadResults.failed > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} color="#ef4444" />
                      <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Failed: {uploadResults.failed}
                      </span>
                    </div>
                    {uploadResults.errors && uploadResults.errors.length > 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: darkMode ? '#1f2937' : '#fef2f2',
                        borderRadius: '4px',
                        maxHeight: '150px',
                        overflow: 'auto'
                      }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#ef4444',
                          marginBottom: '0.25rem'
                        }}>
                          Error Details:
                        </div>
                        {uploadResults.errors.slice(0, 10).map((error, index) => (
                          <div key={index} style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#fca5a5' : '#dc2626',
                            marginBottom: '0.125rem'
                          }}>
                            {error}
                          </div>
                        ))}
                        {uploadResults.errors.length > 10 && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            fontStyle: 'italic'
                          }}>
                            ... and {uploadResults.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: darkMode ? '#9ca3af' : '#6b7280',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || !uploadType || isUploading}
              style={{
                padding: '0.75rem 1.5rem',
                background: (!file || !uploadType || isUploading) ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!file || !uploadType || isUploading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;