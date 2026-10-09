import { categories, customers, orders, sales } from "../models/mockData.js";

const campaigns = [
  {
    id: "CMP-001",
    name: "Monsoon ritual edit",
    channel: "Email campaign",
    audience: "All subscribers",
    sent: "Oct 07, 2026",
    open: "48.2%",
    status: "Sent",
  },
  {
    id: "CMP-002",
    name: "Welcome to Cuppanord",
    channel: "Automated flow",
    audience: "New customers",
    sent: "Always on",
    open: "62.8%",
    status: "Active",
  },
  {
    id: "CMP-003",
    name: "Your cart is waiting",
    channel: "Automated flow",
    audience: "Abandoned carts",
    sent: "Always on",
    open: "38.4%",
    status: "Active",
  },
];
const notifications = [
  {
    id: 1,
    title: "New order received",
    detail: "Order ORD-2841 · Mira Kapoor",
    time: "8 min ago",
    tone: "coral",
    read: false,
  },
  {
    id: 2,
    title: "Stock running low",
    detail: "Turmeric Ginger Herbal Infusion",
    time: "32 min ago",
    tone: "yellow",
    read: false,
  },
  {
    id: 3,
    title: "Payout scheduled",
    detail: "₹18,420 will arrive tomorrow",
    time: "2 hours ago",
    tone: "green",
    read: true,
  },
];
let storeSettings = {
  storeName: "Cuppanord",
  currency: "INR",
  timezone: "Asia/Kolkata",
  lowStockThreshold: 10,
  emailNotifications: true,
  orderNotifications: true,
};

const allStockProducts = () =>
  categories.flatMap((category) => category.products);
const findStockProduct = (id) =>
  allStockProducts().find((item) => String(item.id) === String(id));
const findCategory = (id) =>
  categories.find((item) => String(item.id) === String(id));

const applyProduct = (target, values) => {
  const model = target.ConsumableProductsModel;
  if (values.name !== undefined) model.name = values.name;
  if (values.sku !== undefined) {
    target.sku = values.sku;
    model.sku = values.sku;
  }
  if (values.price !== undefined) {
    target.selling_price = String(values.price);
    model.selling_price = String(values.price);
  }
  if (values.mrp !== undefined) {
    target.price = String(values.mrp);
    model.mrp = String(values.mrp);
  }
  if (values.stock !== undefined) target.quantity = String(values.stock);
  if (values.weight !== undefined) model.Weight.quantity = values.weight;
  if (values.showOnShop !== undefined) target.show_on_shop = values.showOnShop;
  if (values.images !== undefined) {
    model.ConsumableProductsModelImages = values.images.map((url, index) => ({
      id: Number(target.id) * 10 + index,
      consumable_product_model_id: model.id,
      url,
      alt: model.name,
      title: model.name,
    }));
    model.image = values.images[0] || null;
  }
  return target;
};

const buildStockProduct = (values) => {
  const id = Date.now();
  const modelId = id + 1;
  const images = values.images || [];
  const model = {
    id: modelId,
    name: values.name,
    sku: values.sku,
    mrp: String(values.mrp || values.price),
    selling_price: String(values.price),
    image: images[0] || null,
    slug: String(values.name)
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-"),
    Weight: {
      id: null,
      quantity: values.weight || "New item",
      WeightTranslations: [],
    },
    ConsumableProductsModelImages: images.map((url, index) => ({
      id: id * 10 + index,
      consumable_product_model_id: modelId,
      url,
      alt: values.name,
      title: values.name,
    })),
    RatingAndReviews: [],
  };
  return {
    id,
    sku: values.sku,
    quantity: String(values.stock || 0),
    price: String(values.mrp || values.price),
    selling_price: String(values.price),
    show_on_shop: true,
    ConsumableProductsModel: model,
    average_rating: 0,
  };
};

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const envelope = (data, purpose) => ({
  statusCode: 200,
  message: "Data fetched successfully!",
  data: structuredClone(data),
  error: null,
  success: true,
  purpose,
  meta: {
    totalRecords: Array.isArray(data) ? data.length : 1,
    totalPages: 1,
    currentPage: 1,
  },
});

