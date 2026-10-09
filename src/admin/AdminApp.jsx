import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar.jsx";
import AdminTopbar from "./components/AdminTopbar.jsx";
import { Toast } from "./components/AdminPrimitives.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Products from "./pages/Products/Products.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import Customers from "./pages/Customers/Customers.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import Inventory from "./pages/Inventory/Inventory.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import Marketing from "./pages/Marketing/Marketing.jsx";
import "./admin.css";

export default function AdminApp() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    const section =
      location.pathname.split("/").filter(Boolean).at(-1) || "overview";
    document.title = `${section[0].toUpperCase()}${section.slice(1)} | Cuppanord Admin`;
    return () => {
      document.title = previousTitle;
    };
  }, [location.pathname]);

  useEffect(() => {
    const shortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".admin-topbar .admin-search input")?.focus();
      }
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName,
        )
      ) {
        event.preventDefault();
        document.querySelector(".admin-topbar .admin-search input")?.focus();
      }
    };
    const help = () =>
      setToast("Support is available at help@cuppanord.example");
    window.addEventListener("keydown", shortcut);
    window.addEventListener("admin:help", help);
    return () => {
      window.removeEventListener("keydown", shortcut);
      window.removeEventListener("admin:help", help);
    };
  }, []);

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <div className="admin-main">
        <AdminTopbar
          onMenu={() => setSidebarOpen((value) => !value)}
          onSearch={setSearch}
          search={search}
          menuOpen={sidebarOpen}
        />
        <main className="admin-content">
          <Routes>
            <Route
              path="/admin"
              element={<Dashboard globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/products"
              element={<Products globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/orders"
              element={<Orders globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/customers"
              element={<Customers globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/categories"
              element={<Categories globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/inventory"
              element={<Inventory globalSearch={search} onNotify={setToast} />}
            />
            <Route
              path="/admin/analytics"
              element={<Analytics onNotify={setToast} />}
            />
            <Route
              path="/admin/settings"
              element={<Settings onNotify={setToast} />}
            />
            <Route
              path="/admin/marketing"
              element={<Marketing onNotify={setToast} />}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
