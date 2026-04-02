import { useEffect, useState } from "react";
import DashboardSection from "./sections/DashboardSection";
import ProductsSection from "./sections/ProductsSection";
import SalesSection from "./sections/SalesSection";
import ProfileSection from "./sections/ProfileSection";
import { API_BASE_URL } from "./services/http";
import LoginScreen from "./components/LoginScreen";
import { getProfile } from "./services/profileApi";

const tabs = [
  { id: "dashboard", label: "Dashboard", description: "Realtime sales pulse" },
  { id: "products", label: "Products", description: "Inventory and categories" },
  { id: "sales", label: "Sales", description: "Checkout and receipts" },
  { id: "profile", label: "Profile", description: "Store identity and security" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [storeName, setStoreName] = useState("Possum POS");
  const [panelDescription, setPanelDescription] = useState(
    "Setiap layar sudah dipetakan ke endpoint backend yang kamu bangun, jadi dashboard ke dashboard, produk ke produk, sales ke sales."
  );

  useEffect(() => {
    const savedSession = window.sessionStorage.getItem("possum-auth");

    if (!savedSession) {
      return;
    }

    try {
      setSession(JSON.parse(savedSession));
    } catch (_error) {
      window.sessionStorage.removeItem("possum-auth");
    }
  }, []);

  useEffect(() => {
    async function loadStoreProfile() {
      try {
        const profile = await getProfile();
        if (profile?.storeName) {
          setStoreName(profile.storeName);
        }
        if (profile?.panelDescription) {
          setPanelDescription(profile.panelDescription);
        }
      } catch (_error) {
        // Keep fallback store name if profile has not been created yet.
      }
    }

    loadStoreProfile();
  }, []);

  function handleLogin(payload) {
    setSession(payload);
    window.sessionStorage.setItem("possum-auth", JSON.stringify(payload));
  }

  function handleLogout() {
    setSession(null);
    setActiveTab("dashboard");
    window.sessionStorage.removeItem("possum-auth");
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="hero-panel">
        <div>
          <div className="brand-lockup">
            <img
              alt="Possum logo"
              className="brand-lockup__icon"
              src="/logo-possum-clean.png"
            />
          </div>
          <h1>{storeName}</h1>
          <p className="hero-copy">{panelDescription}</p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => setActiveTab("sales")}
              type="button"
            >
              Buka kasir
            </button>
            <button
              className="ghost-button"
              onClick={() => setActiveTab("products")}
              type="button"
            >
              Tambah produk
            </button>
          </div>
        </div>

        <div className="hero-badge">
          <span>API Base</span>
          <strong>{API_BASE_URL}</strong>
          <div className="hero-badge__meta">
            <small>{session.email}</small>
            <button className="ghost-button" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-strip" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <strong>{tab.label}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </nav>

      <main>
        {activeTab === "dashboard" ? <DashboardSection /> : null}
        {activeTab === "products" ? <ProductsSection /> : null}
        {activeTab === "sales" ? <SalesSection /> : null}
        {activeTab === "profile" ? (
          <ProfileSection
            onProfileUpdated={(profile) => {
              if (profile?.storeName) {
                setStoreName(profile.storeName);
              }
              setPanelDescription(
                profile?.panelDescription ||
                  "Setiap layar sudah dipetakan ke endpoint backend yang kamu bangun, jadi dashboard ke dashboard, produk ke produk, sales ke sales."
              );
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
