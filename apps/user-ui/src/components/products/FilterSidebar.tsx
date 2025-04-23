'use client';

import { useState } from 'react';
import { Sliders as Slider, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for filters
  const categories = [
    { id: 'electronics', name: 'Electronics', count: 120 },
    { id: 'fashion', name: 'Fashion', count: 85 },
    { id: 'home-kitchen', name: 'Home & Kitchen', count: 74 },
    { id: 'sports-fitness', name: 'Sports & Fitness', count: 43 },
    { id: 'beauty', name: 'Beauty', count: 32 },
    { id: 'toys', name: 'Toys', count: 21 },
    { id: 'books', name: 'Books', count: 15 },
  ];

  const colors = [
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'red', name: 'Red', hex: '#FF0000' },
    { id: 'green', name: 'Green', hex: '#00FF00' },
    { id: 'blue', name: 'Blue', hex: '#0000FF' },
    { id: 'yellow', name: 'Yellow', hex: '#FFFF00' },
    { id: 'white', name: 'White', hex: '#FFFFFF' },
  ];

  const brands = [
    { id: 'apple', name: 'Apple', count: 32 },
    { id: 'samsung', name: 'Samsung', count: 28 },
    { id: 'nike', name: 'Nike', count: 24 },
    { id: 'adidas', name: 'Adidas', count: 22 },
    { id: 'sony', name: 'Sony', count: 18 },
    { id: 'lg', name: 'LG', count: 15 },
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const index = parseInt(e.target.dataset.index || '0', 10);
    
    const newPriceRange = [...priceRange];
    newPriceRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > priceRange[1]) {
      newPriceRange[0] = priceRange[1];
    } else if (index === 1 && value < priceRange[0]) {
      newPriceRange[1] = priceRange[0];
    }
    
    setPriceRange(newPriceRange);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Price Filter</h2>
      
      <FilterSection title="Price Range">
        <div className="flex items-center mb-4">
          <input
            type="range"
            min={0}
            max={1199}
            value={priceRange[0]}
            data-index={0}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            type="range"
            min={0}
            max={1199}
            value={priceRange[1]}
            data-index={1}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between">
          <span>${priceRange[0]}</span>
          <span>-</span>
          <span>${priceRange[1]}</span>
        </div>
        <button className="mt-3 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Apply
        </button>
      </FilterSection>

      <FilterSection title="Categories">
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 text-gray-700 flex-1">
                {category.name}
              </label>
              <span className="text-gray-400 text-sm">{category.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Filter by Color">
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center">
              <input
                type="checkbox"
                id={`color-${color.id}`}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`color-${color.id}`} className="ml-2 flex items-center">
                <span 
                  className="w-4 h-4 inline-block mr-2 rounded-full border border-gray-300" 
                  style={{ backgroundColor: color.hex }}
                ></span>
                <span className="text-gray-700">{color.name}</span>
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brands">
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2 max-h-44 overflow-y-auto">
          {brands
            .filter(brand => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((brand) => (
              <div key={brand.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`brand-${brand.id}`}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`brand-${brand.id}`} className="ml-2 text-gray-700 flex-1">
                  {brand.name}
                </label>
                <span className="text-gray-400 text-sm">{brand.count}</span>
              </div>
            ))}
        </div>
      </FilterSection>

      <div className="mt-6 space-y-3">
        <button className="w-full py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
          Apply Filters
        </button>
        <button className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
          Clear All
        </button>
      </div>
    </div>
  );
}