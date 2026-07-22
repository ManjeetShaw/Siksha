import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  return (
    <FilterContext.Provider value={{ activeFilter, setActiveFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);