'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products as localProducts } from '@/data/products';
import { Product } from '@/types';
import { Plus, Edit, Trash2, Save, X, Upload, Download, RefreshCw, LogOut, User, Package } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import AdminLogin from '@/components/AdminLogin';

// Types untuk form data - Updated to use subcategory as main category
interface ProductFormData {
  name: string;
  price: number;
  description: string;
  stock: number;
  category: 'gaming' | 'office' | 'mobile'; // Keep for data structure compatibility
  subcategory: 'mouse' | 'keyboard' | 'headset' | 'webcam' | 'monitor' | 'speaker' | 'microphone' | 'powerbank' | 'cable' | 'storage' | 'computer' | 'laptop' | '';
  image: string; // Keep for backward compatibility
  images: string[]; // New field for multiple images
}

// Type-safe subcategory validation
type ValidSubcategory = 'mouse' | 'keyboard' | 'headset' | 'webcam' | 'monitor' | 'speaker' | 'microphone' | 'powerbank' | 'cable' | 'storage' | 'computer' | 'laptop';

const isValidSubcategory = (value: string): value is ValidSubcategory => {
  return ['mouse', 'keyboard', 'headset', 'webcam', 'monitor', 'speaker', 'microphone', 'powerbank', 'cable', 'storage', 'computer', 'laptop'].includes(value);
};

const validateSubcategory = (subcategory: string): ValidSubcategory | undefined => {
  if (!subcategory || subcategory.trim() === '') return undefined;
  return isValidSubcategory(subcategory) ? subcategory : undefined;
};

// Dynamic import untuk MDEditor agar tidak error di SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
});

// Category configurations dengan Google Material Icons
const CATEGORIES = {
  gaming: { 
    label: 'Gaming', 
    icon: 'sports_esports',
    color: 'bg-red-100 text-red-800',
    description: 'Gaming Peripherals & Accessories'
  },
  office: { 
    label: 'Office', 
    icon: 'business',
    color: 'bg-blue-100 text-blue-800',
    description: 'Office Equipment & Productivity Tools'
  },
  mobile: { 
    label: 'Mobile', 
    icon: 'smartphone',
    color: 'bg-green-100 text-green-800',
    description: 'Mobile Accessories & Gadgets'
  }
};

// Subcategory configurations untuk filtering detail
const SUBCATEGORIES = {
  mouse: { 
    label: 'Mouse', 
    icon: 'mouse',
    color: 'bg-purple-100 text-purple-800',
    parentCategory: 'gaming'
  },
  keyboard: { 
    label: 'Keyboard', 
    icon: 'keyboard',
    color: 'bg-indigo-100 text-indigo-800',
    parentCategory: 'gaming'
  },
  headset: { 
    label: 'Headset', 
    icon: 'headphones',
    color: 'bg-pink-100 text-pink-800',
    parentCategory: 'gaming'
  },
  webcam: { 
    label: 'Webcam', 
    icon: 'videocam',
    color: 'bg-yellow-100 text-yellow-800',
    parentCategory: 'office'
  },
  monitor: { 
    label: 'Monitor', 
    icon: 'desktop_windows',
    color: 'bg-cyan-100 text-cyan-800',
    parentCategory: 'office'
  },
  speaker: { 
    label: 'Speaker', 
    icon: 'volume_up',
    color: 'bg-orange-100 text-orange-800',
    parentCategory: 'office'
  },
  microphone: { 
    label: 'Microphone', 
    icon: 'mic',
    color: 'bg-teal-100 text-teal-800',
    parentCategory: 'office'
  },
  powerbank: { 
    label: 'Power Bank', 
    icon: 'battery_charging_full',
    color: 'bg-emerald-100 text-emerald-800',
    parentCategory: 'mobile'
  },
  cable: { 
    label: 'Cable', 
    icon: 'cable',
    color: 'bg-gray-100 text-gray-800',
    parentCategory: 'mobile'
  },
  storage: { 
    label: 'Storage', 
    icon: 'storage',
    color: 'bg-slate-100 text-slate-800',
    parentCategory: 'office'
  },
  computer: { 
    label: 'Computer', 
    icon: 'computer',
    color: 'bg-blue-100 text-blue-800',
    parentCategory: 'office'
  },
  laptop: { 
    label: 'Laptop', 
    icon: 'laptop',
    color: 'bg-violet-100 text-violet-800',
    parentCategory: 'office'
  }
};