export const get = async (url) => {
  await wait(420);
  if (url.startsWith("admin/dashboard")) {
    return envelope(
      {
        sales,
        orders: orders.slice(0, 5),
        products: categories
          .flatMap((category) => category.products)
          .slice(0, 5),
      },
      "Get admin dashboard overview!",
    );
  }
  if (url.startsWith("admin/orders/")) {
    const orderId = url.split("/")[2].split("?")[0];
    const order = orders.find((item) => item.id === orderId);
    return order
      ? envelope(order, "Get order details!")
      : {
          ...envelope(null, "Order not found!"),
          statusCode: 404,
          success: false,
          error: "Order not found",
        };
  }
  if (/^admin\/products\/[^/?]+/.test(url)) {
    const productId = url.split("/")[2].split("?")[0];
    const product = findStockProduct(productId);
    return product
      ? envelope(product, "Get product details!")
      : {
          ...envelope(null, "Product not found!"),
          statusCode: 404,
          success: false,
          error: "Product not found",
        };
  }
  if (/^admin\/categories\/[^/?]+/.test(url)) {
    const categoryId = url.split("/")[2].split("?")[0];
    const category = findCategory(categoryId);
    return category
      ? envelope(category, "Get category details!")
      : {
          ...envelope(null, "Category not found!"),
          statusCode: 404,
          success: false,
          error: "Category not found",
        };
  }
  if (/^admin\/customers\/[^/]+\/orders(?:\?|$)/.test(url)) {
    const customerId = url.split("/")[2];
    const customer = customers.find((item) => item.id === customerId);
    return envelope(
      orders.filter((order) => order.customer === customer?.name),
      "Get customer order history!",
    );
  }
  if (url.startsWith("admin/customers/")) {
    const customerId = url.split("/")[2].split("?")[0];
    const customer = customers.find((item) => item.id === customerId);
    return customer
      ? envelope(customer, "Get customer details!")
      : {
          ...envelope(null, "Customer not found!"),
          statusCode: 404,
          success: false,
          error: "Customer not found",
        };
  }
  if (/^admin\/marketing\/campaigns\/[^/?]+/.test(url)) {
    const campaignId = url.split("/")[3].split("?")[0];
    const campaign = campaigns.find((item) => item.id === campaignId);
    return campaign
      ? envelope(campaign, "Get marketing campaign details!")
      : {
          ...envelope(null, "Campaign not found!"),
          statusCode: 404,
          success: false,
          error: "Campaign not found",
        };
  }
  if (url.startsWith("admin/marketing/subscribers"))
    return envelope(customers, "Get marketing subscribers!");
  if (url.startsWith("admin/marketing/campaigns"))
    return envelope(campaigns, "Get marketing campaigns!");
  if (url.startsWith("admin/notifications"))
    return envelope(notifications, "Get admin notifications!");
  if (url.startsWith("admin/products"))
    return envelope(
      categories,
      "Get products list by category configuration API!",
    );
  if (url.startsWith("admin/categories"))
    return envelope(categories, "Get all product categories!");
  if (url.startsWith("admin/orders"))
    return envelope(orders, "Get all orders!");
  if (url.startsWith("admin/customers"))
    return envelope(customers, "Get all customers!");
  if (url.startsWith("admin/inventory"))
    return envelope(allStockProducts(), "Get inventory stock levels!");
  if (url.startsWith("admin/analytics"))
    return envelope(
      {
        sales,
        orders,
        products: categories.flatMap((category) => category.products),
      },
      "Get store analytics report!",
    );
  if (url.startsWith("admin/marketing"))
    return envelope(
      { subscribers: 2840, revenue: 28460, campaigns: 3 },
      "Get marketing overview!",
    );
  if (url.startsWith("admin/settings"))
    return envelope(storeSettings, "Get store settings!");
  return {
    ...envelope(null, "Mock API route not found!"),
    statusCode: 404,
    success: false,
    error: "Route not found",
  };
};

const notFound = (entity) => ({
  ...envelope(null, `${entity} not found!`),
  statusCode: 404,
  success: false,
  error: `${entity} not found`,
});

