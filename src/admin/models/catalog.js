export const getProductsFromCategories = (categoryResponse = []) =>
  categoryResponse.flatMap((category) =>
    (category.products || []).map((stockProduct) => {
      const model = stockProduct.ConsumableProductsModel || {};
      const images = (model.ConsumableProductsModelImages || [])
        .map((image) => (typeof image === "string" ? image : image.url))
        .filter(Boolean);
      if (!images.length && model.image) images.push(model.image);
      return {
        id: stockProduct.id,
        modelId: model.id,
        name: model.name || "Unnamed product",
        sku: stockProduct.sku || model.sku || "—",
        category: category.name,
        price: Number(stockProduct.selling_price || model.selling_price || 0),
        mrp: Number(stockProduct.price || model.mrp || 0),
        stock: Number(stockProduct.quantity || 0),
        weight: model.Weight?.quantity || "—",
        images: images.slice(0, 5),
        image: images[0] || "",
        slug: model.slug || "",
        showOnShop: Boolean(stockProduct.show_on_shop),
        rating: Number(stockProduct.average_rating || 0),
        status:
          Number(stockProduct.quantity) === 0
            ? "Out of stock"
            : Number(stockProduct.quantity) < 10
              ? "Low stock"
              : "In stock",
      };
    }),
  );

export const formatRupees = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
