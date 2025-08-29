import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Folder,
  File,
  Image,
  FileSpreadsheet,
  Eye,
  Trash2,
  Share,
  Star,
  Clock
} from 'lucide-react';
import { showToast } from './ToastNotification';

const DocumentManager = ({ darkMode, currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Initialize with sample documents and folders
    const sampleFolders = [
      { id: 'contracts', name: 'Contracts', parent: 'root', createdDate: new Date().toISOString() },
      { id: 'proposals', name: 'Proposals', parent: 'root', createdDate: new Date().toISOString() },
      { id: 'invoices', name: 'Invoices', parent: 'root', createdDate: new Date().toISOString() },
      { id: 'kyc', name: 'KYC Documents', parent: 'root', createdDate: new Date().toISOString() }
    ];

    const sampleDocuments = [
      {
        id: 1,
        name: 'Service Agreement - Tech Solutions Ltd.pdf',
        type: 'pdf',
        size: '2.5 MB',
        folder: 'contracts',
        uploadedBy: 'Navneet Kumar',
        uploadDate: new Date().toISOString(),
        starred: true,
        tags: ['contract', 'tech-solutions']
      },
      {
        id: 2,
        name: 'Proposal - Digital Marketing Campaign.docx',
        type: 'docx',
        size: '1.8 MB',
        folder: 'proposals',
        uploadedBy: 'Sales Manager',
        uploadDate: new Date().toISOString(),
        starred: false,
        tags: ['proposal', 'marketing']
      },
      {
        id: 3,
        name: 'Invoice - INV-2025-001.xlsx',
        type: 'xlsx',
        size: '0.5 MB',
        folder: 'invoices',
        uploadedBy: 'Admin User',
        uploadDate: new Date().toISOString(),
        starred: false,
        tags: ['invoice', '2025']
      },
      {
        id: 4,
        name: 'Company Logo.png',
        type: 'png',
        size: '0.3 MB',
        folder: 'root',
        uploadedBy: 'Navneet Kumar',
        uploadDate: new Date().toISOString(),
        starred: true,
        tags: ['logo', 'branding']
      }
    ];

    setFolders(sampleFolders);
    setDocuments(sampleDocuments);
  }, []);

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText style={{ color: '#ef4444' }} size={20} />;
      case 'docx':
      case 'doc': return <FileText style={{ color: '#3b82f6' }} size={20} />;
      case 'xlsx':
      case 'xls': return <FileSpreadsheet style={{ color: '#22c55e' }} size={20} />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <Image style={{ color: '#8b5cf6' }} size={20} />;
      default: return <File style={{ color: '#6b7280' }} size={20} />;
    }
  };

  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop(),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        folder: currentFolder,
        uploadedBy: currentUser?.name || 'Unknown',
        uploadDate: new Date().toISOString(),
        starred: false,
        tags: []
      };

      setDocuments(prev => [newDoc, ...prev]);
      showToast('success', `✅ ${file.name} uploaded successfully!`);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const toggleStar = (docId) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, starred: !doc.starred } : doc
    ));
    showToast('info', '⭐ Document starred status updated');
  };

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    showToast('success', '🗑️ Document deleted successfully');
  };

  const downloadDocument = (doc) => {
    // Mock download
    showToast('info', `📥 Downloading ${doc.name}...`);
  };

  const shareDocument = (doc) => {
    // Mock share functionality
    const shareUrl = `${window.location.origin}/documents/${doc.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('success', '🔗 Share link copied to clipboard!');
  };

  const currentFolderDocs = documents.filter(doc => doc.folder === currentFolder);
  const currentFolderSubfolders = folders.filter(folder => folder.parent === currentFolder);

  const filteredItems = [...currentFolderSubfolders, ...currentFolderDocs].filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'starred' && item.starred) ||
                         (filterType === 'recent' && new Date(item.uploadDate || item.createdDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesFilter;
  });

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText style={{ color: '#3b82f6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Document Manager
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Organize and manage your business documents
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <Upload size={20} />
            Upload Files
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'starred', 'recent'].map(filter => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: filterType === filter 
                    ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                    : (darkMode ? '#374151' : '#f3f4f6'),
                  color: filterType === filter 
                    ? 'white' 
                    : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder !== 'root' && (
        <div style={{ ...cardStyle, padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentFolder('root')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Home
            </button>
            <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>/</span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? 'white' : '#1f2937'
            }}>
              {folders.find(f => f.id === currentFolder)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        style={{
          ...cardStyle,
          padding: '2rem',
          marginBottom: '2rem',
          border: dragOver 
            ? '2px dashed #3b82f6' 
            : `2px dashed ${darkMode ? '#374151' : '#e5e7eb'}`,
          background: dragOver 
            ? (darkMode ? '#1e3a8a' : '#dbeafe')
            : (darkMode ? '#1f2937' : 'white'),
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <Upload size={48} style={{ 
          color: dragOver ? '#3b82f6' : (darkMode ? '#9ca3af' : '#6b7280'),
          marginBottom: '1rem'
        }} />
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: dragOver ? '#3b82f6' : (darkMode ? 'white' : '#1f2937'),
          marginBottom: '0.5rem'
        }}>
          {dragOver ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p style={{
          color: darkMode ? '#9ca3af' : '#6b7280',
          margin: 0
        }}>
          or click to browse files
        </p>
        <input
          id="fileInput"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Documents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredItems.map(item => {
          const isFolder = !item.type;
          
          return (
            <div key={item.id} style={{ ...cardStyle, padding: '1.5rem' }}>
              {/* Item Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {isFolder ? (
                    <Folder style={{ color: '#f59e0b' }} size={24} />
                  ) : (
                    getFileIcon(item.type)
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </h3>
                    {!isFolder && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {item.size}
                      </p>
                    )}
                  </div>
                </div>
                
                {!isFolder && (
                  <button
                    onClick={() => toggleStar(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Star 
                      size={16} 
                      fill={item.starred ? '#f59e0b' : 'transparent'}
                      color={item.starred ? '#f59e0b' : (darkMode ? '#9ca3af' : '#6b7280')}
                    />
                  </button>
                )}
              </div>

              {/* Item Details */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={14} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {new Date(item.uploadDate || item.createdDate).toLocaleDateString()}
                  </span>
                </div>
                
                {!isFolder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      by {item.uploadedBy}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: isFolder ? 'center' : 'space-between'
              }}>
                {isFolder ? (
                  <button
                    onClick={() => setCurrentFolder(item.id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Folder size={16} />
                    Open Folder
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => downloadDocument(item)}
                      style={{
                        padding: '0.5rem',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      onClick={() => shareDocument(item)}
                      style={{
                        padding: '0.5rem',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Share"
                    >
                      <Share size={16} />
                    </button>
                    
                    <button
                      style={{
                        padding: '0.5rem',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteDocument(item.id)}
                      style={{
                        padding: '0.5rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <FileText size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No documents found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;