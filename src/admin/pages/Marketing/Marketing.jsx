import { useEffect, useState } from "react";
import {
  ArrowRight,
  Gift,
  Mail,
  Megaphone,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  createCampaign,
  getCampaignDetails,
  getMarketingCampaigns,
  getMarketingOverview,
  getMarketingSubscribers,
  updateCampaign,
} from "./api.js";
import {
  ErrorState,
  LoadingState,
  PageHeading,
  StatusPill,
} from "../../components/AdminPrimitives.jsx";

const campaigns = [
  {
    name: "Monsoon ritual edit",
    channel: "Email campaign",
    audience: "All subscribers",
    sent: "Oct 07, 2026",
    open: "48.2%",
    status: "Sent",
    icon: Mail,
  },
  {
    name: "Welcome to Cuppanord",
    channel: "Automated flow",
    audience: "New customers",
    sent: "Always on",
    open: "62.8%",
    status: "Active",
    icon: Sparkles,
  },
  {
    name: "Your cart is waiting",
    channel: "Automated flow",
    audience: "Abandoned carts",
    sent: "Always on",
    open: "38.4%",
    status: "Active",
    icon: Tag,
  },
];

export default function Marketing({ onNotify }) {
  const [response, setResponse] = useState(null);
  const [campaignList, setCampaignList] = useState(campaigns);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setLoading(true);
    setFailed(false);
    Promise.all([getMarketingOverview(), getMarketingCampaigns()])
      .then(([overview, campaignResponse]) => {
        setResponse(overview);
        if (campaignResponse.success)
          setCampaignList(campaignResponse.data || []);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    Promise.all([getMarketingOverview(), getMarketingCampaigns()])
      .then(([overview, campaignResponse]) => {
        setResponse(overview);
        if (campaignResponse.success)
          setCampaignList(campaignResponse.data || []);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  const createDraft = async (channel = "Email campaign") => {
    const campaign = {
      id: `CMP-${Date.now()}`,
      name: `New ${channel.toLowerCase()}`,
      channel,
      audience: "All subscribers",
      sent: "Draft",
      open: "—",
      status: "Draft",
    };
    const result = await createCampaign(campaign);
    if (!result.success) {
      onNotify(result.message || "Could not create campaign draft.");
      return;
    }
    setCampaignList((items) => [campaign, ...items]);
    onNotify("Campaign draft created through the mock API.");
  };
  const handleCampaignAction = async (campaign) => {
    if (campaign.status === "Sent") {
      const result = await getCampaignDetails(campaign.id);
      onNotify(
        result.success
          ? `${result.data.name}: ${result.data.open} open rate.`
          : result.message,
      );
      return;
    }
    const status = campaign.status === "Active" ? "Paused" : "Active";
    const result = await updateCampaign(campaign.id, { status });
    if (!result.success) {
      onNotify(result.message || "Could not update campaign.");
      return;
    }
    setCampaignList((items) =>
      items.map((item) =>
        item.id === campaign.id ? { ...item, status } : item,
      ),
    );
    onNotify(`Campaign ${status.toLowerCase()} through the mock API.`);
  };
  const viewSubscribers = async () => {
    const result = await getMarketingSubscribers();
    onNotify(
      result.success
        ? `${result.meta.totalRecords} demo subscribers loaded.`
        : result.message,
    );
  };
  if (loading) return <LoadingState label="Loading marketing workspace" />;
  if (failed) return <ErrorState retry={load} />;
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="GROWTH"
        title="Marketing"
        description="Bring customers back with thoughtful campaigns and offers."
        action={
          <button
            className="admin-button admin-button-dark"
            onClick={() => createDraft()}
          >
            <Plus size={17} />
            Create campaign
          </button>
        }
      />
      <div className="admin-marketing-hero">
        <div className="admin-marketing-art">
          <div className="marketing-art-circle">
            <Megaphone size={29} />
          </div>
          <span>THE DAILY POUR</span>
          <i className="marketing-art-stroke" />
        </div>
        <div className="admin-marketing-copy">
          <span className="admin-eyebrow">A LITTLE MORE PERSONAL</span>
          <h2>
            Make the next cup
            <br />
            feel like theirs.
          </h2>
          <p>
            Share a seasonal favorite or send a thank-you to your most loyal
            customers.
          </p>
          <button
            className="admin-button admin-button-dark"
            onClick={() => createDraft()}
          >
            Start a campaign <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="admin-summary-strip">
        <div>
          <span>Subscribers</span>
          <strong>2,840</strong>
        </div>
        <div>
          <span>Campaign revenue</span>
          <strong>₹28,460</strong>
        </div>
        <div>
          <span>Average open rate</span>
          <strong>42.6%</strong>
        </div>
        <div>
          <span>Active automations</span>
          <strong>3</strong>
        </div>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Recent campaigns</h2>
            <p>Your messages, all in one place</p>
          </div>
          <button className="admin-text-button" onClick={viewSubscribers}>
            View subscribers <ArrowRight size={15} />
          </button>
        </div>
        <div className="admin-marketing-list">
          {campaignList.map(
            ({ id, name, channel, audience, sent, open, status }) => (
              <div className="admin-campaign-row" key={name}>
                <span className="admin-campaign-icon">
                  {channel.toLowerCase().includes("email") ? (
                    <Mail size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                </span>
                <div className="admin-campaign-main">
                  <strong>{name}</strong>
                  <span>
                    {channel} · {audience}
                  </span>
                </div>
                <span className="campaign-sent">{sent}</span>
                <div className="campaign-open">
                  <strong>{open}</strong>
                  <span>open rate</span>
                </div>
                <StatusPill>{status}</StatusPill>
                <button
                  className="admin-button admin-button-secondary campaign-action"
                  onClick={() =>
                    handleCampaignAction({
                      id,
                      name,
                      channel,
                      audience,
                      sent,
                      open,
                      status,
                    })
                  }
                >
                  {status === "Active" ? "Edit" : "View report"}
                </button>
              </div>
            ),
          )}
        </div>
      </section>
      <div className="admin-marketing-shortcuts">
        <button onClick={() => createDraft("Email campaign")}>
          <span>
            <Mail size={18} />
          </span>
          <strong>Email campaign</strong>
          <small>Share news, launches and stories.</small>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => createDraft("Discount campaign")}>
          <span>
            <Gift size={18} />
          </span>
          <strong>Discount code</strong>
          <small>Reward a customer or create an offer.</small>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => createDraft("Customer segment")}>
          <span>
            <Sparkles size={18} />
          </span>
          <strong>Customer segment</strong>
          <small>Build an audience around behavior.</small>
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="admin-page-footnote">
        <span>Campaign metrics shown are demo data.</span>
        <span>{response?.message}</span>
      </div>
    </div>
  );
}
