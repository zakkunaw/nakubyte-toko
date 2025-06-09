'use client';

import { useState } from 'react';
import { Product, Order } from '@/types';
import { X, Package, User, Phone, MapPin, CreditCard, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface OrderFormProps {
  product: Product;
  onClose: () => void;
}

interface FormData {
  customerName: string;
  whatsapp: string;
  address: string;
  quantity: number;
}

interface FormErrors {
  customerName?: string;
  whatsapp?: string;
  address?: string;
}

export default function OrderForm({ product, onClose }: OrderFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    whatsapp: '',
    address: '',
    quantity: 1
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Detail Produk', icon: Package },
    { id: 2, title: 'Data Customer', icon: User },
    { id: 3, title: 'Pembayaran', icon: CreditCard }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/#{1,6}\s?/g, '')       // Remove headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/^\s*[-\*\+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '')   // Remove numbered list
      .trim();
  };

  const cleanDescription = stripMarkdown(product.description);

  // Validasi form yang kuat
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validasi nama lengkap
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nama lengkap wajib diisi';
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = 'Nama lengkap minimal 3 karakter';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.customerName.trim())) {
      newErrors.customerName = 'Nama hanya boleh berisi huruf dan spasi';
    }

    // Validasi WhatsApp
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else {
      const cleanedWhatsapp = formData.whatsapp.replace(/[\s\-\(\)]/g, '');
      if (!/^[0-9]+$/.test(cleanedWhatsapp)) {
        newErrors.whatsapp = 'Nomor WhatsApp hanya boleh berisi angka';
      } else if (cleanedWhatsapp.length < 10 || cleanedWhatsapp.length > 15) {
        newErrors.whatsapp = 'Nomor WhatsApp tidak valid (10-15 digit)';
      } else if (!cleanedWhatsapp.startsWith('08') && !cleanedWhatsapp.startsWith('628') && !cleanedWhatsapp.startsWith('62')) {
        newErrors.whatsapp = 'Nomor WhatsApp harus dimulai dengan 08 atau 62';
      }
    }

    // Validasi alamat
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat lengkap wajib diisi';
    } else if (formData.address.trim().length < 20) {
      newErrors.address = 'Alamat terlalu singkat, minimal 20 karakter';
    } else if (formData.address.trim().length > 500) {
      newErrors.address = 'Alamat terlalu panjang, maksimal 500 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    if (currentStep === 2) {
      if (!validateForm()) {
        toast.error('Mohon lengkapi semua data dengan benar');
        return;
      }
      // Clear errors when validation passes
      setErrors({});
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Mohon periksa kembali data yang Anda masukkan');
      return;
    }

    setLoading(true);

    try {
      // Format nomor WhatsApp
      let cleanWhatsapp = formData.whatsapp.replace(/[\s\-\(\)]/g, '');
      if (cleanWhatsapp.startsWith('0')) {
        cleanWhatsapp = '62' + cleanWhatsapp.substring(1);
      } else if (!cleanWhatsapp.startsWith('62')) {
        cleanWhatsapp = '62' + cleanWhatsapp;
      }

      const order: Omit<Order, 'id'> = {
        customerName: formData.customerName.trim(),
        whatsapp: cleanWhatsapp,
        address: formData.address.trim(),
        product: product,
        quantity: formData.quantity,
        totalPrice: product.price * formData.quantity,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'orders'), order);
      
      // Fixed WhatsApp message without problematic emojis
      const whatsappMessage = `*PESANAN BARU - NakuByte Store*

*PRODUK:*
${product.name}
${formatPrice(product.price)} x ${formData.quantity} unit

*TOTAL PEMBAYARAN:*
${formatPrice(product.price * formData.quantity)}

*DATA CUSTOMER:*
Nama: ${formData.customerName.trim()}
WhatsApp: ${formData.whatsapp}
Alamat: ${formData.address.trim()}

*REKENING TRANSFER:*
• BCA: 1234567890 a.n. NakuByte Store
• BRI: 0987654321 a.n. NakuByte Store

*LANGKAH SELANJUTNYA:*
1. Transfer sesuai total di atas
2. Screenshot bukti transfer
3. Kirim bukti ke nomor ini
4. Barang akan diproses dan dikirim

Terima kasih sudah berbelanja di NakuByte!`;

      const whatsappUrl = `https://wa.me/6285864139786?text=${encodeURIComponent(whatsappMessage)}`;
      
      toast.success('Pesanan berhasil! Mengarahkan ke WhatsApp...');
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return true;
      case 2: {
        // Check if all required fields are filled and valid (don't rely on errors object)
        const hasValidName = formData.customerName.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(formData.customerName.trim());
        const cleanedWhatsapp = formData.whatsapp.replace(/[\s\-\(\)]/g, '');
        const hasValidWhatsapp = cleanedWhatsapp.length >= 10 && cleanedWhatsapp.length <= 15 && /^[0-9]+$/.test(cleanedWhatsapp) &&
          (cleanedWhatsapp.startsWith('08') || cleanedWhatsapp.startsWith('628') || cleanedWhatsapp.startsWith('62'));
        const hasValidAddress = formData.address.trim().length >= 20 && formData.address.trim().length <= 500;
        
        return hasValidName && hasValidWhatsapp && hasValidAddress;
      }
      case 3: return true;
      default: return false;
    }
  };

  // Handle form data changes and clear related errors
  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field being edited
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selesaikan Pesanan</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Ikuti langkah berikut untuk menyelesaikan pembelian</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {currentStep > step.id ? (
                    <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </div>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p className={`text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Langkah {step.id}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-20 h-0.5 mx-3 sm:mx-6 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          {/* Mobile step indicator */}
          <div className="sm:hidden text-center mt-2">
            <p className="text-xs text-gray-600">
              Langkah {currentStep}: {steps.find(s => s.id === currentStep)?.title}
            </p>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900">Detail Produk</h3>
                
                {/* Product Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Product Image */}
                    <div className="lg:col-span-1">
                      <div className="aspect-square bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-sm mx-auto lg:max-w-none">
                        {product.image ? (
                          product.image.startsWith('http') ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                      <div class="text-center text-gray-400">
                                        <div class="text-4xl mb-2">📦</div>
                                        <p class="text-sm">No Image</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                      <div class="text-center text-gray-400">
                                        <div class="text-4xl mb-2">📦</div>
                                        <p class="text-sm">No Image</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center text-gray-400">
                              <div className="text-4xl mb-2">📦</div>
                              <p className="text-sm">No Image Available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{product.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                            product.category === 'gaming' ? 'bg-red-100 text-red-800' :
                            product.category === 'office' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {product.category === 'gaming' ? '🎮' : product.category === 'office' ? '💼' : '📱'} {product.category}
                          </span>
                          <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full font-medium">
                            Stok: {product.stock} unit
                          </span>
                        </div>
                      </div>
                      
                      {/* Description with Show More/Less */}
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {showFullDescription ? cleanDescription : truncateDescription(cleanDescription)}
                        </p>
                        {cleanDescription.length > 100 && (
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium mt-2 flex items-center gap-1"
                          >
                            {showFullDescription ? (
                              <>
                                Tampilkan lebih sedikit <ChevronUp size={12} className="sm:w-[14px] sm:h-[14px]" />
                              </>
                            ) : (
                              <>
                                Selengkapnya <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Jumlah Pesanan
                  </label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 text-base sm:text-lg"
                  >
                    {Array.from({length: Math.min(product.stock, 10)}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} unit</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Subtotal:</span>
                    <span className="text-lg sm:text-2xl font-bold text-blue-600">
                      {formatPrice(product.price * formData.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customer Information */}
          {currentStep === 2 && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900">Informasi Customer</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-700">
                    <User size={16} />
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({...formData, customerName: e.target.value});
                      if (errors.customerName) {
                        setErrors({...errors, customerName: undefined});
                      }
                    }}
                    className={`w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-base ${
                      errors.customerName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Masukkan nama lengkap Anda"
                  />
                  {errors.customerName && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.customerName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-700">
                    <Phone size={16} />
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="085864139786"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      setFormData({...formData, whatsapp: e.target.value});
                      if (errors.whatsapp) {
                        setErrors({...errors, whatsapp: undefined});
                      }
                    }}
                    className={`w-full p-3 sm:p-4 border rounded-lg focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 text-base ${
                      errors.whatsapp ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {errors.whatsapp && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.whatsapp}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Kami akan mengirim konfirmasi pesanan ke nomor ini</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-700">
                  <MapPin size={16} />
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({...formData, address: e.target.value});
                    if (errors.address) {
                      setErrors({...errors, address: undefined});
                    }
                  }}
                  className={`w-full p-3 sm:p-4 border rounded-lg focus:ring-2 transition-all bg-white text-gray-900 placeholder-gray-400 text-base ${
                    errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos
Contoh: Jl. Sudirman No. 123, RT 01/RW 02, Kelurahan Menteng, Kecamatan Menteng, Jakarta Pusat 10310"
                />
                {errors.address && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    {errors.address}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Alamat minimal 20 karakter, maksimal 500 karakter
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Confirmation */}
          {currentStep === 3 && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900">Konfirmasi & Pembayaran</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Left Column - Order Summary & Customer Info */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Order Summary */}
                  <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white">
                    <h4 className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Ringkasan Pesanan</h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Produk:</span>
                        <span className="font-medium text-gray-900 text-right flex-1 ml-2">{product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah:</span>
                        <span className="text-gray-900">{formData.quantity} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga Satuan:</span>
                        <span className="text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                      <div className="border-t pt-2 sm:pt-3 flex justify-between font-bold text-base sm:text-lg">
                        <span className="text-gray-900">Total Pembayaran:</span>
                        <span className="text-blue-600">{formatPrice(product.price * formData.quantity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white">
                    <h4 className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Informasi Pengiriman</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div><span className="text-gray-600">Nama:</span> <span className="font-medium text-gray-900">{formData.customerName}</span></div>
                      <div><span className="text-gray-600">WhatsApp:</span> <span className="font-medium text-gray-900">{formData.whatsapp}</span></div>
                      <div><span className="text-gray-600">Alamat:</span> <span className="font-medium text-gray-900 break-words">{formData.address}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Payment Instructions */}
                <div className="bg-green-50 border border-green-200 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="text-green-600" size={20} />
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Petunjuk Pembayaran</h4>
                  </div>
                  <div className="text-xs sm:text-sm space-y-3 sm:space-y-4 text-gray-700">
                    <p className="font-medium text-gray-900">Silakan transfer ke salah satu rekening berikut:</p>
                    <div className="space-y-3">
                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🏦</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">Bank BCA</span>
                        </div>
                        <p className="text-xs sm:text-sm"><strong>No. Rekening:</strong> 1234567890</p>
                        <p className="text-xs sm:text-sm"><strong>Atas Nama:</strong> NakuByte Store</p>
                      </div>
                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🏦</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">Bank BRI</span>
                        </div>
                        <p className="text-xs sm:text-sm"><strong>No. Rekening:</strong> 0987654321</p>
                        <p className="text-xs sm:text-sm"><strong>Atas Nama:</strong> NakuByte Store</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-green-300">
                      <p className="font-medium text-green-800 mb-3 text-xs sm:text-sm">📋 Langkah-langkah setelah transfer:</p>
                      <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1 sm:space-y-2 text-green-700">
                        <li>Transfer sesuai total pembayaran di atas</li>
                        <li>Screenshot bukti transfer dari aplikasi bank</li>
                        <li>Kirim bukti transfer melalui WhatsApp</li>
                        <li>Pesanan akan diproses dan dikirim setelah pembayaran dikonfirmasi</li>
                      </ol>
                      <div className="mt-3 p-2 sm:p-3 bg-green-100 rounded text-xs text-green-800">
                        💡 <strong>Tips:</strong> Pastikan transfer sesuai nominal tepat untuk mempercepat verifikasi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-3 sm:gap-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all text-sm sm:text-base ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <ArrowLeft size={16} />
            Sebelumnya
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-lg transition-all text-sm sm:text-base ${
                isStepValid(currentStep)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Selanjutnya
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !isStepValid(2)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 text-sm sm:text-base"
            >
              {loading ? '⏳ Memproses...' : '💬 Kirim ke WhatsApp'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}