import React, { createContext, useContext, useState, useCallback } from 'react';

const SelfCareAreaContext = createContext();

export function SelfCareAreaProvider({ children }) {
  const [userAreas, setUserAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // This function can be called from anywhere to refresh areas
  const refreshAreas = useCallback(async (fetchAreasFn) => {
    setIsLoading(true);
    try {
      const areas = await fetchAreasFn();
      setUserAreas(areas);
    } catch (e) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SelfCareAreaContext.Provider value={{ userAreas, setUserAreas, isLoading, refreshAreas }}>
      {children}
    </SelfCareAreaContext.Provider>
  );
}

export function useSelfCareAreas() {
  return useContext(SelfCareAreaContext);
} 