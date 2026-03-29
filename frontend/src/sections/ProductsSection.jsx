import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  createCategory,
  createProduct,
  getCategories,
  getProducts
} from "../services/productsApi";
import { formatCurrency } from "../lib/format";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });
  const [productForm, setProductForm] = useState({
    name: "",
    stock: 0,
    price: 0,
    categoryId: "",
    imageUrl: ""
  });

  async function loadCatalog() {
    const [productsPayload, categoriesPayload] = await Promise.all([
      getProducts(),
      getCategories()
    ]);

    setProducts(productsPayload || []);
    setCategories(categoriesPayload || []);

    if (!productForm.categoryId && categoriesPayload?.[0]?.id) {
      setProductForm((current) => ({
        ...current,
        categoryId: categoriesPayload[0].id
      }));
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        await loadCatalog();
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    boot();
  }, []);

  async function handleCategorySubmit(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMessage("");

      const category = await createCategory(categoryForm);
      await loadCatalog();
      setCategoryForm({ name: "", description: "" });
      setProductForm((current) => ({
        ...current,
        categoryId: category.id
      }));
      setMessage("Kategori baru berhasil ditambahkan.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    try {
      if (!categories.length) {
        throw new Error("Buat minimal satu kategori dulu sebelum menambah produk.");
      }

      setBusy(true);
      setError("");
      setMessage("");
      await createProduct({
        ...productForm,
        stock: Number(productForm.stock),
        price: Number(productForm.price)
      });
      await loadCatalog();
      setProductForm((current) => ({
        ...current,
        name: "",
        stock: 0,
        price: 0,
        imageUrl: ""
      }));
      setMessage("Produk baru berhasil ditambahkan.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.id?.toLowerCase().includes(keyword) ||
      product.category?.name?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="section-stack">
      <GlassCard eyebrow="Owner tools" title="Tambah Produk dari Frontend">
        <div className="owner-panel">
          <div>
            <p className="owner-panel__title">Panel pemilik toko</p>
            <p className="muted">
              Pemilik toko bisa menambah kategori dan produk langsung dari UI ini,
              tanpa perlu mengetik request manual ke API.
            </p>
          </div>
          <div className="owner-panel__stats">
            <div className="list-item">
              <span>Total kategori</span>
              <strong>{categories.length}</strong>
            </div>
            <div className="list-item">
              <span>Total produk</span>
              <strong>{products.length}</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="dashboard-grid">
        <GlassCard eyebrow="Dynamic taxonomy" title="Buat Kategori">
          <form className="form-grid" onSubmit={handleCategorySubmit}>
            <label>
              Nama kategori
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Contoh: Minuman"
                required
              />
            </label>
            <label>
              Deskripsi
              <input
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                placeholder="Kategori untuk produk dingin"
              />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              Simpan kategori
            </button>
          </form>
        </GlassCard>

        <GlassCard eyebrow="Inventory flow" title="Tambah Produk">
          {!categories.length ? (
            <p className="error-text">
              Belum ada kategori. Buat kategori dulu supaya produk bisa disimpan.
            </p>
          ) : null}
          <form className="form-grid" onSubmit={handleProductSubmit}>
            <label>
              Nama produk
              <input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Es Teh"
                required
              />
            </label>
            <label>
              Stok
              <input
                min="0"
                type="number"
                value={productForm.stock}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    stock: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              Harga
              <input
                min="0"
                type="number"
                value={productForm.price}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    price: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              Kategori
              <select
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    categoryId: event.target.value
                  }))
                }
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              URL gambar
              <input
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    imageUrl: event.target.value
                  }))
                }
                placeholder="Opsional"
              />
            </label>
            {productForm.imageUrl ? (
              <div className="image-preview">
                <img alt="Preview produk" src={productForm.imageUrl} />
                <span>Preview gambar produk</span>
              </div>
            ) : null}
            <button className="primary-button" disabled={busy} type="submit">
              Simpan produk
            </button>
          </form>
        </GlassCard>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <GlassCard
        eyebrow="Catalog"
        title="Daftar Produk"
        action={
          <div className="catalog-toolbar">
            <input
              className="toolbar-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari produk, ID, kategori"
            />
            <span className="muted">{filteredProducts.length} produk</span>
          </div>
        }
      >
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || "-"}</td>
                  <td>{product.stock}</td>
                  <td>{formatCurrency(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
