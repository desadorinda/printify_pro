// context/DesignContext.jsx
import React, { createContext, useState, useContext } from 'react';

const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const [selectedDesigns, setSelectedDesigns] = useState([]);

  const addDesign = (design) => {
    setSelectedDesigns([...selectedDesigns, design]);
  };

  const removeDesign = (designId) => {
    setSelectedDesigns(selectedDesigns.filter(design => design.id !== designId));
  };

  return (
    <DesignContext.Provider value={{ selectedDesigns, addDesign, removeDesign }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesigns = () => useContext(DesignContext);