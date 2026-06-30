import React, { useState, useEffect } from 'react';
import * as productService from '../../services/product.service.js';
import usePermissions from '../../hooks/usePermissions.js';
import PermissionGuard from '../../router/PermissionGuard.jsx';
import { Search, PlusCircle, Edit2, Trash2, X } from 'lucide-react';

export const ProductsList = () => {
  const { can } = usePermissions();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMess, setErrorMess] = useState('');
  
  // Search and pagination parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [page, setPage] = useState(1);

  // Form modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit'
  const [activeProductId, setActiveProductId] = useState(null);
  
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMess('');
    try {
      const data = await productService.getProducts({ search: searchQuery, page, limit: pagination.limit });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Failed to fetch products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, page]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
    }
  };

  const openCreateModal = () => {
    setModalType('create');
    setFormName('');
    setFormSku('');
    setFormDescription('');
    setFormPrice(0);
    setFormStock(0);
    setErrorMess('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalType('edit');
    setActiveProductId(product._id);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormDescription(product.description || '');
    setFormPrice(product.price);
    setFormStock(product.stock);
    setErrorMess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveProductId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMess('');

    const payload = {
      name: formName,
      sku: formSku,
      description: formDescription,
      price: Number(formPrice),
      stock: Number(formStock)
    };

    try {
      if (modalType === 'create') {
        await productService.createProduct(payload);
      } else {
        await productService.updateProduct(activeProductId, payload);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Error occurred saving product details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, sku) => {
    if (!window.confirm(`Are you sure you want to delete Product SKU: ${sku}?`)) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div>
      <div className="card-title-bar">
        <h2>Products List</h2>
        
        {/* Only render 'Add Product' if user has Create permissions */}
        <PermissionGuard module="Products" action="create">
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <PlusCircle size={16} />
            <span>Add Product</span>
          </button>
        </PermissionGuard>
      </div>

      {errorMess && !isModalOpen && (
        <div className="alert alert-danger">
          <span>{errorMess}</span>
        </div>
      )}

      {/* Advanced search row */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or SKU... (press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
        </div>
        
        <button className="btn btn-secondary btn-sm" onClick={fetchProducts}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="card products-card-base">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  {(can('Products', 'update') || can('Products', 'delete')) && <th className="products-actions-header">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((prod) => (
                    <tr key={prod._id}>
                      <td className="products-sku-text">{prod.sku}</td>
                      <td className="products-name-text">{prod.name}</td>
                      <td className="products-desc-text">{prod.description || 'N/A'}</td>
                      <td>₹{prod.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${prod.stock === 0 ? 'badge-danger' : prod.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      
                      {/* Action buttons conditional rendering */}
                      {(can('Products', 'update') || can('Products', 'delete')) && (
                        <td className="products-actions-cell">
                          <div className="products-actions-flex">
                            <PermissionGuard module="Products" action="update">
                              <button
                                className="btn btn-secondary btn-sm products-action-btn-sm"
                                onClick={() => openEditModal(prod)}
                              >
                                <Edit2 size={13} />
                              </button>
                            </PermissionGuard>
                            
                            <PermissionGuard module="Products" action="delete">
                              <button
                                className="btn btn-danger btn-sm products-action-btn-sm"
                                onClick={() => handleDeleteProduct(prod._id, prod.sku)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '40px', color: 'var(--gray-500)' }}>
                      No products matching search queries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination */}
          {pagination.pages > 1 && (
            <div className="products-pagination-row">
              <span className="products-pagination-label">
                Showing page <b>{pagination.page}</b>. Page total: {pagination.pages}
              </span>
              <div className="products-pagination-btns">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insert Form Modal window */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalType === 'create' ? 'Add New Product' : 'Edit Product'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {errorMess && (
                  <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                    <span>{errorMess}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Product Code (SKU)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g., PROD-SHIRT-M"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    required
                    disabled={modalType === 'edit'} // Disable SKU editing for safety standard
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g., Cotton Plain T-Shirt"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-control products-modal-textarea"
                    placeholder="Enter details about this item..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="products-modal-2col">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Details...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
