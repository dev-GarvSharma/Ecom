import { useEffect, useState } from "react";
import { Download, Eye, PackageCheck, Save, X } from "lucide-react";
import {
  exportOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} from "./api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SearchField,
  SelectField,
  StatusPill,
} from "../../components/AdminPrimitives.jsx";
import { formatRupees } from "../../models/catalog.js";

export default function Orders({ globalSearch = "", onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detail, setDetail] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [orderUpdates, setOrderUpdates] = useState({});
  const load = () => {
    setLoading(true);
    setFailed(false);
    getAllOrders()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getAllOrders()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  const orders = (response?.data || []).map((order) => ({
    ...order,
    ...orderUpdates[order.id],
  }));
  const visible = orders.filter(
    (order) =>
      `${order.id} ${order.customer} ${order.email}`
        .toLowerCase()
        .includes(`${query} ${globalSearch}`.toLowerCase().trim()) &&
      (filter === "All orders" || order.status === filter),
  );
  const openOrder = async (order) => {
    setSelectedOrder(order);
    setDetail(null);
    setStatusDraft(order.status);
    const result = await getOrderDetails(order.id);
    setDetail({ ...result.data, ...orderUpdates[order.id] });
  };
  const saveStatus = async () => {
    const result = await updateOrderStatus(selectedOrder.id, statusDraft);
    if (!result.success) {
      onNotify(result.message || "Could not update order status.");
      return;
    }
    const next = { status: statusDraft };
    setOrderUpdates((current) => ({
      ...current,
      [selectedOrder.id]: { ...current[selectedOrder.id], ...next },
    }));
    setDetail((current) => ({ ...current, ...next }));
    setSelectedOrder((current) => ({ ...current, ...next }));
    onNotify(`${selectedOrder.id} status updated through the mock API.`);
  };
  if (loading) return <LoadingState label="Loading orders" />;
  if (failed) return <ErrorState retry={load} />;
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="SALES"
        title="Orders"
        description="Track, fulfill and follow up on customer orders."
        action={
          <button
            className="admin-button admin-button-secondary"
            onClick={async () => {
              const result = await exportOrders();
              onNotify(result.message || "Orders exported.");
            }}
          >
            <Download size={16} />
            Export orders
          </button>
        }
      />
      <div className="admin-summary-strip">
        <div>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>To fulfill</span>
          <strong className="text-warn">
            {
              orders.filter(
                (item) =>
                  item.status === "Processing" || item.status === "Pending",
              ).length
            }
          </strong>
        </div>
        <div>
          <span>Shipped</span>
          <strong>
            {orders.filter((item) => item.status === "Shipped").length}
          </strong>
        </div>
        <div>
          <span>Revenue</span>
          <strong>
            {formatRupees(
              orders
                .filter((item) => item.payment === "Paid")
                .reduce((sum, item) => sum + item.total, 0),
            )}
          </strong>
        </div>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-list-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search order, customer or email"
          />
          <SelectField
            value={filter}
            onChange={setFilter}
            options={[
              "All orders",
              "Pending",
              "Processing",
              "Shipped",
              "Delivered",
              "Cancelled",
            ]}
            ariaLabel="Filter orders by status"
          />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>PAYMENT</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="admin-click-row">
                  <td>
                    <strong>{order.id}</strong>
                  </td>
                  <td>
                    <div className="admin-customer-cell">
                      <div className="admin-mini-avatar">
                        {order.customer
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </div>
                      <div>
                        <span>{order.customer}</span>
                        <small>{order.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.items} items</td>
                  <td>
                    <StatusPill>{order.payment}</StatusPill>
                  </td>
                  <td className="admin-table-total">
                    {formatRupees(order.total)}
                  </td>
                  <td>
                    <StatusPill>{order.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="admin-icon-button table-more"
                      aria-label={`View ${order.id}`}
                      onClick={() => openOrder(order)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState title="No matching orders" />}
        </div>
        <div className="admin-table-pagination">
          <span>
            Showing <strong>{visible.length}</strong> of{" "}
            <strong>{orders.length}</strong> orders
          </span>
          <div>
            <button disabled>Previous</button>
            <button className="page-current">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </section>
      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedOrder(null)
          }
        >
          <aside className="admin-drawer">
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">ORDER DETAILS</span>
                <h2>{selectedOrder.id}</h2>
              </div>
              <button
                className="admin-icon-button"
                aria-label="Close"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} />
              </button>
            </div>
            {detail ? (
              <>
                <div className="admin-order-detail-status">
                  <PackageCheck size={19} />
                  <div>
                    <strong>{detail.status}</strong>
                    <span>Placed {detail.date}</span>
                  </div>
                </div>
                <div className="admin-detail-section">
                  <h3>Customer</h3>
                  <strong>{detail.customer}</strong>
                  <span>{detail.email}</span>
                </div>
                <div className="admin-detail-section">
                  <h3>Payment</h3>
                  <span>
                    {detail.payment} · {detail.method}
                  </span>
                  <strong>{formatRupees(detail.total)}</strong>
                </div>
                <div className="admin-detail-section">
                  <h3>Items</h3>
                  <span>
                    {detail.items} item{detail.items > 1 ? "s" : ""} in this
                    order
                  </span>
                </div>
                <div className="admin-detail-section">
                  <h3>Fulfillment status</h3>
                  <SelectField
                    value={statusDraft}
                    onChange={setStatusDraft}
                    options={[
                      "Pending",
                      "Processing",
                      "Shipped",
                      "Delivered",
                      "Cancelled",
                    ]}
                    ariaLabel="Update order status"
                  />
                </div>
                <button
                  className="admin-button admin-button-dark admin-full-button"
                  onClick={saveStatus}
                >
                  <Save size={15} />
                  Save status
                </button>
              </>
            ) : (
              <LoadingState label="Loading order details" />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
