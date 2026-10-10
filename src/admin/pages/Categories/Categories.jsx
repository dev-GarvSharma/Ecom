import { useEffect, useState } from "react";
import { FolderPlus, Pencil, Plus, X } from "lucide-react";
import {
  createCategory,
  getAllCategories,
  getCategoryDetails,
  updateCategory,
} from "./api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SearchField,
  StatusPill,
} from "../../components/AdminPrimitives.jsx";

export default function Categories({ globalSearch = "", onNotify }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [created, setCreated] = useState([]);
  const [edited, setEdited] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const load = () => {
    setLoading(true);
    setFailed(false);
    getAllCategories()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getAllCategories()
      .then(setResponse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="Loading product categories" />;
  if (failed) return <ErrorState retry={load} />;
  const allCategories = [
    ...created,
    ...(response?.data?.data || []).map((item) => ({ ...item, ...edited[item.id] })),
  ];
  const categories = allCategories.filter((item) =>
    `${item.name} ${item.slug}`
      .toLowerCase()
      .includes(`${query} ${globalSearch}`.toLowerCase().trim()),
  );
  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };
  const openEdit = async (item) => {
    const result = await getCategoryDetails(item.id);
    if (!result.success) {
      onNotify(result.message || "Could not load category details.");
      return;
    }
    setEditingCategory(result?.data?.data);
    setModalOpen(true);
  };
  const saveCategory = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      priority: Number(form.get("priority")),
      meta_title: form.get("metaTitle"),
      meta_description: form.get("metaDescription"),
      robots_meta_tag: form.get("robots"),
      show_on_home_page: form.get("featured") === "on",
    };
    const result = editingCategory
      ? await updateCategory(editingCategory.id, next)
      : await createCategory(next);
    if (!result.success) {
      onNotify(result.message || "Could not save category.");
      return;
    }
    if (editingCategory) {
      if (editingCategory.mockCreated)
        setCreated((items) =>
          items.map((item) =>
            item.id === editingCategory.id ? { ...item, ...next } : item,
          ),
        );
      else
        setEdited((items) => ({
          ...items,
          [editingCategory.id]: { ...items[editingCategory.id], ...next },
        }));
      onNotify("Category updated through the mock API.");
    } else {
      setCreated((items) => [
        {
          id: result?.data?.data?.id,
          mockCreated: true,
          parent_id: null,
          company_info_uuid: "demo",
          products: [],
          canonical_tag: next.slug,
          meta_keywords: null,
          ...next,
        },
        ...items,
      ]);
      onNotify("Category created through the mock API.");
    }
    closeModal();
  };
  return (
    <div className="admin-page-content">
      <PageHeading
        eyebrow="CATALOG STRUCTURE"
        title="Categories"
        description="Organize your catalog and control how collections appear in your store."
        action={
          <button
            className="admin-button admin-button-dark"
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
          >
            <Plus size={17} />
            Add category
          </button>
        }
      />
      <div className="admin-category-grid">
        {categories.map((category, index) => (
          <article className="admin-category-card" key={category.id}>
            <div className={`admin-category-art category-art-${index % 3}`}>
              <FolderPlus size={22} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="admin-category-card-content">
              <div className="admin-category-title">
                <div>
                  <h2>{category.name}</h2>
                  <span>/{category.slug}</span>
                </div>
                <button
                  className="admin-icon-button"
                  aria-label={`Edit ${category.name}`}
                  title="Edit category"
                  onClick={() => openEdit(category)}
                >
                  <Pencil size={15} />
                </button>
              </div>
              <p>{category.description}</p>
              <div className="admin-category-meta">
                <span>
                  <strong>{category.products?.length || 0}</strong> products
                </span>
                <StatusPill>
                  {category.show_on_home_page ? "Featured" : "Hidden"}
                </StatusPill>
              </div>
            </div>
          </article>
        ))}
        {!categories.length && <EmptyState title="No categories found" />}
      </div>
      <div className="admin-list-toolbar admin-category-search">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search categories"
        />
        <span className="admin-muted-count">
          {categories.length} categories
        </span>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Category settings</h2>
            <p>SEO and storefront visibility</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CATEGORY</th>
                <th>HOME PAGE</th>
                <th>PRIORITY</th>
                <th>META TITLE</th>
                <th>ROBOTS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <StatusPill>
                      {item.show_on_home_page ? "Visible" : "Hidden"}
                    </StatusPill>
                  </td>
                  <td>{item.priority}</td>
                  <td>{item.meta_title}</td>
                  <td className="admin-code">{item.robots_meta_tag}</td>
                  <td>
                    <button
                      className="admin-icon-button table-more"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeModal()
          }
        >
          <form
            className="admin-modal admin-category-modal"
            onSubmit={saveCategory}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">CATALOG STRUCTURE</span>
                <h2>{editingCategory ? "Edit category" : "Add category"}</h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                aria-label="Close"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>
            <label>
              Category name
              <input
                name="name"
                required
                defaultValue={editingCategory?.name || ""}
                placeholder="e.g. Herbal Infusions"
              />
            </label>
            <label>
              URL slug
              <input
                name="slug"
                required
                defaultValue={editingCategory?.slug || ""}
                placeholder="herbal-infusions"
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="2"
                defaultValue={editingCategory?.description || ""}
                placeholder="Short collection description"
              />
            </label>
            <div className="admin-form-row">
              <label>
                Priority
                <input
                  name="priority"
                  type="number"
                  min="0"
                  defaultValue={editingCategory?.priority ?? 1}
                />
              </label>
              <label>
                Robots meta
                <select
                  name="robots"
                  defaultValue={
                    editingCategory?.robots_meta_tag || "index, follow"
                  }
                >
                  <option>index, follow</option>
                  <option>noindex, follow</option>
                  <option>noindex, nofollow</option>
                </select>
              </label>
            </div>
            <label>
              Meta title
              <input
                name="metaTitle"
                defaultValue={editingCategory?.meta_title || ""}
                placeholder="Search result title"
              />
            </label>
            <label>
              Meta description
              <textarea
                name="metaDescription"
                rows="2"
                defaultValue={editingCategory?.meta_description || ""}
                placeholder="Search result description"
              />
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editingCategory?.show_on_home_page || false}
              />
              Show on home page
            </label>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button className="admin-button admin-button-dark" type="submit">
                {editingCategory ? <Pencil size={15} /> : <Plus size={16} />}
                {editingCategory ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
