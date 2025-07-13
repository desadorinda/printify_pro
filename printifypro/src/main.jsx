import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CartProvider } from './Context/CartContext';
import App from './App';
import './index.css';

// Create the router with future flags enabled
const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <CartProvider>
        <App />
      </CartProvider>
    ),
  }
], {
  future: {
    // Enable all v7 future flags
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_normalizeFormMethod: true
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);