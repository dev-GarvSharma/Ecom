import { useEffect, useState } from "react";
import { Download, Eye, Plus, UserRoundPlus, X } from "lucide-react";
import {
  createCustomer,
  exportCustomers,
  getAllCustomers,
  getCustomerDetails,
  getCustomerOrders,
} from "./api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SearchField,
  StatusPill,
} from "../../components/AdminPrimitives.jsx";
import { formatRupees } from "../../models/catalog.js";
import AdminPortal from "../../components/AdminPortal.jsx";

export default function Customers({ globalSearch = "", onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [created, setCreated] = useState([]);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const load = () => {
    setLoading(true);
    setFailed(false);
    getAllCustomers()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getAllCustomers()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="Loading customer directory" />;
  if (failed) return <ErrorState retry={load} />;
  const customers = [...created, ...(response?.data?.data || [])];
  const visible = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.location}`
      .toLowerCase()
      .includes(`${query} ${globalSearch}`.toLowerCase().trim()),
  );
  const openCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setOrdersLoading(true);
    const [customerResult, ordersResult] = await Promise.all([
      getCustomerDetails(customer.id),
      getCustomerOrders(customer.id),
    ]);
    if (customerResult.success) setSelectedCustomer(customerResult?.data?.data);
    if (ordersResult.success) setCustomerOrders(ordersResult?.data?.data || []);
    setOrdersLoading(false);
  };
  const submitCustomer = async (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const customer = {
      id: `CUS-${Date.now()}`,
      name: values.get("name").trim(),
      email: values.get("email").trim(),
      location: values.get("location").trim(),
      orders: 0,
      spent: 0,
      joined: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date()),
      segment: "New",
    };
    const result = await createCustomer(customer);
    if (!result.success) {
      onNotify(result.message || "Could not create customer.");
      return;
    }
    setCreated((items) => [customer, ...items]);
    setAddCustomerOpen(false);
    onNotify("Customer created through the mock API.");
  };
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="RELATIONSHIPS"
        title="Customers"
        description="Understand your community and make every order feel personal."
        action={
          <div className="admin-heading-actions">
            <button
              className="admin-button admin-button-secondary"
              onClick={async () => {
                const result = await exportCustomers();
                onNotify(result.message || "Customers exported.");
              }}
            >
              <Download size={16} />
              Export
            </button>
            <button
              className="admin-button admin-button-dark"
              onClick={() => setAddCustomerOpen(true)}
            >
              <UserRoundPlus size={16} />
              Add customer
            </button>
          </div>
        }
      />
      <div className="admin-summary-strip">
        <div>
          <span>All customers</span>
          <strong>1,429</strong>
        </div>
        <div>
          <span>New this month</span>
          <strong>186</strong>
        </div>
        <div>
          <span>Returning customers</span>
          <strong>38.4%</strong>
        </div>
        <div>
          <span>Average lifetime value</span>
          <strong>₹3,840</strong>
        </div>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-list-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search name, email or location"
          />
          <span className="admin-muted-count">{visible.length} customers</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>LOCATION</th>
                <th>ORDERS</th>
                <th>TOTAL SPENT</th>
                <th>JOINED</th>
                <th>SEGMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((customer, index) => (
                <tr key={customer.id}>
                  <td>
                    <div className="admin-customer-cell">
                      <div
                        className={`admin-mini-avatar customer-color-${index % 4}`}
                      >
                        {customer.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <strong>{customer.name}</strong>
                        <small>{customer.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{customer.location}</td>
                  <td>{customer.orders} orders</td>
                  <td className="admin-table-total">
                    {formatRupees(customer.spent)}
                  </td>
                  <td>{customer.joined}</td>
                  <td>
                    <StatusPill>{customer.segment}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="admin-icon-button table-more"
                      aria-label={`View ${customer.name}`}
                      onClick={() => openCustomer(customer)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState title="No customers found" />}
        </div>
        <div className="admin-table-pagination">
          <span>
            Showing <strong>{visible.length}</strong> of{" "}
            <strong>{customers.length}</strong> demo customers
          </span>
          <div>
            <button disabled>Previous</button>
            <button className="page-current">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </section>
      {selectedCustomer && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedCustomer(null)
          }
        >
          <aside className="admin-drawer">
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">CUSTOMER PROFILE</span>
                <h2>{selectedCustomer.name}</h2>
              </div>
              <button
                className="admin-icon-button"
                aria-label="Close customer details"
                onClick={() => setSelectedCustomer(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-customer-profile">
              <div className="admin-customer-profile-avatar">
                {selectedCustomer.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <strong>{selectedCustomer.name}</strong>
                <StatusPill>{selectedCustomer.segment}</StatusPill>
              </div>
            </div>
            <div className="admin-detail-section">
              <h3>Contact details</h3>
              <strong>{selectedCustomer.email}</strong>
              <span>{selectedCustomer.location}</span>
              <span>Customer since {selectedCustomer.joined}</span>
            </div>
            <div className="admin-customer-stat-grid">
              <div>
                <span>Total orders</span>
                <strong>{selectedCustomer.orders}</strong>
              </div>
              <div>
                <span>Lifetime spend</span>
                <strong>{formatRupees(selectedCustomer.spent)}</strong>
              </div>
            </div>
            <div className="admin-customer-orders-heading">
              <h3>Recent orders</h3>
              <span>
                {ordersLoading
                  ? "Loading"
                  : `${customerOrders.length} in demo data`}
              </span>
            </div>
            {customerOrders.map((order) => (
              <div className="admin-customer-order" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <span>
                    {order.date} · {order.items} item
                    {order.items > 1 ? "s" : ""}
                  </span>
                </div>
                <div>
                  <strong>{formatRupees(order.total)}</strong>
                  <StatusPill>{order.status}</StatusPill>
                </div>
              </div>
            ))}
            {!ordersLoading && customerOrders.length === 0 && (
              <div className="admin-customer-no-orders">
                No matching demo orders for this customer.
              </div>
            )}
            {ordersLoading && (
              <div className="admin-customer-no-orders">
                Loading order history...
              </div>
            )}
          </aside>
        </div>
      )}
      {addCustomerOpen && (
        <AdminPortal>
          <div
            className="admin-modal-backdrop"
            role="presentation"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setAddCustomerOpen(false)
            }
          >
            <form className="admin-modal" onSubmit={submitCustomer}>
              <div className="admin-modal-header">
                <div>
                  <span className="admin-eyebrow">CUSTOMER DIRECTORY</span>
                  <h2>Add customer</h2>
                </div>
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label="Close"
                  onClick={() => setAddCustomerOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <label>
                Customer name
                <input name="name" required placeholder="Full name" />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                />
              </label>
              <label>
                Location
                <input name="location" required placeholder="City, country" />
              </label>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => setAddCustomerOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="admin-button admin-button-dark"
                  type="submit"
                >
                  <Plus size={16} />
                  Create customer
                </button>
              </div>
            </form>
          </div>
        </AdminPortal>
      )}
    </div>
  );
}
