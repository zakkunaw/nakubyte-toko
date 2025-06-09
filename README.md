# 🛒 Nakubyte Toko - E-Commerce Web Application

Modern e-commerce platform built with Next.js, Firebase, and TypeScript. Features a complete admin panel for product management and supports multiple product images.

## ✨ Features

### 🏪 Customer Features
- **Product Catalog**: Browse products by categories (Gaming, Office, Mobile)
- **Multiple Images**: View up to 4 images per product with thumbnail navigation
- **Product Search**: Filter products by subcategories (Mouse, Keyboard, Headset, etc.)
- **Product Details**: Detailed product pages with markdown description support
- **Order System**: Simple order form with WhatsApp integration
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 👨‍💼 Admin Features
- **Admin Authentication**: Secure Firebase authentication
- **Product Management**: Add, edit, and delete products
- **Multiple Image Upload**: Support for URL links and file uploads (max 4 images)
- **Order Management**: View and manage customer orders
- **Real-time Sync**: Firebase Firestore integration for real-time data
- **Category System**: Organized product categorization

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Material Icons**: Google Material Icons throughout the app
- **Image Gallery**: Interactive image viewer with zoom functionality
- **Loading States**: Smooth loading animations and states
- **Error Handling**: Graceful error handling and user feedback

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Material Icons
- **Backend**: Firebase (Firestore, Authentication)
- **Image Handling**: Next.js Image optimization
- **UI Components**: Custom components with Lucide React icons
- **Markdown**: React Markdown for product descriptions

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nakubyte-toko.git
cd nakubyte-toko
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Firebase**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Setup Admin Account**
   - Go to Firebase Console > Authentication
   - Create a user with email and password
   - This will be your admin account

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Usage

### Customer Interface
- Browse products on the homepage
- Use category filters to find specific products
- Click on products to view detailed information
- Use the order form or WhatsApp button to make purchases

### Admin Interface
- Access admin panel at `/admin`
- Login with your Firebase credentials
- Add products with multiple images (URLs or file uploads)
- Manage existing products and orders
- View order management at `/admin/orders`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── product/           # Product detail pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── AdminLogin.tsx     # Admin authentication
│   ├── CategoryFilter.tsx # Product filtering
│   ├── Navbar.tsx         # Navigation component
│   ├── OrderForm.tsx      # Customer order form
│   └── ProductCard.tsx    # Product display card
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── data/                  # Static data
│   └── products.ts        # Product data
├── lib/                   # Utilities
│   └── firebase.ts        # Firebase configuration
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

## 🎯 Key Features Implementation

### Multiple Image Support
- Upload up to 4 images per product
- Support for both URL links and file uploads
- Thumbnail navigation on product pages
- Image zoom modal with navigation controls

### Category System
- Three main categories: Gaming, Office, Mobile
- Twelve subcategories for detailed product classification
- Auto-categorization based on subcategory selection

### Admin Panel
- Secure authentication with Firebase
- CRUD operations for products
- Real-time data synchronization
- Order management system

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your environment variables
   - Deploy automatically

### Environment Variables for Production
Add these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🛡️ Security

- Firebase Authentication for admin access
- Environment variables for sensitive data
- Client-side route protection
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling utilities
- Material Design for icon system

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Built with ❤️ for Nakubyte Store**
