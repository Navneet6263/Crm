import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { showToast } from './ToastNotification';

const ProductManagement = ({ darkMode = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#22c55e',
    icon: '🔵'
  });

  const defaultIcons = ['🔵', '🟢', '🟡', '🟠', '🔴', '🟣', '⚫', '⚪', '🔷', '🔶', '🔸', '🔹', '💼', '🏢', '💻', '📱', '🛠️', '⚙️', '📊', '📈'];
  const defaultColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('error', '❌ Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('error', '❌ Product name is required');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const url = editingProduct 
        ? `${apiUrl}/products/${editingProduct._id}`
        : `${apiUrl}/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedProduct = await response.json();
        
        if (editingProduct) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? savedProduct : p));
          showToast('success', '✅ Product updated successfully!');
        } else {
          setProducts(prev => [...prev, savedProduct]);
          showToast('success', '✅ Product created successfully!');
        }
        
        resetForm();
      } else {
        const error = await response.json();
        showToast('error', `❌ ${error.message || 'Failed to save product'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('error', '❌ Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      color: product.color,
      icon: product.icon
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        showToast('success', '✅ Product deleted successfully!');
      } else {
        const error = await response.json();
        showToast('error', `❌ ${error.message || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('error', '❌ Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#22c55e',
      icon: '🔵'
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    background: darkMode ? '#374151' : 'white',
    color: darkMode ? 'white' : '#1f2937',
    fontSize: '1rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: darkMode ? '#d1d5db' : '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Package size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: darkMode ? 'white' : '#111827',
                  margin: 0
                }}>
                  Product Management
                </h1>
                <p style={{
                  fontSize: '18px',
                  color: darkMode ? '#d1d5db' : '#6b7280',
                  margin: 0
                }}>
                  Manage products and services for lead categorization
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Loading products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No products found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Create your first product to start categorizing leads
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {products.map(product => (
                <div
                  key={product._id}
                  style={{
                    padding: '24px',
                    border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    backgroundColor: darkMode ? '#4b5563' : '#f8fafc',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = product.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = darkMode ? '#4b5563' : '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: product.color,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {product.icon}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: darkMode ? 'white' : '#111827',
                          margin: 0
                        }}>
                          {product.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: darkMode ? '#9ca3af' : '#6b7280',
                          margin: 0
                        }}>
                          Created {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: product.color + '20',
                    borderRadius: '8px',
                    border: `1px solid ${product.color}40`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: product.color,
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {product.icon} {product.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {showAddModal && (
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
            padding: '1rem',
            overflow: 'auto'
          }}>
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              margin: 'auto'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: 0
                    }}>
                      {editingProduct ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <p style={{
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      fontSize: '0.75rem',
                      margin: 0
                    }}>
                      {editingProduct ? 'Update details' : 'Create new category'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={resetForm}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Product Name */}
                  <div>
                    <label style={{...labelStyle, marginBottom: '0.25rem'}}>
                      Product Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      style={{...inputStyle, padding: '0.5rem'}}
                      required
                    />
                  </div>

                  {/* Icon and Color in one row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{...labelStyle, marginBottom: '0.25rem'}}>Icon</label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        {defaultIcons.slice(0, 10).map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            style={{
                              padding: '4px',
                              border: formData.icon === icon ? '2px solid #22c55e' : `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                              borderRadius: '4px',
                              background: formData.icon === icon ? '#22c55e20' : (darkMode ? '#374151' : 'white'),
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="Custom emoji"
                        style={{...inputStyle, padding: '0.5rem', fontSize: '0.875rem'}}
                      />
                    </div>

                    <div>
                      <label style={{...labelStyle, marginBottom: '0.25rem'}}>Color</label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        {defaultColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: color,
                              border: formData.color === color ? '2px solid white' : 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none'
                            }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{
                          width: '100%',
                          height: '35px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label style={{...labelStyle, marginBottom: '0.25rem'}}>Preview</label>
                    <div style={{
                      padding: '12px',
                      backgroundColor: darkMode ? '#374151' : '#f8fafc',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: formData.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {formData.icon} {formData.name || 'Product Name'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      background: 'transparent',
                      color: darkMode ? '#d1d5db' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={14} />
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;