import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { formatCurrency, formatDate } from "../lib/format";
import { getProducts } from "../services/productsApi";
import { createSale, getSales } from "../services/salesApi";

export default function SalesSection() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phoneNumber: ""
  });
  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: 1,
    paymentMethod: "cash"
  });

  async function loadSalesData() {
    const [productsPayload, salesPayload] = await Promise.all([
      getProducts(),
      getSales()
    ]);

    setProducts(productsPayload || []);
    setSales(salesPayload || []);

    if (!saleForm.productId && productsPayload?.[0]?.id) {
      setSaleForm((current) => ({
        ...current,
        productId: productsPayload[0].id
      }));
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        await loadSalesData();
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    boot();
  }, []);

  async function handleCheckout(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMessage("");

      const response = await createSale({
        customer,
        items: [
          {
            productId: saleForm.productId,
            quantity: Number(saleForm.quantity)
          }
        ],
        paymentMethod: saleForm.paymentMethod
      });

      await loadSalesData();
      setMessage(
        `Transaksi ${response.sale.invoiceNumber} berhasil diproses.`
      );
      setSaleForm((current) => ({
        ...current,
        quantity: 1
      }));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section-stack">
      <div className="dashboard-grid">
        <GlassCard eyebrow="Cashier lane" title="Checkout Cepat">
          <form className="form-grid" onSubmit={handleCheckout}>
            <label>
              Nama pelanggan
              <input
                value={customer.name}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Budi"
                required
              />
            </label>
            <label>
              Nomor WhatsApp
              <input
                value={customer.phoneNumber}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    phoneNumber: event.target.value
                  }))
                }
                placeholder="whatsapp:+6281234567890"
                required
              />
            </label>
            <label>
              Produk
              <select
                value={saleForm.productId}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    productId: event.target.value
                  }))
                }
                required
              >
                <option value="">Pilih produk</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stock} stok)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Jumlah
              <input
                min="1"
                type="number"
                value={saleForm.quantity}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    quantity: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              Metode pembayaran
              <select
                value={saleForm.paymentMethod}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    paymentMethod: event.target.value
                  }))
                }
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              Proses transaksi
            </button>
          </form>
        </GlassCard>

        <GlassCard eyebrow="Status" title="Ringkasan Kasir">
          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <div className="stack-list">
            <div className="list-item">
              <span>Produk aktif</span>
              <strong>{products.length}</strong>
            </div>
            <div className="list-item">
              <span>Total transaksi</span>
              <strong>{sales.length}</strong>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard eyebrow="Recent receipts" title="Riwayat Penjualan">
        <div className="receipt-list">
          {sales.map((sale) => (
            <article className="receipt-card" key={sale.id}>
              <div>
                <small>{sale.invoiceNumber}</small>
                <h3>{sale.customer?.name || "Pelanggan"}</h3>
              </div>
              <strong>{formatCurrency(sale.total)}</strong>
              <span>{formatDate(sale.soldAt)}</span>
            </article>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
