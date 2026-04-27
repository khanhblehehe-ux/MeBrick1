// components/EditProductForm.jsx
"use client";

import { useState, useEffect } from "react";

export default function EditProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        description: product.description || "",
        category: product.category || "",
        stock: product.stock || "",
        image: product.image || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProduct = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        id: product.id,
      };
      
      onSubmit(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    form: {
      padding: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#374151',
      fontSize: '0.875rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.95rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.95rem',
      backgroundColor: 'white',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.95rem',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
    },
    submitButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    cancelButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitButtonDisabled: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#9ca3af',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'not-allowed',
    },
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Product Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
          placeholder="Enter product name"
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Stock *</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">Select category</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home & Garden">Home & Garden</option>
          <option value="Sports">Sports</option>
          <option value="Books">Books</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          style={styles.textarea}
          placeholder="Enter product description"
          rows="4"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Image URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          style={styles.input}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div style={styles.buttonGroup}>
        <button 
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          style={loading ? styles.submitButtonDisabled : styles.submitButton}
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </div>
    </form>
  );
}