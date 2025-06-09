export interface Product {
  id: string;
  name: string;
  price: number;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  description: string;
  stock: number;
  category: 'gaming' | 'office' | 'mobile';
  subcategory?: 'mouse' | 'keyboard' | 'headset' | 'webcam' | 'monitor' | 'speaker' | 'microphone' | 'powerbank' | 'cable' | 'storage' | 'computer' | 'laptop';
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  address: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}