'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { products as localProducts } from '@/data/products';
import OrderForm from '@/components/OrderForm';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Material Icons Component
const MaterialIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => (
  <span className={`material-icons ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

// Add this component
const MarkdownRenderer = dynamic(() => import('react-markdown'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-20 rounded"></div>
});

// Category configurations
const CATEGORIES = {
  gaming: { 
    label: 'Gaming', 
    icon: 'sports_esports',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  office: { 
    label: 'Office', 
    icon: 'business',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  mobile: { 
    label: 'Mobile', 
    icon: 'smartphone',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  }
};

// Subcategory configurations
const SUBCATEGORIES = {
  mouse: { label: 'Mouse', icon: 'mouse', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  keyboard: { label: 'Keyboard', icon: 'keyboard', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  headset: { label: 'Headset', icon: 'headphones', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  webcam: { label: 'Webcam', icon: 'videocam', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  monitor: { label: 'Monitor', icon: 'desktop_windows', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  speaker: { label: 'Speaker', icon: 'volume_up', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  microphone: { label: 'Microphone', icon: 'mic', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  powerbank: { label: 'Power Bank', icon: 'battery_charging_full', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cable: { label: 'Cable', icon: 'cable', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  storage: { label: 'Storage', icon: 'storage', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  computer: { label: 'Computer', icon: 'computer', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  laptop: { label: 'Laptop', icon: 'laptop', color: 'bg-blue-50 text-blue-700 border-blue-200' }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        // Try Firebase first
        const docRef = doc(db, 'products', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          // Fallback to local products
          const localProduct = localProducts.find(p => p.id === params.id);
          if (localProduct) {
            setProduct(localProduct);
          } else {
            toast.error('Product not found');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to local products
        const localProduct = localProducts.find(p => p.id === params.id);
        if (localProduct) {
          setProduct(localProduct);
        } else {
          toast.error('Product not found');
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('📋 Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <button 
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Add Material Icons to head */}
      <link 
        href="https://fonts.googleapis.com/icon?family=Material+Icons" 
        rel="stylesheet"
      />
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share product"
              >
                <MaterialIcon name="share" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Layout */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Top Section - Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image Display */}              <div 
                className="relative aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => setShowImageModal(true)}
              >
                {(() => {
                  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
                  const currentImage = images[selectedImage] || images[0];
                  
                  if (currentImage) {
                    return currentImage.startsWith('http') ? (
                      <img
                        src={currentImage}
                        alt={`${product.name} - Image ${selectedImage + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                    ) : (
                      <Image
                        src={currentImage}
                        alt={`${product.name} - Image ${selectedImage + 1}`}
                        width={600}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                    );
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                          <MaterialIcon name="image_not_supported" size={48} className="mb-4 opacity-50" />
                          <p className="font-medium">No Image Available</p>
                        </div>
                      </div>
                    );
                  }                })()}
                
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MaterialIcon name="zoom_in" size={20} className="text-gray-600" />
                </div>
                
                {/* Image counter */}
                {(() => {
                  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
                  return images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedImage + 1} / {images.length}
                    </div>
                  );
                })()}              </div>
              
              {/* Thumbnail Images */}
              {(() => {
                const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
                return images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
                          selectedImage === index 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-full">
                          {image.startsWith('http') ? (
                            <img
                              src={image}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                          ) : (
                            <Image
                              src={image}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              width={120}
                              height={120}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                          )}
                        </div>
                        {/* Overlay untuk selected image */}
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg"></div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })()}
              
              {/* Click to zoom hint */}
              <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                <MaterialIcon name="touch_app" size={16} />
                Click image to zoom
              </p>
            </div>

            {/* Product Info & Purchase */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {/* Show subcategory badge if available, otherwise show main category */}
                  {product.subcategory && SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES] ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${
                      SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].color
                    }`}>
                      <MaterialIcon 
                        name={SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].icon} 
                        size={16} 
                      />
                      {SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES].label}
                    </span>
                  ) : product.category && CATEGORIES[product.category as keyof typeof CATEGORIES] ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${
                      CATEGORIES[product.category as keyof typeof CATEGORIES].color
                    }`}>
                      <MaterialIcon 
                        name={CATEGORIES[product.category as keyof typeof CATEGORIES].icon} 
                        size={16} 
                      />
                      {CATEGORIES[product.category as keyof typeof CATEGORIES].label}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border bg-gray-50 text-gray-700 border-gray-200">
                      <MaterialIcon name="category" size={16} />
                      Product
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MaterialIcon name="inventory" size={20} className="text-blue-600" />
                  Stock Availability
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                    product.stock > 20 ? 'bg-green-50 text-green-700 border-green-200' :
                    product.stock > 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    product.stock > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <MaterialIcon 
                      name={product.stock > 0 ? "check_circle" : "cancel"} 
                      size={16} 
                    />
                    {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                  </span>
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="text-orange-600 text-sm font-medium flex items-center gap-1">
                      <MaterialIcon name="warning" size={16} />
                      Almost sold out!
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <MaterialIcon name="verified" size={24} className="text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">Garansi Resmi</p>
                  <p className="text-xs text-gray-600">1 Tahun</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <MaterialIcon name="local_shipping" size={24} className="text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">Free Shipping</p>
                  <p className="text-xs text-gray-600">Min. 200k</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <MaterialIcon name="payment" size={24} className="text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">Payment Mudah</p>
                  <p className="text-xs text-gray-600">Transfer Bank</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowOrderForm(true)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 hover:bg-blue-900 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:cursor-not-allowed shadow-sm"
                >
                  <MaterialIcon name={product.stock > 0 ? "shopping_cart" : "remove_shopping_cart"} size={24} />
                  <span className="text-lg">
                    {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
                  </span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/6285864139786?text=Halo, saya tertarik dengan produk ${product.name}`}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MaterialIcon name="chat" size={20} />
                    <span>WhatsApp</span>
                  </a>
                  <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <MaterialIcon name="favorite_border" size={20} />
                    <span>Wishlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Full Width Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <MaterialIcon name="description" size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Product Description
              </h2>
            </div>
            <div className="prose prose-gray prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed">
                <MarkdownRenderer 
                  components={{                    h1: ({...props}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6" {...props} />,
                    h2: ({...props}) => <h2 className="text-xl font-bold text-gray-900 mb-3 mt-5" {...props} />,
                    h3: ({...props}) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4" {...props} />,
                    p: ({...props}) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
                    li: ({...props}) => <li className="text-gray-700" {...props} />,
                    strong: ({...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: ({...props}) => <em className="italic text-gray-700" {...props} />,
                    a: ({...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                    code: ({...props}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />,
                    blockquote: ({...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4" {...props} />,
                  }}
                >
                  {product.description}
                </MarkdownRenderer>
              </div>
            </div>
          </div>
        </div>        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <MaterialIcon name="close" size={32} />
              </button>
              
              {(() => {
                const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
                const currentImage = images[selectedImage] || images[0];
                
                return (
                  <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                    {/* Navigation buttons for multiple images */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                        >
                          <MaterialIcon name="chevron_left" size={24} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                        >
                          <MaterialIcon name="chevron_right" size={24} />
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
                        {selectedImage + 1} / {images.length}
                      </div>
                    )}
                    
                    {/* Main image */}
                    {currentImage ? (
                      currentImage.startsWith('http') ? (
                        <img
                          src={currentImage}
                          alt={`${product.name} - Image ${selectedImage + 1}`}
                          className="max-w-full max-h-[80vh] object-contain"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <Image
                          src={currentImage}
                          alt={`${product.name} - Image ${selectedImage + 1}`}
                          width={800}
                          height={800}
                          className="max-w-full max-h-[80vh] object-contain"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )
                    ) : (
                      <div className="w-96 h-96 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                          <MaterialIcon name="image_not_supported" size={48} className="mb-4 opacity-50" />
                          <p className="font-medium">No Image Available</p>
                        </div>
                      </div>
                    )}
                      {/* Thumbnail navigation */}
                    {images.length > 1 && (
                      <div className="bg-gray-100 p-4">
                        <div className="flex justify-center gap-3 overflow-x-auto max-w-md mx-auto">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(index);
                              }}
                              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                                selectedImage === index 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className="w-full h-full relative">
                                {image.startsWith('http') ? (
                                  <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {showOrderForm && (
          <OrderForm 
            product={product} 
            onClose={() => setShowOrderForm(false)} 
          />
        )}
      </div>
    </>
  );
}