// Material Icons Component
const MaterialIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => (
  <span className={`material-icons ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);  const [editingProduct, setEditingProduct] = useState<Product | null>(null);  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    description: '',
    stock: 0,
    category: 'gaming',
    subcategory: '', // Now required, user must select one
    image: '', // Keep for backward compatibility
    images: [] // New field for multiple images
  });

  const { user, loading: authLoading, logout, isAdmin } = useAuth();

  // Load data from Firebase on component mount
  useEffect(() => {
    fetchFromFirebase();
  }, []);

  // Fetch products from Firebase
  const fetchFromFirebase = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
      
      if (productsData.length > 0) {
        toast.success(`✅ Loaded ${productsData.length} products from Firebase`);
      } else {
        toast('No products found in Firebase. Consider syncing local data.');
      }
    } catch (error) {
      console.error('Error fetching from Firebase:', error);
      toast.error('❌ Failed to load from Firebase');
      setProducts(localProducts);
    } finally {
      setLoading(false);
    }
  };
  // Sync local products to Firebase (one-time setup)
  const syncToFirebase = async () => {
    setLoading(true);
    try {
      let syncCount = 0;
      
      for (const product of localProducts) {
        const productData: any = {
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          stock: product.stock,
          category: product.category
        };
        
        // Only include subcategory if it exists and is not undefined
        if (product.subcategory) {
          productData.subcategory = product.subcategory;
        }
        
        await setDoc(doc(db, 'products', product.id), productData);
        syncCount++;
      }
      
      toast.success(`✅ Synced ${syncCount} products to Firebase!`);
      await fetchFromFirebase();
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      toast.error('❌ Failed to sync to Firebase');    } finally {
      setLoading(false);
    }
  };
  // Add new product - Always sync to Firebase
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validatedSubcategory = validateSubcategory(formData.subcategory);
        // Ensure subcategory is selected
      if (!validatedSubcategory) {
        toast.error('❌ Please select a category!');
        setLoading(false);
        return;
      }
      
      // Ensure at least one image is provided
      if (formData.images.length === 0 && !formData.image) {
        toast.error('❌ Please add at least one product image!');
        setLoading(false);
        return;
      }
      
      const productData: any = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        stock: formData.stock,
        category: formData.category,
        image: formData.images[0] || formData.image || '', // Use first image or fallback to single image
        images: formData.images.length > 0 ? formData.images : [formData.image].filter(Boolean), // Include images array
        subcategory: validatedSubcategory // Always include since it's required
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      const newProduct: Product = {
        id: docRef.id,
        ...productData
      };
      setProducts(prev => [...prev, newProduct]);
      
      toast.success('✅ Product added successfully!');
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('❌ Failed to add product');
    } finally {
      setLoading(false);    }
  };
  // Update product - Always sync to Firebase
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    try {
      const validatedSubcategory = validateSubcategory(formData.subcategory);
        // Ensure subcategory is selected
      if (!validatedSubcategory) {
        toast.error('❌ Please select a category!');
        setLoading(false);
        return;
      }
      
      // Ensure at least one image is provided
      if (formData.images.length === 0 && !formData.image) {
        toast.error('❌ Please add at least one product image!');
        setLoading(false);
        return;
      }
      
      const productData: any = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        stock: formData.stock,
        category: formData.category,
        image: formData.images[0] || formData.image || '', // Use first image or fallback to single image
        images: formData.images.length > 0 ? formData.images : [formData.image].filter(Boolean), // Include images array
        subcategory: validatedSubcategory // Always include since it's required
      };
      
      await updateDoc(doc(db, 'products', editingProduct.id), productData);
      
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
      setProducts(updatedProducts);
      
      toast.success('✅ Product updated successfully!');
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('❌ Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Delete product - Always sync to Firebase
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', productId));
      
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      
      toast.success('✅ Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('❌ Failed to delete product');
    } finally {
      setLoading(false);
    }
  };  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory || '',
      image: product.image,
      images: product.images || [product.image].filter(Boolean) // Convert single image to array or use existing images
    });
  };  const resetForm = () => {
    setFormData({ 
      name: '', 
      price: 0, 
      description: '', 
      stock: 0, 
      category: 'gaming',
      subcategory: '', // Reset to empty, user must select
      image: '',
      images: [] // Reset images array
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Generate products.ts file content
  const generateProductsFile = () => {
    const fileContent = `import { Product } from '@/types';

export const products: Product[] = [
${products.map(product => `  {
    id: '${product.id}',
    name: '${product.name}',
    price: ${product.price},
    image: '${product.image}',
    description: \`${product.description.replace(/`/g, '\\`')}\`,
    stock: ${product.stock},
    category: '${product.category}'
  }`).join(',\n')}
];`;

    const blob = new Blob([fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.ts';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📁 products.ts file downloaded!');
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const handleLogout = async () => {
    if (confirm('Yakin ingin logout dari admin panel?')) {
      await logout();
    }
  };

  return (
    <>
      {/* Add Material Icons to head */}
      <link 
        href="https://fonts.googleapis.com/icon?family=Material+Icons" 
        rel="stylesheet"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header - keep existing */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NakuByte Admin</h1>
              <p className="text-gray-600">Manage your tech products - Auto sync with Firebase</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <User size={14} />
                  {user.email}
                </div>
                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  <MaterialIcon name="cloud" size={14} /> Firebase Connected
                </div>
              </div>
            </div>
            
            {/* Keep existing header buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Add Orders Management Button */}
              <a
                href="/admin/orders"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Package size={14} />
                Orders
              </a>
              
              <button
                onClick={fetchFromFirebase}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Refresh
              </button>
              
              <button
                onClick={syncToFirebase}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <Upload size={14} />
                Sync Local to Firebase
              </button>
              
              <button
                onClick={generateProductsFile}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Download size={14} />
                Download .ts
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={16} />
                Add Product
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Updated Stats with new categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            {Object.entries(CATEGORIES).slice(0, 5).map(([key, category]) => (
              <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MaterialIcon name={category.icon} size={20} className="text-blue-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {products.filter(p => p.category === key).length}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{category.label}</div>
              </div>
            ))}
          </div>

          {/* Add/Edit Form with updated categories */}
          {(showAddForm || editingProduct) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingProduct ? 'Update product information' : 'Fill in the details for your new tech product'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                      placeholder="e.g., Razer DeathAdder V3, Logitech MX Master 3"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Price (IDR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 font-medium">Rp</span>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                        placeholder="150000"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                      placeholder="25"
                      disabled={loading}
                    />
                  </div>                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subcategory}                      onChange={(e) => {
                        const selectedSubcategory = e.target.value as 'mouse' | 'keyboard' | 'headset' | 'webcam' | 'monitor' | 'speaker' | 'microphone' | 'powerbank' | 'cable' | 'storage' | 'computer' | 'laptop' | '';
                        const parentCategory = selectedSubcategory ? SUBCATEGORIES[selectedSubcategory as keyof typeof SUBCATEGORIES]?.parentCategory : 'gaming';
                        setFormData({
                          ...formData, 
                          subcategory: selectedSubcategory,
                          category: parentCategory as 'gaming' | 'office' | 'mobile'
                        })
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      disabled={loading}
                      required
                    >
                      <option value="">Select product category</option>
                      {Object.entries(SUBCATEGORIES).map(([key, subcategory]) => (
                        <option key={key} value={key}>
                          <MaterialIcon name={subcategory.icon} size={16} className="mr-2" />
                          {subcategory.label} ({CATEGORIES[subcategory.parentCategory as keyof typeof CATEGORIES].label})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Choose the specific product category that matches your product
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Parent Category <span className="text-gray-400">(auto-set)</span>
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                      {formData.subcategory ? (
                        <div className="flex items-center gap-2">
                          <MaterialIcon 
                            name={CATEGORIES[SUBCATEGORIES[formData.subcategory as keyof typeof SUBCATEGORIES]?.parentCategory as keyof typeof CATEGORIES]?.icon} 
                            size={16} 
                          />
                          {CATEGORIES[SUBCATEGORIES[formData.subcategory as keyof typeof SUBCATEGORIES]?.parentCategory as keyof typeof CATEGORIES]?.label} - {CATEGORIES[SUBCATEGORIES[formData.subcategory as keyof typeof SUBCATEGORIES]?.parentCategory as keyof typeof CATEGORIES]?.description}
                        </div>
                      ) : (
                        'Select a category first'
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      This is automatically set based on your selected category
                    </p>
                  </div>
                </div>                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Images <span className="text-red-500">*</span> <span className="text-gray-400">(Max 4 images)</span>
                  </label>
                  
                  {/* Display current images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/public/image/placeholder.png';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index);
                              setFormData({
                                ...formData, 
                                images: newImages,
                                image: newImages[0] || '' // Update main image
                              });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 text-center">
                            <span className="text-xs bg-black/50 text-white px-1 rounded">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new image options */}
                  {formData.images.length < 4 && (
                    <div className="space-y-3">
                      {/* URL Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL here..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                          disabled={loading}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const url = input.value.trim();
                              if (url && !formData.images.includes(url)) {
                                const newImages = [...formData.images, url];
                                setFormData({
                                  ...formData, 
                                  images: newImages,
                                  image: newImages[0] // Set first image as main image
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                            const url = input.value.trim();
                            if (url && !formData.images.includes(url)) {
                              const newImages = [...formData.images, url];
                              setFormData({
                                ...formData, 
                                images: newImages,
                                image: newImages[0] // Set first image as main image
                              });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          Add URL
                        </button>
                      </div>

                      {/* File Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              if (formData.images.length < 4) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  if (result && !formData.images.includes(result)) {
                                    const newImages = [...formData.images, result];
                                    setFormData(prev => ({
                                      ...prev, 
                                      images: newImages,
                                      image: newImages[0] // Set first image as main image
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            });
                          }}
                          className="hidden"
                          id="imageUpload"
                          disabled={loading}
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <div className="text-gray-600">
                            <Upload className="mx-auto h-8 w-8 mb-2" />
                            <p className="text-sm font-medium">Choose files or drag & drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                          </div>
                        </label>
                      </div>

                      <p className="text-xs text-gray-500">
                        You can add up to 4 images. The first image will be used as the main product image.
                      </p>
                    </div>
                  )}
                </div>

                {/* Markdown Editor untuk Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <MDEditor
                      value={formData.description}
                      onChange={(val) => setFormData({...formData, description: val || ''})}
                      height={200}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      data-color-mode="light"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Use Markdown syntax to format your description. **Bold**, *italic*, lists, links etc.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table with updated categories */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Products ({products.length}) - Firebase Connected <MaterialIcon name="cloud" size={16} />
              </h3>
            </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategory</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const categoryInfo = CATEGORIES[product.category as keyof typeof CATEGORIES] || CATEGORIES.gaming;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                              {product.description.length > 100 
                                ? product.description.substring(0, 100) + '...' 
                                : product.description}
                            </div>                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${categoryInfo.color}`}>
                            <MaterialIcon name={categoryInfo.icon} size={14} />
                            {categoryInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {product.subcategory ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${
                              SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES]?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              <MaterialIcon 
                                name={SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES]?.icon || 'category'} 
                                size={12} 
                              />
                              {SUBCATEGORIES[product.subcategory as keyof typeof SUBCATEGORIES]?.label || product.subcategory}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 20 ? 'bg-green-100 text-green-800' :
                            product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(product)}
                              className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50"
                              title="Edit Product"
                              disabled={loading}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                              title="Delete Product"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}