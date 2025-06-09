'use client';

import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

// Material Icons Component
const MaterialIcon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => (
  <span className={`material-icons ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

// Category configurations - same as in admin page
const CATEGORIES = {
  gaming: { 
    label: 'Gaming', 
    icon: 'sports_esports',
    color: 'bg-red-100 text-red-800'
  },
  office: { 
    label: 'Office', 
    icon: 'business',
    color: 'bg-blue-100 text-blue-800'
  },
  mobile: { 
    label: 'Mobile', 
    icon: 'smartphone',
    color: 'bg-green-100 text-green-800'
  }
};

// Subcategory configurations
const SUBCATEGORIES = {
  mouse: { label: 'Mouse', icon: 'mouse', color: 'bg-purple-100 text-purple-800' },
  keyboard: { label: 'Keyboard', icon: 'keyboard', color: 'bg-indigo-100 text-indigo-800' },
  headset: { label: 'Headset', icon: 'headphones', color: 'bg-pink-100 text-pink-800' },
  webcam: { label: 'Webcam', icon: 'videocam', color: 'bg-yellow-100 text-yellow-800' },
  monitor: { label: 'Monitor', icon: 'desktop_windows', color: 'bg-cyan-100 text-cyan-800' },
  speaker: { label: 'Speaker', icon: 'volume_up', color: 'bg-orange-100 text-orange-800' },
  microphone: { label: 'Microphone', icon: 'mic', color: 'bg-teal-100 text-teal-800' },
  powerbank: { label: 'Power Bank', icon: 'battery_charging_full', color: 'bg-emerald-100 text-emerald-800' },
  cable: { label: 'Cable', icon: 'cable', color: 'bg-gray-100 text-gray-800' },
  storage: { label: 'Storage', icon: 'storage', color: 'bg-slate-100 text-slate-800' },
  computer: { label: 'Computer', icon: 'computer', color: 'bg-blue-100 text-blue-800' },
  laptop: { label: 'Laptop', icon: 'laptop', color: 'bg-violet-100 text-violet-800' }
};

export default function ProductCard({ product, onOrder }: ProductCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onOrder(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  // Check if image is external URL or local path
  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const mainImage = images[0] || '';
  const isExternalImage = mainImage?.startsWith('http');
  const imageSrc = imageError || !mainImage ? '/images/placeholder.png' : mainImage;
  return (
    <>
      {/* Add Material Icons to head */}
      <link 
        href="https://fonts.googleapis.com/icon?family=Material+Icons" 
        rel="stylesheet"
      />
      
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      >        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {!imageError && mainImage && isExternalImage ? (
            // Use regular img tag for external images to avoid Next.js restrictions
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            // Use Next.js Image for local images
            <Image
              src={imageSrc}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              priority={false}
            />
          )}
          
          {/* Multiple images indicator */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <MaterialIcon name="collections" size={12} />
              {images.length}
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <MaterialIcon name="image_not_supported" size={32} className="mb-2" />
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}
        </div>
          <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {/* Show subcategory badge if available, otherwise show main category */}
            {product.subcategory && SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES] ? (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].color
              }`}>
                <MaterialIcon 
                  name={SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].icon} 
                  size={14} 
                />
                {SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].label}
              </span>
            ) : product.category && CATEGORIES[product.category as keyof typeof CATEGORIES] ? (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                CATEGORIES[product.category as keyof typeof CATEGORIES].color
              }`}>
                <MaterialIcon 
                  name={CATEGORIES[product.category as keyof typeof CATEGORIES].icon} 
                  size={14} 
                />
                {CATEGORIES[product.category as keyof typeof CATEGORIES].label}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                <MaterialIcon 
                  name="category" 
                  size={14} 
                />
                General
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            </div>
            
            <button
              onClick={handleOrderClick}
              disabled={product.stock === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
              title={product.stock === 0 ? 'Out of stock' : 'Quick order'}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}