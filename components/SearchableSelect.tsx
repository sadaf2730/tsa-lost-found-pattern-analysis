"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  getOptionLabel?: (val: string) => string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  getOptionLabel,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const allOptions = ["All", ...options];
  const filteredOptions = allOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    if (opt === "All") {
      return "all".includes(query);
    }
    const optLower = opt.toLowerCase();
    const labelLower = getOptionLabel ? getOptionLabel(opt).toLowerCase() : optLower;
    return optLower.includes(query) || labelLower.includes(query);
  });

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayValue =
    value === "All" || !value
      ? value || placeholder
      : getOptionLabel
      ? getOptionLabel(value)
      : value;

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-tsa-muted">
        {label}
      </label>

      {/* Select Trigger Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        title={displayValue}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border bg-tsa-surface text-xs text-left transition-all duration-150 ${
          disabled
            ? "opacity-50 cursor-not-allowed border-tsa-border"
            : isOpen
            ? "border-tsa-accent ring-2 ring-tsa-accent/20"
            : value !== "All"
            ? "border-tsa-accent text-tsa-text font-medium"
            : "border-tsa-border text-tsa-text hover:border-tsa-accent/50"
        }`}
      >
        <span className="truncate pr-2">{displayValue}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-tsa-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-tsa-accent" : ""
          }`}
        />
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-tsa-surface border border-tsa-border shadow-lg p-2 flex flex-col gap-2 max-h-64 animate-in fade-in zoom-in-95">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-tsa-muted absolute left-2.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md bg-tsa-bg border border-tsa-border text-tsa-text focus:outline-none focus:border-tsa-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-tsa-muted hover:text-tsa-text"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-44 space-y-0.5 pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                const optDisplayLabel =
                  opt === "All" ? "All" : getOptionLabel ? getOptionLabel(opt) : opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    title={optDisplayLabel}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-tsa-primary/20 text-tsa-accent font-semibold"
                        : "text-tsa-text hover:bg-tsa-bg"
                    }`}
                  >
                    <span className="truncate">{optDisplayLabel}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-tsa-accent shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-tsa-muted">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
