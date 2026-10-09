import { useEffect, useState } from "react";
import { ArrowDownToLine, BellRing, PackageCheck, X } from "lucide-react";
import {
  getInventory,
  restockInventory,
  updateInventory,
  exportInventoryReport,
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
import AdminPortal from "../../components/AdminPortal.jsx";
import {
  formatRupees,
  getProductsFromCategories,
} from "../../models/catalog.js";

export default function Inventory({ globalSearch = "", onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All stock");
  const [stockUpdates, setStockUpdates] = useState({});
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState("");
  const load = () => {
    setLoading(true);
    setFailed(false);
    getInventory()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getInventory()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="Checking inventory levels" />;
  if (failed) return <ErrorState retry={load} />;
  const products = getProductsFromCategories([
    { name: "Premium Tea", products: response?.data || [] },
  ]).map((product) => {
    const stock = stockUpdates[product.id] ?? product.stock;
    return {
      ...product,
      stock,
      status:
        stock === 0 ? "Out of stock" : stock < 10 ? "Low stock" : "In stock",
    };
  });
  const visible = products.filter(
    (item) =>
      `${item.name} ${item.sku}`
        .toLowerCase()
        .includes(`${query} ${globalSearch}`.toLowerCase().trim()) &&
      (filter === "All stock" ||
        (filter === "Low stock"
          ? item.status !== "In stock"
          : item.status === filter)),
  );
  const low = products.filter((item) => item.status !== "In stock");
  const exportReport = async () => {
    const result = await exportInventoryReport();
    onNotify(result.message || "Inventory report exported.");
  };
  const restock = async (product) => {
    const quantity = product.stock + 10;
    const result = await restockInventory(product.id, quantity);
    if (!result.success) {
      onNotify(result.message || "Could not restock this product.");
      return;
    }
    setStockUpdates((current) => ({ ...current, [product.id]: quantity }));
    onNotify(`${product.name} restocked through the mock API.`);
  };
  const saveAdjustment = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = Number(form.get("productId"));
    const quantity = Number(form.get("quantity"));
    const result = await updateInventory(productId, quantity);
    if (!result.success) {
      onNotify(result.message || "Could not adjust inventory.");
      return;
    }
    setStockUpdates((current) => ({ ...current, [productId]: quantity }));
    setAdjustOpen(false);
    onNotify("Inventory quantity updated through the mock API.");
  };
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="OPERATIONS"
        title="Inventory"
        description="Stay ahead of stockouts and keep popular blends available."
        action={
          <div className="admin-heading-actions">
            <button
              className="admin-button admin-button-secondary"
              onClick={exportReport}
            >
              <ArrowDownToLine size={16} />
              Export stock
            </button>
            <button
              className="admin-button admin-button-dark"
              onClick={() => {
                setAdjustingProduct(String(products[0]?.id || ""));
                setAdjustOpen(true);
              }}
            >
              <PackageCheck size={16} />
              Adjust stock
            </button>
          </div>
        }
      />
      {low.length > 0 && (
        <div className="admin-stock-alert">
          <div>
            <BellRing size={18} />
            <strong>{low.length} products need your attention</strong>
            <span>{low.map((item) => item.name).join(", ")}</span>
          </div>
          <button onClick={() => setFilter("Low stock")}>
            Review low stock
          </button>
        </div>
      )}
      <div className="admin-summary-strip">
        <div>
          <span>Tracked products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>In stock</span>
          <strong>
            {products.filter((item) => item.status === "In stock").length}
          </strong>
        </div>
        <div>
          <span>Low stock</span>
          <strong className="text-warn">
            {products.filter((item) => item.status === "Low stock").length}
          </strong>
        </div>
        <div>
          <span>Out of stock</span>
          <strong className="text-danger">
            {products.filter((item) => item.status === "Out of stock").length}
          </strong>
        </div>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-list-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search inventory"
          />
          <SelectField
            value={filter}
            onChange={setFilter}
            options={["All stock", "In stock", "Low stock", "Out of stock"]}
            ariaLabel="Filter inventory by stock"
          />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>UNIT PRICE</th>
                <th>AVAILABLE</th>
                <th>STOCK VALUE</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-thumb">
                        {item.image && <img src={item.image} alt="" />}
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.weight}</span>
                      </div>
                    </div>
                  </td>
                  <td className="admin-code">{item.sku}</td>
                  <td>{formatRupees(item.price)}</td>
                  <td>
                    <strong>{item.stock}</strong> units
                  </td>
                  <td className="admin-table-total">
                    {formatRupees(item.stock * item.price)}
                  </td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="admin-text-button"
                      onClick={() => restock(item)}
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState title="No stock records match" />}
        </div>
      </section>
      {adjustOpen && (
        <AdminPortal>
          <div
            className="admin-modal-backdrop"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setAdjustOpen(false)
            }
          >
            <form className="admin-modal" onSubmit={saveAdjustment}>
              <div className="admin-modal-header">
                <div>
                  <span className="admin-eyebrow">STOCK CONTROL</span>
                  <h2>Adjust inventory</h2>
                </div>
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label="Close"
                  onClick={() => setAdjustOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <label>
                Product
                <select
                  name="productId"
                  value={adjustingProduct}
                  onChange={(event) => setAdjustingProduct(event.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Available quantity
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  required
                  defaultValue={
                    products.find(
                      (product) => String(product.id) === adjustingProduct,
                    )?.stock || 0
                  }
                  key={adjustingProduct}
                />
              </label>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => setAdjustOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-dark"
                >
                  <PackageCheck size={15} />
                  Save quantity
                </button>
              </div>
            </form>
          </div>
        </AdminPortal>
      )}
    </div>
  );
}
