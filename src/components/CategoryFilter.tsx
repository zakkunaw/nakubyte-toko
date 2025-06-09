'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

// Material Icons Component
const MaterialIcon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => (
  <span className={`material-icons ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

export default function CategoryFilter({ onCategoryChange, selectedCategory }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Updated categories to match Product subcategory types
  const categories = [
    { id: 'all', name: 'Semua Produk', icon: 'apps', count: 0 },
    { id: 'mouse', name: 'Mouse', icon: 'mouse', count: 0 },
    { id: 'keyboard', name: 'Keyboard', icon: 'keyboard', count: 0 },
    { id: 'headset', name: 'Audio', icon: 'headphones', count: 0 },
    { id: 'computer', name: 'PC & Laptop', icon: 'computer', count: 0 },
    { id: 'laptop', name: 'Laptop', icon: 'laptop', count: 0 },
    { id: 'webcam', name: 'Webcam', icon: 'videocam', count: 0 },
    { id: 'monitor', name: 'Monitor', icon: 'desktop_windows', count: 0 },
    { id: 'speaker', name: 'Speaker', icon: 'volume_up', count: 0 },
    { id: 'microphone', name: 'Microphone', icon: 'mic', count: 0 },
    { id: 'powerbank', name: 'Power Bank', icon: 'battery_charging_full', count: 0 },
    { id: 'cable', name: 'Cable', icon: 'cable', count: 0 },
    { id: 'storage', name: 'Storage', icon: 'storage', count: 0 },
  ];
  
  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === selectedCategory) || categories[0];
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCategory = getCurrentCategory();

  return (
    <>
      {/* Add Material Icons to head */}
      <link 
        href="https://fonts.googleapis.com/icon?family=Material+Icons" 
        rel="stylesheet"
      />
      
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <Filter size={18} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  <MaterialIcon name={currentCategory.icon} size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">{currentCategory.name}</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 mb-1">
                      Filter Kategori Produk
                    </div>
                    {categories.map((category) => {
                      const isActive = category.id === selectedCategory;

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <MaterialIcon 
                            name={category.icon} 
                            size={20} 
                            className={isActive ? 'text-blue-600' : 'text-gray-500'} 
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right side info */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MaterialIcon name="tune" size={16} />
                <span>Filter Produk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}