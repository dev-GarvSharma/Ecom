import { get, post, put } from "../../app/axiosWrapper.js";

export const getMarketingOverview = async () => await get("admin/marketing");
export const getMarketingCampaigns = async (page = 1, records = 20) =>
  await get(`admin/marketing/campaigns?page=${page}&recordPerPage=${records}`);
export const getCampaignDetails = async (campaignId) =>
  await get(`admin/marketing/campaigns/${campaignId}`);
export const getMarketingSubscribers = async (page = 1, records = 20) =>
  await get(
    `admin/marketing/subscribers?page=${page}&recordPerPage=${records}`,
  );
export const createCampaign = async (campaign) =>
  await post("admin/marketing/campaigns", campaign);
export const updateCampaign = async (campaignId, campaign) =>
  await put(`admin/marketing/campaigns/${campaignId}`, campaign);
