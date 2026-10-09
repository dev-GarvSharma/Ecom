import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  Ellipsis,
  Package,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { exportDashboardReport, getDashboardOverview } from "./api.js";
import {
  PageHeading,
  LoadingState,
  ErrorState,
  StatusPill,
} from "../../components/AdminPrimitives.jsx";
import {
  formatRupees,
  getProductsFromCategories,
} from "../../models/catalog.js";

const metrics = [
  {
    label: "Gross sales",
    value: "₹1,84,290",
    change: "+12.8%",
    icon: Wallet,
    tone: "coral",
    data: "0,18 12,16 24,22 36,12 48,15 60,6 72,12 84,2 96,8",
  },
  {
    label: "Orders",
    value: "248",
    change: "+8.2%",
    icon: ShoppingBag,
    tone: "blue",
    data: "0,17 12,21 24,14 36,18 48,8 60,13 72,5 84,9 96,1",
  },
  {
    label: "Customers",
    value: "1,429",
    change: "+18.4%",
    icon: Users,
    tone: "green",
    data: "0,19 12,14 24,17 36,9 48,13 60,6 72,10 84,3 96,1",
  },
  {
    label: "Products sold",
    value: "386",
    change: "-2.4%",
    icon: Package,
    tone: "yellow",
    data: "0,5 12,8 24,4 36,11 48,8 60,16 72,12 84,20 96,17",
  },
];

