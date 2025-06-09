import { Product } from '@/types';

export const products: Product[] = [
  // Gaming Peripherals
  {
    id: '1',
    name: 'Gaming Mouse RGB Pro X1',
    price: 150000,
    image: '/images/mouse1.jpg',
    description: 'Mouse gaming RGB dengan sensor precision tinggi, cocok untuk gaming competitive',
    stock: 25,
    category: 'gaming'
  },
  {
    id: '2',
    name: 'Mechanical Keyboard RGB',
    price: 280000,
    image: '/images/keyboard1.jpg',
    description: 'Keyboard mechanical RGB dengan switch blue tactile untuk gaming dan typing',
    stock: 15,
    category: 'gaming'
  },
  {
    id: '3',
    name: 'Gaming Headset Surround',
    price: 220000,
    image: '/images/headset1.jpg',
    description: 'Headset gaming 7.1 surround sound dengan mic noise cancelling',
    stock: 30,
    category: 'gaming'
  },
  
  // Office & Productivity
  {
    id: '4',
    name: 'Wireless Mouse Ergonomic',
    price: 85000,
    image: '/images/mouse2.jpg',
    description: 'Mouse wireless ergonomis premium untuk produktivitas maksimal',
    stock: 40,
    category: 'office'
  },
  {
    id: '5',
    name: 'Webcam 1080p Full HD',
    price: 195000,
    image: '/images/webcam1.jpg',
    description: 'Webcam 1080p dengan auto focus untuk meeting dan streaming',
    stock: 20,
    category: 'office'
  },
  {
    id: '6',
    name: 'USB Hub 7-Port',
    price: 65000,
    image: '/images/usbhub1.jpg',
    description: 'USB Hub 7 port dengan LED indicator dan fast charging support',
    stock: 50,
    category: 'office'
  },

  // Mobile & Accessories
  {
    id: '7',
    name: 'Power Bank 20000mAh',
    price: 125000,
    image: '/images/powerbank1.jpg',
    description: 'Power bank fast charging 20000mAh dengan dual output USB-C & USB-A',
    stock: 35,
    category: 'mobile'
  },
  {
    id: '8',
    name: 'Wireless Charger Stand',
    price: 75000,
    image: '/images/charger1.jpg',
    description: 'Wireless charger stand 15W dengan cooling fan untuk HP Android & iPhone',
    stock: 25,
    category: 'mobile'
  },
  {
    id: '9',
    name: 'Phone Holder Adjustable',
    price: 35000,
    image: '/images/holder1.jpg',
    description: 'Phone holder adjustable untuk desk, kompatibel dengan semua ukuran HP',
    stock: 60,
    category: 'mobile'
  }
];