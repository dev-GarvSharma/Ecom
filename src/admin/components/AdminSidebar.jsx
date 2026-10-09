import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Boxes,
  ChevronLeft,
  CircleHelp,
  Command,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Orders", path: "/admin/orders", icon: ShoppingBag, count: "12" },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: Boxes },
  { label: "Inventory", path: "/admin/inventory", icon: Activity, alert: true },
  { label: "Customers", path: "/admin/customers", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Marketing", path: "/admin/marketing", icon: Megaphone },
];

export default function AdminSidebar({ open, onClose, collapsed, onToggle }) {
  return (
    <>
      <button
        className={`admin-sidebar-scrim ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside
        className={`admin-sidebar ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}
      >
        <div className="admin-store-switcher">
          <div className="admin-store-avatar">C</div>
          <div className="admin-store-copy">
            <strong>Cuppanord Store</strong>
            <span>Online store</span>
          </div>
          <ChevronLeft className="admin-store-chevron" size={15} />
        </div>
        <div className="admin-nav-label">WORKSPACE</div>
        <nav className="admin-navigation" aria-label="Admin navigation">
          {navigation.map(({ label, path, icon: Icon, count, alert, end }) => (
            <NavLink
              key={path}
              end={end}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "is-active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
              {count && <small>{count}</small>}
              {alert && <i className="admin-nav-alert" />}
            </NavLink>
          ))}
        </nav>
        <div className="admin-nav-bottom">
          <div className="admin-nav-label">PREFERENCES</div>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "is-active" : ""}`
            }
            title={collapsed ? "Settings" : undefined}
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <button
            className="admin-nav-link"
            onClick={() => window.dispatchEvent(new CustomEvent("admin:help"))}
          >
            <CircleHelp size={18} />
            <span>Help & support</span>
          </button>
        </div>
        <div className="admin-sidebar-footer">
          <div className="admin-avatar admin-avatar-green">NS</div>
          <div className="admin-user-copy">
            <strong>Nisha Sharma</strong>
            <span>Store owner</span>
          </div>
          <button
            className="admin-collapse-button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}
