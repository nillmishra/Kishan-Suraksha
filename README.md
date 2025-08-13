# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
"# KishanSuraksha" 

# python setup
.py -3.11 -m venv .venv311
..venv311\Scripts\activate
pip install -r requirements.txt
python .\app.py


kishan-suraksha/
├─ backend/
│  ├─ uploads/
│  ├─ models/
│  │  └─ advanced_rice_leaf_disease_model.h5
│  ├─ app.py
│  └─ requirements.txt
│
├─ server/
│  ├─ uploads/
│  │  └─ products/
│  ├─ data/
│  │  └─ db.json
│  ├─ src/
│  │  ├─ models/
│  │  │  ├─ Order.js
│  │  │  ├─ Product.js
│  │  │  └─ User.js
│  │  ├─ account.js
│  │  ├─ admin.orders.js
│  │  ├─ admin.products.js
│  │  ├─ auth.js
│  │  ├─ db.js
│  │  ├─ orders.js
│  │  ├─ products.js
│  │  └─ server.js
│  ├─ .env
│  ├─ package.json
│  └─ package-lock.json
│
└─ client/
   ├─ public/
   ├─ index.html
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      ├─ assets/
      │  └─ newlogo.png            (and any other images/assets)
      │
      ├─ components/
      │  ├─ Features.jsx
      │  ├─ Footer.jsx
      │  ├─ Hero.jsx
      │  ├─ Navbar.jsx
      │  ├─ ProductCard.jsx
      │  ├─ Products.jsx
      │  ├─ SectionHeader.jsx
      │  ├─ StarRating.jsx
      │  ├─ Testimonials.jsx
      │  └─ ui/
      │     ├─ Button.jsx
      │     └─ Input.jsx
      │
      ├─ admin/
      │  ├─ AdminLayout.jsx
      │  ├─ AdminDashboard.jsx
      │  ├─ AdminProducts.jsx
      │  └─ AdminOrders.jsx
      │
      ├─ layouts/
      │  └─ PublicLayout.jsx       (Navbar + Footer + <Outlet />)
      │
      ├─ context/
      │  └─ CartContext.jsx
      │
      ├─ data/
      │  ├─ products.js
      │  └─ productImages.js
      │
      ├─ pages/
      │  ├─ About.jsx
      │  ├─ AddressNew.jsx
      │  ├─ Cart.jsx
      │  ├─ Checkout.jsx
      │  ├─ Contact.jsx
      │  ├─ Error.jsx
      │  ├─ Home.jsx
      │  ├─ Login.jsx
      │  ├─ OrderPlaced.jsx
      │  ├─ OrderTrack.jsx
      │  ├─ ProductsPage.jsx
      │  ├─ Result.jsx
      │  ├─ Signup.jsx
      │  └─ Upload.jsx
      │
      ├─ routes/
      │  ├─ AdminRoute.jsx
      │  └─ ProtectedRoute.jsx
      │
      ├─ utils/
      │  └─ pricing.js
      │
      ├─ App.jsx
      ├─ main.jsx
      └─ index.css

