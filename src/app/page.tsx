'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Toaster } from 'react-hot-toast';
import { Product } from '@/types';
import { products as localProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import OrderForm from '@/components/OrderForm';
import Navbar from '@/components/Navbar';
import CategoryFilter from '@/components/CategoryFilter';
import { Shield, Truck, CreditCard, Phone, Clock, MapPin, Star, Gamepad2, Monitor, Smartphone, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

// Add Material Icons Component
const MaterialIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => (
  <span className={`material-icons ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

// Add Counter Animation Component
const AnimatedCounter = ({ 
  target, 
  suffix = "", 
  duration = 2000 
}: { 
  target: number; 
  suffix?: string; 
  duration?: number; 
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const startTime = Date.now();
          const startCount = 0;
          
          const updateCount = () => {
            const currentTime = Date.now();
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(startCount + (target - startCount) * easeOutCubic);
            
            setCount(currentCount);
            
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };
          
          updateCount();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${target}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span id={`counter-${target}`} className="inline-block">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(true);
  // Add FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch products from Firebase on page load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from Firebase...');
        const querySnapshot = await getDocs(collection(db, 'products'));
        console.log('Query result:', querySnapshot.size, 'documents');
        
        if (querySnapshot.empty) {
          console.log('No products found in Firebase, using local products');
          setProducts(localProducts);
        } else {
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          console.log('Firebase products loaded:', productsData.length);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update filter logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      // Check subcategory instead of category
      matchesCategory = product.subcategory === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'all': return 'All Products';
      case 'mouse': return 'Mouse Gaming & Office';
      case 'keyboard': return 'Keyboard & Mechanical';
      case 'headset': return 'Audio & Headphones';
      case 'computer': return 'PC & Laptop';
      case 'accessories': return 'Tech Accessories';
      default: return 'Products';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24">
      <Toaster position="top-right" />
      
      {/* Add Material Icons to head */}
      <link 
        href="https://fonts.googleapis.com/icon?family=Material+Icons" 
        rel="stylesheet"
      />
      
      {/* Navbar without categories */}
      <Navbar onSearchChange={setSearchTerm} />
      
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden -mt-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Logo - Fixed */}
              <div className="mb-8">
                <img 
                  src="/nakubytetext.png" 
                  alt="NakuByte" 
                  className="h-16 mb-4"
                />
                <p className="text-blue-200 font-medium tracking-wide">TOKO TEKNOLOGI TERPERCAYA</p>
              </div>
              
              {/* Hero Title */}
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Aksesoris
                </span>
                <br />
                <span className="text-white">Gaming &</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Teknologi
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
                Tingkatkan performa gaming dan produktivitas Anda dengan aksesoris premium berkualitas tinggi. 
                Dari mouse gaming presisi hingga keyboard mechanical - masa depan teknologi ada di sini.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <MaterialIcon name="shopping_bag" size={24} />
                    <span className="text-lg">Jelajahi Produk</span>
                    <MaterialIcon name="arrow_forward" size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <a
                  href="https://wa.me/6285864139786"
                  className="group border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm bg-white/5 hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-3">
                    <MaterialIcon name="chat" size={24} />
                    <span className="text-lg">Konsultasi Gratis</span>
                  </div>
                </a>
              </div>
              
              {/* Animated Stats */}
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    <AnimatedCounter target={5} suffix="K+" duration={2000} />
                  </div>
                  <div className="text-blue-200 text-sm">Customer Puas</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    <AnimatedCounter target={200} suffix="+" duration={2500} />
                  </div>
                  <div className="text-blue-200 text-sm">Produk Premium</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    <AnimatedCounter target={99} suffix="%" duration={2200} />
                  </div>
                  <div className="text-blue-200 text-sm">Kepuasan</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Feature Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { 
                    icon: 'verified_user', 
                    title: 'Produk Autentik', 
                    desc: 'Garansi resmi',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: 'local_shipping', 
                    title: 'Pengiriman Cepat', 
                    desc: 'Gratis ongkir 200k+',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: 'payment', 
                    title: 'Pembayaran Aman', 
                    desc: 'Berbagai pilihan',
                    color: 'from-purple-500 to-violet-500'
                  },
                  { 
                    icon: 'support_agent', 
                    title: 'Support 24/7', 
                    desc: 'Siap membantu Anda',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <MaterialIcon name={feature.icon} size={24} className="text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-blue-200 text-sm">{feature.desc}</p>
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-300 animate-bounce">
          <MaterialIcon name="keyboard_arrow_down" size={32} />
        </div>
      </section>


      
      {/* Category Filter below banner */}
      <CategoryFilter 
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* Main Content */}
      <main id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
            {getCategoryTitle(selectedCategory)}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              {filteredProducts.length > 0 
                ? `${filteredProducts.length} produk ditemukan` 
                : 'Tidak ada produk ditemukan'
              }
              {searchTerm && <span> untuk "{searchTerm}"</span>}
            </p>
            
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat semua produk →
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onOrder={setSelectedProduct} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">Produk tidak ditemukan</h2>
            <p className="text-gray-500 mb-4">Coba kata kunci lain atau lihat kategori berbeda</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </main>

      {/* Modern Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MaterialIcon name="stars" size={18} />
              <span>Testimoni Customer</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Kata Mereka Tentang <span className="text-blue-600">NakuByte</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ribuan customer telah merasakan pengalaman berbelanja yang memuaskan bersama kami. 
              Ini adalah beberapa cerita mereka.
            </p>
          </div>
          
          {/* Testimonial Cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                name: "Andi Pratama",
                role: "Professional Gamer",
                company: "Team RRQ",
                content: "Mouse gaming dari NakuByte bener-bener game changer! Response time-nya incredible, ergonomisnya perfect untuk marathon gaming. Build quality premium tapi harganya masih masuk akal. Definitely recommended untuk para gamers!",
                rating: 5,
                avatar: "👨‍💻",
                bgColor: "from-blue-500 to-purple-600",
                product: "Gaming Mouse Pro X"
              },
              {
                name: "Sarah Chen",
                role: "Content Creator",
                company: "@sarahtech",
                content: "Headset yang saya beli suaranya crystal clear banget, perfect untuk streaming dan recording. Noise cancellation-nya juga top! Yang paling impressed adalah customer service-nya yang super responsive dan helpful.",
                rating: 5,
                avatar: "👩‍🎨",
                bgColor: "from-pink-500 to-rose-600",
                product: "Wireless Headset Studio"
              },
              {
                name: "Rizki Maulana",
                role: "Senior Developer",
                company: "Tokopedia",
                content: "Keyboard mechanical-nya amazing untuk coding daily! Tactile feedback-nya pas banget, nggak terlalu loud tapi satisfying. Build quality solid, packaging rapi, dan shipping cepet banget. Will definitely order again!",
                rating: 5,
                avatar: "👨‍💼",
                bgColor: "from-green-500 to-teal-600",
                product: "Mechanical Keyboard RGB"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient Accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${testimonial.bgColor}`}></div>
                
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <MaterialIcon name="format_quote" size={40} className="text-gray-400" />
                </div>
                
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <MaterialIcon key={i} name="star" size={20} className="text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600">5.0</span>
                </div>
                
                {/* Testimonial Content */}
                <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>
                
                {/* Product Badge */}
                <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mb-6">
                  <MaterialIcon name="shopping_bag" size={14} />
                  <span>{testimonial.product}</span>
                </div>
                
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${testimonial.bgColor} flex items-center justify-center text-2xl shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 font-medium">{testimonial.role}</p>
                    <p className="text-blue-600 text-sm font-medium">{testimonial.company}</p>
                  </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
              </div>
            ))}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5.0</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <MaterialIcon key={i} name="star" size={16} className="text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Rating Rata-rata</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Siap Bergabung dengan Ribuan Customer Puas?
              </h3>
              <p className="text-gray-600 mb-6">
                Dapatkan pengalaman berbelanja tech accessories terbaik dan rasakan kepuasan seperti mereka!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="shopping_cart" size={20} />
                  Mulai Belanja Sekarang
                </button>
                <a
                  href="https://wa.me/6285864139786"
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="chat" size={20} />
                  Tanya Customer Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Popular Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MaterialIcon name="category" size={18} />
              <span>Kategori Produk</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pilih <span className="text-blue-600">Kategori Favorit</span> Anda
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Temukan aksesoris teknologi yang tepat sesuai kebutuhan dan aktivitas digital Anda sehari-hari
            </p>
          </div>
          
          {/* Category Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { 
                name: 'Gaming Mouse', 
                icon: 'mouse', 
                category: 'mouse', 
                count: '50+',
                description: 'Presisi tinggi untuk gaming',
                bgColor: 'from-red-500 to-pink-600',
                iconBg: 'bg-red-100 text-red-600'
              },
              { 
                name: 'Keyboard', 
                icon: 'keyboard', 
                category: 'keyboard', 
                count: '30+',
                description: 'Mechanical & membrane',
                bgColor: 'from-blue-500 to-indigo-600',
                iconBg: 'bg-blue-100 text-blue-600'
              },
              { 
                name: 'Audio', 
                icon: 'headphones', 
                category: 'headset', 
                count: '40+',
                description: 'Headset & earphones',
                bgColor: 'from-purple-500 to-violet-600',
                iconBg: 'bg-purple-100 text-purple-600'
              },
              { 
                name: 'Webcam', 
                icon: 'videocam', 
                category: 'webcam', 
                count: '15+',
                description: 'HD video streaming',
                bgColor: 'from-green-500 to-emerald-600',
                iconBg: 'bg-green-100 text-green-600'
              },
              { 
                name: 'Speaker', 
                icon: 'volume_up', 
                category: 'speaker', 
                count: '25+',
                description: 'Audio berkualitas tinggi',
                bgColor: 'from-orange-500 to-amber-600',
                iconBg: 'bg-orange-100 text-orange-600'
              },
              { 
                name: 'Power Bank', 
                icon: 'battery_charging_full', 
                category: 'powerbank', 
                count: '20+',
                description: 'Portable charger',
                bgColor: 'from-teal-500 to-cyan-600',
                iconBg: 'bg-teal-100 text-teal-600'
              }
            ].map((cat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 overflow-hidden cursor-pointer"
                onClick={() => setSelectedCategory(cat.category)}
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${cat.iconBg} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <MaterialIcon name={cat.icon} size={28} />
                  </div>
                  
                  {/* Floating Badge */}
                  <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${cat.bgColor} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                    {cat.count}
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {cat.description}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                    <span>Lihat Produk</span>
                    <MaterialIcon name="arrow_forward" size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                {/* Bottom Accent Line */}
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${cat.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </div>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MaterialIcon name="verified" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Original</h4>
                  <p className="text-sm text-gray-600">100% Produk Asli</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MaterialIcon name="local_shipping" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fast Delivery</h4>
                  <p className="text-sm text-gray-600">Pengiriman Cepat</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MaterialIcon name="security" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Warranty</h4>
                  <p className="text-sm text-gray-600">Garansi Resmi</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MaterialIcon name="support_agent" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Support</h4>
                  <p className="text-sm text-gray-600">24/7 Customer Care</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Tidak menemukan kategori yang Anda cari?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => setSelectedCategory('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <MaterialIcon name="apps" size={20} />
                Lihat Semua Produk
              </button>
              <a
                href="https://wa.me/6285864139786"
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MaterialIcon name="chat" size={20} />
                Konsultasi Product
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* Modern FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MaterialIcon name="help_outline" size={18} />
              <span>FAQ</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Temukan jawaban untuk pertanyaan yang sering ditanyakan oleh customer kami
            </p>
          </div>
          
          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
              q: "Apakah semua produk bergaransi resmi?",
              a: "Ya, semua produk yang kami jual 100% original dan bergaransi resmi dari distributor resmi Indonesia. Kami bekerja sama dengan brand-brand ternama seperti Logitech, Razer, SteelSeries, dan lainnya untuk memastikan keaslian produk."
              },
              {
              q: "Berapa lama proses pengiriman?",
              a: "Untuk area Jabodetabek: 1-2 hari kerja. Untuk area Jawa: 2-3 hari kerja. Untuk luar Jawa: 3-5 hari kerja. Kami menggunakan ekspedisi terpercaya seperti JNE, J&T, dan SiCepat untuk memastikan produk sampai dengan aman."
              },
              {
              q: "Apakah bisa COD (Cash on Delivery)?",
              a: "Untuk sementara kami belum melayani COD. Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BRI, BNI) dan e-wallet (OVO, DANA, GoPay, ShopeePay) untuk menjaga keamanan transaksi kedua belah pihak."
              },
              {
              q: "Bagaimana jika produk yang diterima rusak atau tidak sesuai?",
              a: "Kami menerima retur/tukar barang dalam 7 hari setelah produk diterima jika terdapat kerusakan atau cacat produksi, dengan catatan wajib menyertakan video unboxing tanpa jeda dan bukti-bukti kuat lainnya. Silakan hubungi customer service kami melalui WhatsApp dengan menyertakan foto produk dan bukti pembelian."
              },
              {
              q: "Apakah tersedia konsultasi produk sebelum membeli?",
              a: "Tentu! Tim customer service kami siap membantu Anda memilih produk yang sesuai dengan kebutuhan dan budget. Hubungi kami melalui WhatsApp untuk konsultasi gratis."
              },
              {
              q: "Bagaimana cara mengecek status pengiriman?",
              a: "Setelah produk dikirim, Anda akan mendapat nomor resi yang bisa ditrack melalui website ekspedisi yang bersangkutan. Kami juga akan mengirimkan update status pengiriman via WhatsApp."
              }
            ].map((faq, index) => (
              <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                {faq.q}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-300 ${
                openFaq === index ? 'bg-blue-600 rotate-180' : 'hover:bg-blue-200'
                }`}>
                <MaterialIcon 
                  name="keyboard_arrow_down" 
                  size={20} 
                  className={openFaq === index ? 'text-white' : 'text-blue-600'} 
                />
                </div>
              </button>
              
              {/* Answer Content */}
              <div className={`px-6 transition-all duration-300 ease-in-out ${
                openFaq === index 
                ? 'pb-6 opacity-100 max-h-96' 
                : 'pb-0 opacity-0 max-h-0 overflow-hidden'
              }`}>
                <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-700 leading-relaxed">
                  {faq.a}
                </p>
                </div>
              </div>
              </div>
            ))}
          </div>
          
          {/* Additional Help Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MaterialIcon name="support_agent" size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Masih Ada Pertanyaan?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Tim customer service kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/6285864139786"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="chat" size={20} />
                  Chat WhatsApp
                </a>
                <a
                  href="tel:+6285864139786"
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="phone" size={20} />
                  Telepon Langsung
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            
            {/* Newsletter Section */}
            <div className="md:col-span-2">
              <div className="max-w-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Newsletter Kami</h4>
                <p className="text-gray-600 mb-6 text-sm">
                  Dapatkan update produk terbaru, promo eksklusif, dan tips teknologi langsung ke email Anda.
                </p>
                
                {/* Newsletter Form */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-sm">
                    Subscribe
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-6">
                  Dengan berlangganan, Anda setuju dengan{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> kami dan memberikan consent untuk menerima update dari perusahaan kami.
                </p>
                
                {/* Social Media Icons */}
                <div className="flex gap-3">
                  <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors group">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors group">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com/nakubyte" className="w-8 h-8 bg-gray-200 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors group">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/6285864139786" className="w-8 h-8 bg-gray-200 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors group">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.106"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Pages Links */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Pages</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    About us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6285864139786" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Services</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Web Development
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    UI/UX Design
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Data & Analytics
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Enterprise
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Startup
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    Ecommerce
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Additional Projects Section */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <Image src="/nakubytetext.png" alt="NakuByte" width={160} height={40} className="h-10 w-auto mb-4" />
                <p className="text-gray-600 text-sm max-w-lg">
                  Toko teknologi terpercaya untuk mouse gaming & aksesoris komputer berkualitas tinggi dengan harga terbaik dan pelayanan memuaskan.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Projects</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      Bank Al Etihad
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      WP Engine
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      Android Authority
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      Amplifidor
                    </button>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Kontak</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2 text-blue-600" /> 
                    0858-6413-9786
                  </li>
                  <li className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2 text-blue-600" /> 
                    09:00 - 21:00 WIB
                  </li>
                  <li className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2 text-blue-600" /> 
                    Seluruh Indonesia
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                ©2025 <span className="font-semibold">NakuByte</span>. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {selectedProduct && <OrderForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}