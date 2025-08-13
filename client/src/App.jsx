import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import Home from "./pages/Home";
import About from "./pages/About";
import Upload from "./pages/Upload";
import Contact from "./pages/Contact";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
import Result from "./pages/Result";
import ProductsPage from "./pages/ProductsPage";
import ErrorPage from "./pages/Error";
import Cart from "./pages/Cart";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddressNew from "./pages/AddressNew";
import OrderPlaced from "./pages/OrderPlaced";
import OrderTrack from "./pages/OrderTrack";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Shell that can access location inside the Router
function AppShell() {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith("/login") || pathname.startsWith("/signup");

  return (
    <div className="min-h-screen bg-white">
      {!hideChrome && <Navbar />}
      {/* pt-20 matches Navbar h-20 (80px). When chrome hidden, remove offset and prevent margin-collapse */}
      <main className={hideChrome ? "pt-0 [&>*:first-child]:pt-px" : "pt-24"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          <Route path="/result" element={<Result />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order/:orderId" element={<OrderPlaced />} />
          <Route path="/order/:orderId/track" element={<OrderTrack />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/address/new"
            element={
              <ProtectedRoute>
                <AddressNew />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  );
}