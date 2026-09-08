"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FilterState } from "@/lib/types";
import { INITIAL_FILTER_STATE } from "@/lib/filters";

interface FilterContextType {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  removeFilter: (key: keyof FilterState) => void;
  isApplied: boolean;
  applyFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = "tsa_analytics_filters_v1";

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Load persistent filter state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save persistent filter state on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // Ignore localStorage errors
    }
  }, [filters]);

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      // Cascading logic: If State changes, reset Airport unless selected airport belongs to new state
      if (key === "state" && value !== prev.state) {
        updated.airport = "All";
      }
      return updated;
    });
  };

  const removeFilter = (key: keyof FilterState) => {
    setFilter(key, "All");
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    setIsApplied(false);
  };

  const applyFilters = () => {
    setIsApplied(true);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilter,
        resetFilters,
        removeFilter,
        isApplied,
        applyFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}
