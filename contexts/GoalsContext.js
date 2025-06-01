import React, { createContext, useContext, useState, useCallback } from 'react';

const GoalsContext = createContext();

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  // This function can be called from anywhere to refresh goals
  const refreshGoals = useCallback(async (fetchGoalsFn) => {
    setIsLoadingGoals(true);
    try {
      const fetchedGoals = await fetchGoalsFn();
      setGoals(fetchedGoals);
    } catch (e) {
      // handle error
    } finally {
      setIsLoadingGoals(false);
    }
  }, []);

  return (
    <GoalsContext.Provider value={{ goals, setGoals, isLoadingGoals, refreshGoals }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  return useContext(GoalsContext);
} 