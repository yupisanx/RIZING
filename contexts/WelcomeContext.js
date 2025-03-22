import React, { createContext, useContext, useState } from 'react';

const WelcomeContext = createContext({});

export const useWelcome = () => useContext(WelcomeContext);

export const WelcomeProvider = ({ children }) => {
  const [showingWelcome, setShowingWelcome] = useState(false);

  const value = {
    showingWelcome,
    setShowingWelcome,
  };

  return (
    <WelcomeContext.Provider value={value}>
      {children}
    </WelcomeContext.Provider>
  );
}; 