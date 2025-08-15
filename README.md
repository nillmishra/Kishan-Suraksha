
# python setup
.py -3.11 -m venv .venv311
.venv\Scripts\activate
pip install -r requirements.txt
python .\app.py

# folder structure

kishan-suraksha/
├── backend/
│   ├── uploads/
│   ├── models/
│   │   └── advanced_rice_leaf_disease_model.h5
│   ├── app.py
│   ├── requirements.txt
│
├── server/
│   ├── uploads/
│   │   └── products/
│   ├── data/
│   │   └── db.json
│   ├── src/
│   │   ├── models/
│   │   │   ├── Order.js
│   │   │   ├── Product.js
│   │   │   └── User.js
│   │   ├── account.js
│   │   ├── admin.orders.js
│   │   ├── admin.products.js
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── assets/
│       │   └── newlogo.png
│       ├── components/
│       │   ├── Features.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProductCard.jsx
│       │   ├── Products.jsx
│       │   ├── SectionHeader.jsx
│       │   ├── StarRating.jsx
│       │   └── Testimonials.jsx
│       │
│       ├── ui/
│       │   ├── Button.jsx
│       │   └── Input.jsx
│       │
│       ├── admin/
│       │   ├── AdminLayout.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminProducts.jsx
│       │   └── AdminOrders.jsx
│       │
│       ├── layouts/
│       │   └── PublicLayout.jsx
│       │
│       ├── context/
│       │   └── CartContext.jsx
│       │
│       ├── data/
│       │   ├── products.js
│       │   └── productImages.js
│       │
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── AddressNew.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── Contact.jsx
│       │   ├── Error.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── OrderPlaced.jsx
│       │   ├── OrderTrack.jsx
│       │   ├── ProductsPage.jsx
│       │   ├── Result.jsx
│       │   ├── Signup.jsx
│       │   └── Upload.jsx
│       │
│       ├── routes/
│       │   ├── AdminRoute.jsx
│       │   └── ProtectedRoute.jsx
│       │
│       ├── utils/
│       │   └── pricing.js
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
