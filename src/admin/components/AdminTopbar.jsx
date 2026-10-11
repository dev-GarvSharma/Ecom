import { Bell, CheckCheck, Command, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchField } from "./AdminPrimitives.jsx";
import {
  getAllNotifications,
  markAllNotificationsRead,
} from "../pages/Notifications/api.js";

const names = {
  "/admin": "Overview",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/analytics": "Analytics",
  "/admin/marketing": "Marketing",
  "/admin/settings": "Settings",
};

export default function AdminTopbar({ onMenu, onSearch, search, menuOpen }) {
  const location = useLocation();
  const section = names[location.pathname] || "Overview";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unread = notifications.filter((item) => !item.read).length;
  useEffect(() => {
    getAllNotifications()
      .then((response) => {
        if (response.success) setNotifications(response?.data?.data || []);
      })
      .catch(() => setNotifications([]));
  }, []);
  const markNotificationsRead = async () => {
    const result = await markAllNotificationsRead(
      notifications.map((item) => item.id),
    );
    if (result.success)
      setNotifications((items) =>
        items.map((item) => ({ ...item, read: true })),
      );
  };
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          className="admin-icon-button admin-menu-button"
          onClick={onMenu}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          <Menu size={19} />
        </button>
        <div className="admin-breadcrumb">
          <span>Store</span>
          <b>/</b>
          <strong>{section}</strong>
        </div>
      </div>
      <div className="admin-topbar-tools">
        <SearchField
          value={search}
          onChange={onSearch}
          placeholder="Search anything..."
        />
        <div className="admin-notification-wrap">
          <button
            className="admin-icon-button admin-notification-button"
            onClick={() => setNotificationsOpen((value) => !value)}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            {unread > 0 && <i />}
          </button>
          {notificationsOpen && (
            <>
              <button
                className="admin-popover-dismiss"
                aria-label="Close notifications"
                onClick={() => setNotificationsOpen(false)}
              />
              <section
                className="admin-notification-popover"
                aria-label="Notifications"
              >
                <div className="admin-notification-header">
                  <div>
                    <strong>Notifications</strong>
                    <span>{unread ? `${unread} unread` : "All caught up"}</span>
                  </div>
                  <div>
                    <button
                      className="admin-icon-button"
                      title="Mark all as read"
                      aria-label="Mark all as read"
                      onClick={markNotificationsRead}
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      className="admin-icon-button"
                      title="Close notifications"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="admin-notification-list">
                  {notifications.map((item) => (
                    <article
                      className={`admin-notification-item ${item.read ? "is-read" : ""}`}
                      key={item.id}
                    >
                      <span
                        className={`notification-mark notification-${item.tone}`}
                      >
                        <Bell size={14} />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                        <small>{item.time}</small>
                      </div>
                      {!item.read && <i className="notification-unread-dot" />}
                    </article>
                  ))}
                </div>
                <button
                  className="admin-notification-footer"
                  onClick={markNotificationsRead}
                >
                  Mark all as read
                </button>
              </section>
            </>
          )}
        </div>
        <div className="admin-topbar-divider" />
        <button
          className="admin-help-button"
          onClick={() => window.dispatchEvent(new CustomEvent("admin:help"))}
        >
          <span>⌘ K</span>
        </button>
        <div className="admin-avatar admin-avatar-green">NS</div>
      </div>
    </header>
  );
}