export default function Dashboard({ globalSearch = "", onNotify }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setLoading(true);
    setFailed(false);
    getDashboardOverview()
      .then(setResult)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getDashboardOverview()
      .then(setResult)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Gathering your store overview" />;
  if (failed) return <ErrorState retry={load} />;
  const products = getProductsFromCategories(
    result?.data?.products
      ? [{ name: "Featured", products: result.data.products }]
      : [],
  );
  const latestOrders = (result?.data?.orders || []).filter((order) =>
    `${order.id} ${order.customer}`
      .toLowerCase()
      .includes(globalSearch.toLowerCase()),
  );
  const exportReport = async () => {
    const response = await exportDashboardReport();
    onNotify(response.message || "Dashboard report exported.");
  };
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="THURSDAY, OCTOBER 09, 2026"
        title="Good morning, Nisha"
        description="Here’s what’s happening with your store today."
        action={
          <div className="admin-heading-actions">
            <button className="admin-button admin-button-secondary">
              <CalendarDays size={16} />
              Last 7 days
            </button>
            <button
              className="admin-button admin-button-dark"
              onClick={exportReport}
            >
              <Download size={16} />
              Export report
            </button>
          </div>
        }
      />
      <div className="admin-metrics-grid">
        {metrics.map(({ label, value, change, icon: Icon, tone, data }) => (
          <article className="admin-metric-card" key={label}>
            <div className="admin-metric-top">
              <span>{label}</span>
              <span className={`admin-metric-icon metric-${tone}`}>
                <Icon size={17} />
              </span>
            </div>
            <div className="admin-metric-bottom">
              <strong>{value}</strong>
              <svg
                className={`admin-sparkline spark-${tone}`}
                viewBox="0 0 96 25"
                preserveAspectRatio="none"
              >
                <polyline points={data} />
              </svg>
            </div>
            <div className="admin-metric-foot">
              <span
                className={change.startsWith("-") ? "change-down" : "change-up"}
              >
                {change.startsWith("-") ? (
                  <ArrowDownRight size={13} />
                ) : (
                  <ArrowUpRight size={13} />
                )}
                {change}
              </span>
              <span>vs last week</span>
            </div>
          </article>
        ))}
      </div>
      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-sales-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Sales overview</h2>
              <p>Revenue performance over time</p>
            </div>
            <button
              className="admin-icon-button"
              aria-label="More sales options"
            >
              <Ellipsis size={19} />
            </button>
          </div>
          <div className="admin-chart-legend">
            <span>
              <i className="legend-current" />
              This week <strong>₹1,84,290</strong>
            </span>
            <span>
              <i className="legend-previous" />
              Last week
            </span>
            <span className="admin-chart-period">Last 7 days</span>
          </div>
          <div className="admin-chart">
            <div className="admin-chart-axis">
              <span>₹1.0L</span>
              <span>₹75k</span>
              <span>₹50k</span>
              <span>₹25k</span>
              <span>₹0</span>
            </div>
            <div className="admin-chart-plot">
              <div className="admin-chart-gridlines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <svg
                viewBox="0 0 700 230"
                preserveAspectRatio="none"
                aria-label="Weekly sales chart"
              >
                <defs>
                  <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#de785d" stopOpacity=".19" />
                    <stop offset="100%" stopColor="#de785d" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 165 C45 140 55 157 100 130 S160 123 200 143 S260 102 300 116 S360 84 400 105 S460 80 500 96 S560 38 600 64 S660 40 700 50 L700 230 L0 230Z"
                  fill="url(#sales-fill)"
                />
                <path
                  d="M0 165 C45 140 55 157 100 130 S160 123 200 143 S260 102 300 116 S360 84 400 105 S460 80 500 96 S560 38 600 64 S660 40 700 50"
                  fill="none"
                  stroke="#d8775d"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M0 185 C55 178 65 170 100 174 S165 157 200 172 S265 150 300 161 S360 139 400 155 S465 125 500 142 S565 114 600 129 S660 105 700 118"
                  fill="none"
                  stroke="#9abcb1"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="admin-chart-days">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </article>
        <article className="admin-panel admin-insight-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Store insights</h2>
              <p>Quick signals to keep an eye on</p>
            </div>
            <Sparkles size={18} className="admin-insight-spark" />
          </div>
          <div className="admin-insight-list">
            <div className="admin-insight-item">
              <div className="insight-number">01</div>
              <div>
                <strong>Repeat purchases are up</strong>
                <p>Returning customers placed 24% more orders this week.</p>
              </div>
              <ArrowUpRight size={16} />
            </div>
            <div className="admin-insight-item">
              <div className="insight-number insight-warn">02</div>
              <div>
                <strong>3 products need restocking</strong>
                <p>Low inventory may affect this weekend’s demand.</p>
              </div>
              <ArrowRight size={16} />
            </div>
            <div className="admin-insight-item">
              <div className="insight-number insight-blue">03</div>
              <div>
                <strong>Cart conversion improved</strong>
                <p>Your checkout conversion is now 3.8%, up 0.6 pts.</p>
              </div>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <button
            className="admin-text-button"
            onClick={() => window.location.assign("/admin/analytics")}
          >
            Explore analytics <ArrowRight size={15} />
          </button>
        </article>
      </section>
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Recent orders</h2>
            <p>A quick look at the latest activity</p>
          </div>
          <button
            className="admin-text-button"
            onClick={() => window.location.assign("/admin/orders")}
          >
            View all orders <ArrowRight size={15} />
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.id}>
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
                      <span>{order.customer}</span>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.items} items</td>
                  <td className="admin-table-total">
                    {formatRupees(order.total)}
                  </td>
                  <td>
                    <StatusPill>{order.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="admin-icon-button table-more"
                      aria-label={`More actions for ${order.id}`}
                    >
                      <Ellipsis size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!latestOrders.length && (
            <div className="admin-inline-empty">No matching orders found.</div>
          )}
        </div>
      </section>
      <section className="admin-bottom-grid">
        <article className="admin-panel admin-products-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Top products</h2>
              <p>Your best performers this week</p>
            </div>
            <button
              className="admin-text-button"
              onClick={() => window.location.assign("/admin/products")}
            >
              All products <ArrowRight size={15} />
            </button>
          </div>
          {products.slice(0, 4).map((item, index) => (
            <div className="admin-top-product" key={item.id}>
              <div className="admin-product-thumb">
                {item.image && <img src={item.image} alt="" />}
              </div>
              <div className="admin-top-product-info">
                <strong>{item.name}</strong>
                <span>
                  {item.category} · {item.weight}
                </span>
              </div>
              <span className="admin-product-rank">0{index + 1}</span>
              <strong>{formatRupees(item.price)}</strong>
            </div>
          ))}
        </article>
        <article className="admin-panel admin-fulfillment-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Fulfillment</h2>
              <p>Orders that need attention</p>
            </div>
            <span className="admin-count-badge">12</span>
          </div>
          <div className="admin-fulfillment-stat">
            <div>
              <span>Unfulfilled orders</span>
              <strong>12 orders</strong>
            </div>
            <span className="fulfillment-bar">
              <i style={{ width: "36%" }} />
            </span>
          </div>
          <div className="admin-fulfillment-stat">
            <div>
              <span>Ready to ship</span>
              <strong>8 orders</strong>
            </div>
            <span className="fulfillment-bar fulfillment-green">
              <i style={{ width: "68%" }} />
            </span>
          </div>
          <div className="admin-fulfillment-note">
            <span className="fulfillment-dot" />
            Average fulfillment time <strong>1.4 days</strong>
          </div>
          <button
            className="admin-button admin-button-secondary admin-full-button"
            onClick={() => window.location.assign("/admin/orders")}
          >
            Manage fulfillment <ArrowRight size={15} />
          </button>
        </article>
      </section>
      <div className="admin-page-footnote">
        <span>Showing live demo data</span>
        <span>Updated just now</span>
      </div>
    </div>
  );
}
