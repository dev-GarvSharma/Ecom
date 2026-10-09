import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Download,
} from "lucide-react";
import { exportAnalyticsReport, getAnalytics } from "./api.js";
import {
  ErrorState,
  LoadingState,
  PageHeading,
  SelectField,
} from "../../components/AdminPrimitives.jsx";
import {
  formatRupees,
  getProductsFromCategories,
} from "../../models/catalog.js";

export default function Analytics({ onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [period, setPeriod] = useState("Last 30 days");
  const load = () => {
    setLoading(true);
    setFailed(false);
    getAnalytics(period)
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getAnalytics(period)
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [period]);
  if (loading) return <LoadingState label="Preparing store analytics" />;
  if (failed) return <ErrorState retry={load} />;
  const orders = response?.data?.orders || [];
  const products = getProductsFromCategories([
    { name: "Catalog", products: response?.data?.products || [] },
  ]);
  const paid = orders.filter((order) => order.payment === "Paid");
  const average = paid.length
    ? Math.round(paid.reduce((sum, item) => sum + item.total, 0) / paid.length)
    : 0;
  const bars = [
    38, 52, 46, 63, 57, 76, 68, 83, 61, 72, 92, 79, 88, 69, 100, 82, 76, 91, 66,
    84, 73, 96, 85, 72, 89, 75, 94, 81, 100, 87,
  ];
  const exportReport = async () => {
    const result = await exportAnalyticsReport(period);
    onNotify(result.message || "Analytics report exported.");
  };
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="PERFORMANCE"
        title="Analytics"
        description="A clear view of sales, products and customer momentum."
        action={
          <div className="admin-heading-actions">
            <SelectField
              value={period}
              onChange={setPeriod}
              options={["Last 7 days", "Last 30 days", "Last 90 days"]}
              ariaLabel="Analytics date range"
            />
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
      <div className="admin-summary-strip">
        <div>
          <span>Total sales</span>
          <strong>
            {formatRupees(paid.reduce((sum, item) => sum + item.total, 0))}
          </strong>
          <small className="change-up">
            <ArrowUpRight size={12} />
            12.8%
          </small>
        </div>
        <div>
          <span>Orders</span>
          <strong>{orders.length}</strong>
          <small className="change-up">
            <ArrowUpRight size={12} />
            8.2%
          </small>
        </div>
        <div>
          <span>Average order value</span>
          <strong>{formatRupees(average)}</strong>
          <small className="change-up">
            <ArrowUpRight size={12} />
            4.1%
          </small>
        </div>
        <div>
          <span>Items sold</span>
          <strong>{products.reduce((sum, item) => sum + item.stock, 0)}</strong>
          <small className="change-down">-2.4%</small>
        </div>
      </div>
      <section className="admin-panel admin-analytics-chart">
        <div className="admin-panel-heading">
          <div>
            <h2>Sales over time</h2>
            <p>Daily revenue · {period.toLowerCase()}</p>
          </div>
          <button className="admin-button admin-button-secondary">
            <CalendarDays size={15} />
            Oct 01 – Oct 30
          </button>
        </div>
        <div className="admin-big-chart">
          <div className="admin-chart-axis">
            <span>₹10k</span>
            <span>₹7.5k</span>
            <span>₹5k</span>
            <span>₹2.5k</span>
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
            <div className="admin-bar-chart">
              {bars.map((height, index) => (
                <div
                  key={index}
                  style={{ height: `${height}%` }}
                  className={index > 24 ? "bar-highlight" : ""}
                  title={`Day ${index + 1}`}
                />
              ))}
            </div>
            <div className="admin-chart-days">
              <span>Oct 01</span>
              <span>Oct 05</span>
              <span>Oct 10</span>
              <span>Oct 15</span>
              <span>Oct 20</span>
              <span>Oct 25</span>
              <span>Oct 30</span>
            </div>
          </div>
        </div>
      </section>
      <div className="admin-bottom-grid">
        <section className="admin-panel admin-insight-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Sales by channel</h2>
              <p>Where your orders come from</p>
            </div>
          </div>
          <div className="admin-channel-row">
            <span className="channel-dot channel-web" />
            <span>Online store</span>
            <strong>72%</strong>
            <div>
              <i style={{ width: "72%" }} />
            </div>
            <small>₹1,32,688</small>
          </div>
          <div className="admin-channel-row">
            <span className="channel-dot channel-social" />
            <span>Social commerce</span>
            <strong>19%</strong>
            <div>
              <i style={{ width: "36%" }} />
            </div>
            <small>₹34,985</small>
          </div>
          <div className="admin-channel-row">
            <span className="channel-dot channel-direct" />
            <span>Direct</span>
            <strong>9%</strong>
            <div>
              <i style={{ width: "18%" }} />
            </div>
            <small>₹16,586</small>
          </div>
        </section>
        <section className="admin-panel admin-insight-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Top products</h2>
              <p>Most ordered in this period</p>
            </div>
          </div>
          {products.slice(0, 4).map((item, index) => (
            <div className="admin-analytics-product" key={item.id}>
              <span className="admin-product-rank">0{index + 1}</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.stock} units sold</small>
              </div>
              <strong>{formatRupees(item.price * item.stock)}</strong>
            </div>
          ))}
        </section>
      </div>
      <button
        className="admin-text-button analytics-export"
        onClick={exportReport}
      >
        <ArrowDownToLine size={15} />
        Download detailed report
      </button>
    </div>
  );
}
