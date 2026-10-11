import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Ellipsis,
  Pencil,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  createProduct,
  getAllProducts,
  getProductDetails,
  exportProducts,
  updateProduct,
  updateProductsVisibility,
} from "./api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ListPagination,
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
import { resolveImageUrl } from "../../../utils/image.js";

export default function Products({ globalSearch = "", onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");
  const [category, setCategory] = useState("All categories");
  const [modal, setModal] = useState(false);
  const [created, setCreated] = useState([]);
  const [edited, setEdited] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageDraft, setImageDraft] = useState(Array(5).fill(""));
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(20);
  const load = () => {
    setLoading(true);
    setFailed(false);
    getAllProducts(page, records)
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getAllProducts(page, records)
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [page, records]);
  const products = useMemo(
    () => [
      ...created,
      ...getProductsFromCategories(response?.data?.data || []).map((item) => ({
        ...item,
        ...edited[item.id],
      })),
    ],
    [created, edited, response],
  );
  const visible = products.filter(
    (item) =>
      `${item.name} ${item.sku} ${item.category}`
        .toLowerCase()
        .includes(`${query} ${globalSearch}`.toLowerCase().trim()) &&
      (status === "All status" || item.status === status) &&
      (category === "All categories" || item.category === category),
  );
  const categories = [
    "All categories",
    ...new Set(products.map((item) => item.category)),
  ];
  const openCreate = () => {
    setEditingProduct(null);
    setImageDraft(Array(5).fill(""));
    setImageFiles(Array(5).fill(null));
    setModal(true);
  };
  const openEdit = async (item) => {
    const result = await getProductDetails(item.id);
    if (!result.success) {
      onNotify(result.message || "Could not load product details.");
      return;
    }
    const apiProduct = result?.data?.data;
    const product = {
      ...item,
      name: apiProduct.ConsumableProductsModel.name,
      sku: apiProduct.sku,
      price: Number(apiProduct.selling_price),
      mrp: Number(apiProduct.price),
      stock: Number(apiProduct.quantity),
      images: (
        apiProduct.ConsumableProductsModel.ConsumableProductsModelImages || []
      ).map((image) => resolveImageUrl(image.url)),
      image:
        resolveImageUrl(
          apiProduct.ConsumableProductsModel.ConsumableProductsModelImages?.[0]
            ?.url,
        ),
    };
    setEditingProduct(product);
    setImageDraft(
      Array.from(
        { length: 5 },
        (_, index) =>
          product.images?.[index] || (index === 0 ? product.image : "") || "",
      ),
    );
    setImageFiles(Array(5).fill(null));
    setModal(true);
  };
  const updateImage = (index, file) => {
    if (!file) return;
    setImageFiles((current) =>
      current.map((currentFile, imageIndex) =>
        imageIndex === index ? file : currentFile,
      ),
    );
    const reader = new FileReader();
    reader.onload = () =>
      setImageDraft((current) =>
        current.map((image, imageIndex) =>
          imageIndex === index ? String(reader.result) : image,
        ),
      );
    reader.readAsDataURL(file);
  };
  const setSelectedProductsVisible = async () => {
    const result = await updateProductsVisibility(selected, true);
    if (!result.success) {
      onNotify(result.message || "Could not update product visibility.");
      return;
    }
    setEdited((current) =>
      Object.fromEntries([
        ...Object.entries(current),
        ...selected.map((id) => [id, { ...current[id], showOnShop: true }]),
      ]),
    );
    setCreated((items) =>
      items.map((item) =>
        selected.includes(item.id) ? { ...item, showOnShop: true } : item,
      ),
    );
    setSelected([]);
    onNotify("Product visibility updated.");
  };

  if (loading) return <LoadingState label="Loading product catalog" />;
  if (failed) return <ErrorState retry={load} />;
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="CATALOG"
        title="Products"
        description="Manage your catalog, pricing and product visibility."
        action={
          <div className="admin-heading-actions">
            <button
              className="admin-button admin-button-secondary"
              onClick={async () => {
                const result = await exportProducts();
                onNotify(result.message || "Products exported.");
              }}
            >
              <Download size={16} />
              Export
            </button>
            <button
              className="admin-button admin-button-dark"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add product
            </button>
          </div>
        }
      />
      <div className="admin-summary-strip">
        <div>
          <span>All products</span>
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
            placeholder="Search products or SKU"
          />
          <div className="admin-filter-group">
            <SlidersHorizontal size={15} />
            <SelectField
              value={category}
              onChange={setCategory}
              options={categories}
              ariaLabel="Filter by category"
            />
            <SelectField
              value={status}
              onChange={setStatus}
              options={["All status", "In stock", "Low stock", "Out of stock"]}
              ariaLabel="Filter by stock status"
            />
          </div>
        </div>
        {selected.length > 0 && (
          <div className="admin-bulk-bar">
            <span>{selected.length} products selected</span>
            <button onClick={setSelectedProductsVisible}>Set visible</button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        <div className="admin-table-wrap">
          <table className="admin-table admin-products-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all products"
                    checked={
                      visible.length > 0 && selected.length === visible.length
                    }
                    onChange={(event) =>
                      setSelected(
                        event.target.checked
                          ? visible.map((item) => item.id)
                          : [],
                      )
                    }
                  />
                </th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>INVENTORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                console.log(item),
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.name}`}
                      checked={selected.includes(item.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, item.id]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                    />
                  </td>
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
                  <td>{item.category}</td>
                  <td className="admin-table-total">
                    {formatRupees(item.price)}{" "}
                    <small className="admin-old-price">
                      {formatRupees(item.mrp)}
                    </small>
                  </td>
                  <td>{item.stock} units</td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="admin-icon-button table-more"
                      aria-label={`Edit ${item.name}`}
                      title="Edit product"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState title="No products match" />}
        </div>
        <ListPagination meta={response?.data?.meta} page={page} records={records} onPageChange={setPage} onRecordsChange={(size) => { setPage(1); setRecords(size); }} label="products" />
      </section>
      {modal && (
        <AdminPortal>
          <div
            className="admin-modal-backdrop admin-product-backdrop"
            role="presentation"
            onMouseDown={(event) =>
              event.target === event.currentTarget &&
              (setModal(false), setEditingProduct(null))
            }
          >
            <form
              className="admin-modal admin-product-modal"
              onSubmit={async (event) => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                const stock = Number(values.get("stock"));
                const filesToUpload = imageFiles.filter(Boolean);
                const images = imageDraft
                  .filter((image, index) => image && !imageFiles[index])
                  .filter(Boolean);
                const next = {
                  name: values.get("name"),
                  sku: values.get("sku"),
                  category: values.get("category"),
                  price: Number(values.get("price")),
                  mrp: Number(values.get("mrp")),
                  stock,
                  weight: values.get("weight") || "New item",
                  images,
                  status:
                    stock === 0
                      ? "Out of stock"
                      : stock < 10
                        ? "Low stock"
                        : "In stock",
                };
                const productFormData = new FormData();
                Object.entries(next).forEach(([key, value]) => {
                  productFormData.append(
                    key,
                    key === "images" ? JSON.stringify(value) : String(value),
                  );
                });
                filesToUpload.forEach((file) =>
                  productFormData.append("images", file),
                );
                const result = editingProduct
                  ? await updateProduct(editingProduct.id, productFormData)
                  : await createProduct(productFormData);
                if (!result.success) {
                  onNotify(result.message || "Could not save product.");
                  return;
                }
                if (editingProduct) {
                  if (editingProduct.mockCreated)
                    setCreated((items) =>
                      items.map((item) =>
                        item.id === editingProduct.id
                          ? { ...item, ...next }
                          : item,
                      ),
                    );
                  else
                    setEdited((items) => ({
                      ...items,
                      [editingProduct.id]: {
                        ...items[editingProduct.id],
                        ...next,
                      },
                    }));
                  onNotify("Product updated through the mock API.");
                } else {
                  setCreated((items) => [
                    { ...next, id: result?.data?.data?.id, mockCreated: true },
                    ...items,
                  ]);
                  onNotify("Product created through the mock API.");
                }
                setModal(false);
                setEditingProduct(null);
              }}
            >
              <div className="admin-modal-header">
                <div>
                  <span className="admin-eyebrow">
                    {editingProduct
                      ? "UPDATE CATALOG ITEM"
                      : "NEW CATALOG ITEM"}
                  </span>
                  <h2>{editingProduct ? "Edit product" : "Add product"}</h2>
                </div>
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label="Close"
                  onClick={() => {
                    setModal(false);
                    setEditingProduct(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <label>
                Product name
                <input
                  name="name"
                  required
                  defaultValue={editingProduct?.name || ""}
                  placeholder="e.g. Himalayan Green Tea"
                />
              </label>
              <div className="admin-form-row">
                <label>
                  SKU
                  <input
                    name="sku"
                    required
                    defaultValue={editingProduct?.sku || ""}
                    placeholder="SKU-100G"
                  />
                </label>
                <label>
                  Category
                  <select
                    name="category"
                    defaultValue={
                      editingProduct?.category || categories[1] || "Premium Tea"
                    }
                  >
                    {categories.slice(1).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  Selling price (₹)
                  <input
                    name="price"
                    type="number"
                    min="1"
                    required
                    defaultValue={editingProduct?.price || ""}
                    placeholder="499"
                  />
                </label>
                <label>
                  Compare-at price (₹)
                  <input
                    name="mrp"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.mrp || ""}
                    placeholder="899"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  Stock quantity
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue={editingProduct?.stock ?? ""}
                    placeholder="20"
                  />
                </label>
                <label>
                  Pack size
                  <input
                    name="weight"
                    defaultValue={editingProduct?.weight || ""}
                    placeholder="100 gm"
                  />
                </label>
              </div>
              <div className="admin-image-editor">
                <div className="admin-image-editor-heading">
                  <div>
                    <strong>Product images</strong>
                    <span>
                      Add up to five images. The first image is used as the main
                      image.
                    </span>
                  </div>
                  <small>{imageDraft.filter(Boolean).length}/5</small>
                </div>
                <div className="admin-image-upload-grid">
                  {imageDraft.map((image, index) => (
                    <div
                      className={`admin-image-slot ${image ? "has-image" : ""}`}
                      key={index}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={`Product image ${index + 1} preview`}
                        />
                      ) : (
                        <span>
                          {index === 0 ? "Main" : `Image ${index + 1}`}
                        </span>
                      )}
                      <label
                        className="admin-image-file-label"
                        aria-label={
                          image
                            ? `Replace image ${index + 1}`
                            : `Add image ${index + 1}`
                        }
                        title={image ? "Replace image" : "Add image"}
                      >
                        {image ? "Replace" : <Plus size={15} />}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            updateImage(index, event.target.files?.[0])
                          }
                        />
                      </label>
                      {image && (
                        <button
                          className="admin-image-remove"
                          type="button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() =>
                            (setImageDraft((current) =>
                              current.map((item, imageIndex) =>
                                imageIndex === index ? "" : item,
                              )),
                              setImageFiles((current) =>
                                current.map((file, imageIndex) =>
                                  imageIndex === index ? null : file,
                                ),
                              ))
                          }
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => {
                    setModal(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="admin-button admin-button-dark"
                  type="submit"
                >
                  {editingProduct ? <Pencil size={15} /> : <Plus size={16} />}
                  {editingProduct ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </AdminPortal>
      )}
    </div>
  );
}
