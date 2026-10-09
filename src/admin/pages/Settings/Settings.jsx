import { useEffect, useState } from "react";
import {
  Bell,
  CreditCard,
  Globe2,
  LockKeyhole,
  Save,
  Store,
} from "lucide-react";
import {
  getStoreSettings,
  requestPasswordReset,
  saveStoreSettings,
} from "./api.js";
import {
  ErrorState,
  LoadingState,
  PageHeading,
} from "../../components/AdminPrimitives.jsx";

const sections = [
  { key: "general", name: "General", icon: Store },
  { key: "notifications", name: "Notifications", icon: Bell },
  { key: "checkout", name: "Checkout", icon: CreditCard },
  { key: "regional", name: "Regional", icon: Globe2 },
  { key: "security", name: "Security", icon: LockKeyhole },
];

export default function Settings({ onNotify }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [form, setForm] = useState({});
  const load = () => {
    setLoading(true);
    setFailed(false);
    getStoreSettings()
      .then((result) => setForm(result.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getStoreSettings()
      .then((result) => setForm(result.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    const result = await saveStoreSettings(form);
    onNotify(result.message || "Settings saved.");
  };
  const sendPasswordReset = async () => {
    const result = await requestPasswordReset();
    onNotify(result.message || "Password reset request sent.");
  };
  if (loading) return <LoadingState label="Loading store settings" />;
  if (failed) return <ErrorState retry={load} />;

  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="YOUR STORE"
        title="Settings"
        description="Configure how your store operates behind the scenes."
        action={
          <button
            className="admin-button admin-button-dark"
            form="admin-settings-form"
            type="submit"
          >
            <Save size={16} />
            Save changes
          </button>
        }
      />
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav">
          {sections.map(({ key, name, icon: Icon }) => (
            <button
              key={key}
              className={activeSection === key ? "is-active" : ""}
              onClick={() => setActiveSection(key)}
            >
              <Icon size={17} />
              {name}
            </button>
          ))}
        </nav>
        <form
          id="admin-settings-form"
          className="admin-settings-form"
          onSubmit={save}
        >
          {activeSection === "general" && (
            <section className="admin-panel admin-settings-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Store details</h2>
                  <p>
                    These details are used across your storefront and customer
                    emails.
                  </p>
                </div>
              </div>
              <label className="admin-form-label">
                Store name
                <input
                  value={form.storeName || ""}
                  onChange={(event) => update("storeName", event.target.value)}
                />
              </label>
              <label className="admin-form-label">
                Store contact email
                <input type="email" defaultValue="hello@cuppanord.com" />
              </label>
              <label className="admin-form-label">
                Store description
                <textarea
                  rows="3"
                  defaultValue="Thoughtfully sourced teas for better everyday rituals."
                />
              </label>
              <div className="admin-settings-divider" />
              <h3>Store status</h3>
              <div className="admin-setting-toggle-row">
                <div>
                  <strong>Online store</strong>
                  <span>Your storefront is available to customers.</span>
                </div>
                <button
                  className="admin-toggle is-on"
                  type="button"
                  aria-label="Online store is on"
                >
                  <i />
                </button>
              </div>
            </section>
          )}
          {activeSection === "notifications" && (
            <section className="admin-panel admin-settings-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Notifications</h2>
                  <p>Choose which store events should reach your team.</p>
                </div>
              </div>
              {[
                [
                  "orderNotifications",
                  "New order alerts",
                  "Get notified when a customer places an order.",
                ],
                [
                  "emailNotifications",
                  "Email updates",
                  "Receive a daily summary of store activity.",
                ],
                [
                  "lowStockNotifications",
                  "Low stock alerts",
                  "Get notified when a product needs restocking.",
                ],
              ].map(([key, title, description]) => (
                <div className="admin-setting-toggle-row" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                  <button
                    className={`admin-toggle ${form[key] !== false ? "is-on" : ""}`}
                    type="button"
                    aria-label={`${title} toggle`}
                    onClick={() => update(key, form[key] === false)}
                  >
                    <i />
                  </button>
                </div>
              ))}
            </section>
          )}
          {activeSection === "checkout" && (
            <section className="admin-panel admin-settings-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Checkout preferences</h2>
                  <p>Set the defaults for customer checkout.</p>
                </div>
              </div>
              <div className="admin-setting-toggle-row">
                <div>
                  <strong>Guest checkout</strong>
                  <span>
                    Allow customers to place an order without an account.
                  </span>
                </div>
                <button
                  className="admin-toggle is-on"
                  type="button"
                  aria-label="Guest checkout is on"
                >
                  <i />
                </button>
              </div>
              <div className="admin-setting-toggle-row">
                <div>
                  <strong>Require phone number</strong>
                  <span>Collect a phone number with every order.</span>
                </div>
                <button
                  className="admin-toggle is-on"
                  type="button"
                  aria-label="Phone number required"
                >
                  <i />
                </button>
              </div>
              <label className="admin-form-label">
                Default payment terms
                <select defaultValue="Due on receipt">
                  <option>Due on receipt</option>
                  <option>Net 7 days</option>
                  <option>Net 30 days</option>
                </select>
              </label>
            </section>
          )}
          {activeSection === "regional" && (
            <section className="admin-panel admin-settings-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Regional preferences</h2>
                  <p>Manage the formats used in your admin and storefront.</p>
                </div>
              </div>
              <label className="admin-form-label">
                Store currency
                <select
                  value={form.currency || "INR"}
                  onChange={(event) => update("currency", event.target.value)}
                >
                  <option value="INR">Indian rupee (INR ₹)</option>
                  <option value="USD">US dollar (USD $)</option>
                  <option value="GBP">Pound sterling (GBP £)</option>
                </select>
              </label>
              <label className="admin-form-label">
                Timezone
                <select
                  value={form.timezone || "Asia/Kolkata"}
                  onChange={(event) => update("timezone", event.target.value)}
                >
                  <option value="Asia/Kolkata">
                    India Standard Time (IST)
                  </option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                </select>
              </label>
              <label className="admin-form-label">
                Low stock threshold
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold ?? 10}
                  onChange={(event) =>
                    update("lowStockThreshold", Number(event.target.value))
                  }
                />
                <small>
                  Products at or below this level appear in inventory alerts.
                </small>
              </label>
            </section>
          )}
          {activeSection === "security" && (
            <section className="admin-panel admin-settings-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Account security</h2>
                  <p>Manage access to this store admin.</p>
                </div>
              </div>
              <div className="admin-security-card">
                <div className="admin-avatar admin-avatar-green">NS</div>
                <div>
                  <strong>Nisha Sharma</strong>
                  <span>Owner · nisha@cuppanord.com</span>
                </div>
                <span className="admin-security-badge">Store owner</span>
              </div>
              <div className="admin-setting-toggle-row">
                <div>
                  <strong>Two-step verification</strong>
                  <span>Add another layer of security to admin sign-in.</span>
                </div>
                <button
                  className="admin-toggle"
                  type="button"
                  aria-label="Two-step verification is off"
                >
                  <i />
                </button>
              </div>
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={sendPasswordReset}
              >
                Send password reset link
              </button>
            </section>
          )}
        </form>
      </div>
      <div className="admin-page-footnote">
        <span>Settings are stored for this demo session only.</span>
        <span>Version 1.0.0</span>
      </div>
    </div>
  );
}