const mutate = async (method, url, payload = {}) => {
  await wait(250);
  const segments = url.split("?")[0].split("/");
  const resource = segments[1];
  const id = segments[2];
  let data = payload;

  if (resource === "products" && method === "POST" && segments.length === 2) {
    const product = buildStockProduct(payload);
    const category =
      categories.find((item) => item.name === payload.category) ||
      categories[0];
    category.products.push(product);
    data = product;
  } else if (resource === "products" && method === "PUT") {
    const product = findStockProduct(id);
    if (!product) return notFound("Product");
    const previousCategory = categories.find((category) =>
      category.products.includes(product),
    );
    data = applyProduct(product, payload);
    if (payload.category && previousCategory?.name !== payload.category) {
      const nextCategory = categories.find(
        (category) => category.name === payload.category,
      );
      if (nextCategory) {
        previousCategory.products = previousCategory.products.filter(
          (item) => item !== product,
        );
        nextCategory.products.push(product);
      }
    }
  } else if (
    resource === "products" &&
    method === "PATCH" &&
    id === "visibility"
  ) {
    payload.productIds.forEach((productId) => {
      const product = findStockProduct(productId);
      if (product) product.show_on_shop = payload.showOnShop;
    });
  } else if (resource === "products" && method === "DELETE") {
    let removed = false;
    categories.forEach((category) => {
      const next = category.products.filter(
        (product) => String(product.id) !== id,
      );
      removed ||= next.length !== category.products.length;
      category.products = next;
    });
    if (!removed) return notFound("Product");
  } else if (
    resource === "categories" &&
    method === "POST" &&
    segments.length === 2
  ) {
    const category = {
      id: Date.now(),
      parent_id: null,
      company_info_uuid: "demo",
      products: [],
      canonical_tag: payload.slug,
      meta_keywords: null,
      ...payload,
    };
    categories.unshift(category);
    data = category;
  } else if (resource === "categories" && method === "PUT") {
    const category = findCategory(id);
    if (!category) return notFound("Category");
    Object.assign(category, payload);
    data = category;
  } else if (resource === "categories" && method === "DELETE") {
    const index = categories.findIndex((item) => String(item.id) === id);
    if (index < 0) return notFound("Category");
    data = categories.splice(index, 1)[0];
  } else if (
    resource === "orders" &&
    method === "PATCH" &&
    segments[3] === "status"
  ) {
    const order = orders.find((item) => item.id === id);
    if (!order) return notFound("Order");
    order.status = payload.status;
    data = order;
  } else if (
    resource === "customers" &&
    method === "POST" &&
    segments.length === 2
  ) {
    customers.unshift(payload);
    data = payload;
  } else if (resource === "customers" && method === "PUT") {
    const customer = customers.find((item) => String(item.id) === id);
    if (!customer) return notFound("Customer");
    Object.assign(customer, payload);
    data = customer;
  } else if (resource === "customers" && method === "DELETE") {
    const index = customers.findIndex((item) => String(item.id) === id);
    if (index < 0) return notFound("Customer");
    data = customers.splice(index, 1)[0];
  } else if (resource === "inventory" && method === "PATCH") {
    const product = findStockProduct(id);
    if (!product) return notFound("Inventory product");
    product.quantity = String(payload.quantity);
    data = product;
  } else if (
    resource === "inventory" &&
    method === "POST" &&
    segments[3] === "restock"
  ) {
    const product = findStockProduct(id);
    if (!product) return notFound("Inventory product");
    product.quantity = String(payload.quantity);
    data = product;
  } else if (resource === "settings" && method === "PUT") {
    storeSettings = { ...storeSettings, ...payload };
    data = storeSettings;
  } else if (resource === "notifications" && method === "PATCH") {
    notifications.forEach((notification) => {
      if (
        !payload.notificationIds.length ||
        payload.notificationIds.includes(notification.id)
      )
        notification.read = true;
    });
    data = notifications;
  } else if (
    resource === "marketing" &&
    segments[2] === "campaigns" &&
    method === "POST" &&
    segments.length === 3
  ) {
    campaigns.unshift(payload);
    data = payload;
  } else if (
    resource === "marketing" &&
    segments[2] === "campaigns" &&
    method === "PUT"
  ) {
    const campaign = campaigns.find((item) => item.id === segments[3]);
    if (!campaign) return notFound("Campaign");
    Object.assign(campaign, payload);
    data = campaign;
  }

  return {
    ...envelope(
      { ...data, _method: method, _url: url },
      `Mock ${method} ${url} request accepted!`,
    ),
    message: "Changes saved in this demo session.",
  };
};

export const post = async (url, payload = {}) => mutate("POST", url, payload);
export const put = async (url, payload = {}) => mutate("PUT", url, payload);
export const patch = async (url, payload = {}) => mutate("PATCH", url, payload);
export const remove = async (url) => mutate("DELETE", url, {});
