import { useState, useEffect,  useRef } from 'react';
import { FaShoppingCart, FaStar, FaHeart, FaSearch, FaChevronDown } from 'react-icons/fa';
import { useCart } from '../../Context/CartContext';
import { API_BASE_URL } from '../../config';
import './Products.css';



const SizeSelector = ({ sizes, selectedSize, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector('.size-option.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        dropdownRef.current.scrollTop = dropdownRef.current.scrollHeight;
      }
    }
  }, [isOpen]);

  return (
    <div className="size-select-container">
      <div 
        className="size-select-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSize || 'Select size'}
        <span className={`dropdown-icon ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="size-dropdown" ref={dropdownRef}>
          {sizes.map((size) => (
            <div
              key={size}
              className={`size-option ${selectedSize === size ? 'selected' : ''}`}
              onClick={() => {
                onSelect(size);
                setIsOpen(false);
              }}
            >
              {size}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Products = () => {
  const { cart, addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [openSizeDropdowns, setOpenSizeDropdowns] = useState({});
  const [viewProduct, setViewProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [designDetails, setDesignDetails] = useState({});

  useEffect(() => {
    setIsVisible(true);
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Fetch all collections for display
    const fetchCollectionsAndProducts = async () => {
      try {
        const collectionsRes = await fetch(`${API_BASE_URL}/admin/collections`);
        let collectionsData;
        try {
          collectionsData = await collectionsRes.json();
        } catch (err) {
          const text = await collectionsRes.text();
          console.error('Collections fetch error:', text);
          throw new Error('Collections API did not return JSON');
        }
        if (collectionsRes.ok && collectionsData.collections) {
          setCollections(collectionsData.collections);
          // If a collection is selected, fetch its products
          if (selectedCollection) {
            const productsRes = await fetch(`${API_BASE_URL}/admin/collections/${selectedCollection.id}/products`);
            let productsData;
            try {
              productsData = await productsRes.json();
            } catch (err) {
              const text = await productsRes.text();
              console.error('Products fetch error:', text);
              throw new Error('Products API did not return JSON');
            }
            if (productsRes.ok && productsData.products) {
              const mappedProducts = productsData.products.map(prod => ({
                id: prod.id,
                name: prod.name,
                price: prod.price || 7.00,
                description: prod.description || '',
                image: prod.images && prod.images.length > 0
                  ? (prod.images[0].image_url.startsWith('/uploads')
                      ? API_BASE_URL.replace(/\/api$/, '') + prod.images[0].image_url
                      : prod.images[0].image_url)
                  : '',
                rating: 4.5,
                colors: prod.colors
                  ? (Array.isArray(prod.colors) ? prod.colors : prod.colors.split(',').map(c => c.trim()).filter(Boolean))
                  : [],
                availableColors: prod.colors
                  ? (Array.isArray(prod.colors) ? prod.colors : prod.colors.split(',').map(c => c.trim()).filter(Boolean))
                  : [],
                sizes: prod.sizes
                  ? (Array.isArray(prod.sizes) ? prod.sizes : prod.sizes.split(',').map(s => s.trim()).filter(Boolean))
                  : [],
                category: selectedCollection.name || 'products',
                isDesign: false
              }));
              setProducts(mappedProducts);
            } else {
              setProducts([]);
            }
          } else {
            setProducts([]);
          }
        }
      } catch (e) {
        // Ignore fetch errors for now
      }
    };
    fetchCollectionsAndProducts();

    const initialOptions = {};
    products.forEach(product => {
      initialOptions[product.id] = {
        colors: [product.availableColors[0]],
        size: product.sizes[0]
      };
    });
    setSelectedOptions(initialOptions);
  }, [products]);

  const handleColorSelection = (productId, color) => {
    setSelectedOptions(prev => {
      if (!productId) return prev;
      
      const currentProductOptions = prev[productId] || {};
      const currentColors = currentProductOptions.colors || [];
      
      const newColors = currentColors.includes(color)
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      
      return {
        ...prev,
        [productId]: {
          ...currentProductOptions,
          colors: newColors
        }
      };
    });
  };

  const handleSizeSelection = (productId, size) => {
    setSelectedOptions(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        size
      }
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleAddToCart = async (product) => {
    const selectedColors = selectedOptions[product.id]?.colors || [product.availableColors[0]];
    const selectedSize = selectedOptions[product.id]?.size || product.sizes[0];
    const result = await addToCart({
      ...product,
      selectedColors,
      selectedSize,
      quantity: 1,
      price: product.price,
      originalPrice: product.price,
      type: "product"
    });
    if (result === false) {
      setNotification({ message: 'You have to login or sign up to add items to cart.', type: 'error' });
      return;
    }
    // Check for selected design in localStorage
    const selectedDesign = JSON.parse(localStorage.getItem('selectedDesign'));
    if (selectedDesign) {
      await addToCart({
        ...selectedDesign,
        linkedProductId: product.id,
        type: "design",
        selectedSize: null,
        selectedColors: [],
      });
    }
  };

  // Fetch design details when a product is viewed
  useEffect(() => {
    if (viewProduct && viewProduct.design_id) {
      fetch(`${API_BASE_URL}/admin/designs/${viewProduct.design_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.design) {
            setDesignDetails(data.design);
            setSelectedOptions(prev => ({
              ...prev,
              [viewProduct.id]: {
                ...(prev[viewProduct.id] || {}),
                placement: data.design.placement || '',
                description: data.design.description || ''
              }
            }));
          }
        });
    }
  }, [viewProduct]);

  return (
    <div className={`products-page ${isVisible ? 'visible' : ''}`}> 
      <div className="collection-gradient-backdrop"></div>
      <div className="products-header">
        <h1 className="products-title">Discover Our Collection</h1>
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      <div className="products-content">
        {notification && (
          <div className="add-to-cart-popup">
            <div className="popup-content">
              <p>{notification.message}</p>
            </div>
          </div>
        )}

        {/* Floating gold elements */}
        <div className="floating-elements">
          {[...Array(19)].map((_, i) => (
            <div 
              key={i}
              className="floating-element"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 25}s`,
                animationDelay: `-${Math.random() * 20}s`,
                width: `${Math.random() * 100 + 80}px`,
                height: `${Math.random() * 100 + 160}px`
              }}
            />
          ))}
        </div>
        {/* LANDING: Show only two collection bubbles in a card */}
        {!selectedCollection ? (
          <div className="collection-card">
            {collections.slice(0, 2).map((col, index) => (
              <div
                key={col.id}
                className={`bubble-card ${col.featured ? 'featured-bubble' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bubble-image-container">
                  {col.image_url ? (
                    <img
                      src={col.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + col.image_url : col.image_url}
                      alt={col.name}
                      className="bubble-image"
                    />
                  ) : (
                    <div className="bubble-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>No Image</div>
                  )}
                </div>
                <div className="bubble-content">
                  <h3>{col.name}</h3>
                  <p>{col.description}</p>
                  <button 
                    className="bubble-view-button"
                    onClick={() => setSelectedCollection(col)}
                  >
                    View Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : viewProduct ? (
          <div className="product-details-modal">
            <div className="product-details-content">
              <div className="product-details-left">
                <div className="product-details-image">
                  {viewProduct.image ? (
                    <img src={viewProduct.image} alt={viewProduct.name} />
                  ) : (
                    <div className="bubble-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24, width: '100%', height: '100%' }}>No Image</div>
                  )}
                </div>
              </div>
              <div className="product-details-right">
                <h2>{viewProduct.name}</h2>
                <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 8, fontSize: 22 }}>₦{Number(viewProduct.price || 0).toFixed(2)}</div>
                <p style={{ color: '#aaa', marginBottom: 16 }}>{viewProduct.description}</p>
                <button className="luxury-button" onClick={() => { 
                  handleAddToCart({
                    ...viewProduct
                  }); 
                  setViewProduct(null); 
                }}>
                  <FaShoppingCart style={{ marginRight: 6 }} /> Add to Cart
                </button>
                <button className="luxury-button" style={{ background: '#222', color: '#FFD700', border: '1px solid #FFD700', marginLeft: 12 }} onClick={() => setViewProduct(null)}>Close</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="back-to-collections-wrapper">
            <button className="bubble-view-button" style={{ background: '#222', color: '#FFD700', border: '1px solid #FFD700', minHeight: 48 }} onClick={() => setSelectedCollection(null)}>
              ← Back to Collections
            </button>
            <div className="products-scroll-card">
              <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: 28, margin: '0 0 1.5rem 0', textAlign: 'center' }}>{selectedCollection?.name}</h2>
              <div className="bubble-grid-horizontal">
                {products.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No products in this collection.</div>
                ) : (
                  products.map((product, index) => (
                    <div
                      key={product.id}
                      className={`bubble-card`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="bubble-image-container">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="bubble-image"
                          />
                        ) : (
                          <div className="bubble-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>No Image</div>
                        )}
                        <button 
                          className="bubble-favorite-button"
                          onClick={() => toggleFavorite(product.id)}
                          aria-label="Add to favorites"
                        >
                          <FaHeart />
                        </button>
                      </div>
                      <div className="bubble-content">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 8 }}>₦{Number(product.price || 0).toFixed(2)}</div>
                        {/* Render sizes as buttons */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div style={{ margin: '8px 0' }}>
                            <strong>Sizes: </strong>
                            {product.sizes.map((size, i) => (
                              <button
                                key={i}
                                style={{
                                  marginRight: 6,
                                  padding: '2px 10px',
                                  borderRadius: 4,
                                  border: '1px solid #FFD700',
                                  background: '#fff',
                                  color: '#bfa14a',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleSizeSelection(product.id, size)}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Render colors as buttons */}
                        {product.availableColors && product.availableColors.length > 0 && (
                          <div style={{ margin: '8px 0' }}>
                            <strong>Colors: </strong>
                            {product.availableColors.map((color, i) => (
                              <button
                                key={i}
                                style={{
                                  marginRight: 6,
                                  padding: '2px 10px',
                                  borderRadius: 4,
                                  border: '1px solid #FFD700',
                                  background: '#fff',
                                  color: '#bfa14a',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleColorSelection(product.id, color)}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        )}
                        <button 
                          className="bubble-view-button"
                          onClick={() => {
                            setViewProduct(product);
                            setSelectedOptions(prev => ({
                              ...prev,
                              [product.id]: {
                                ...(prev[product.id] || {}),
                                customDescription: prev[product.id]?.customDescription || ''
                              }
                            }));
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;