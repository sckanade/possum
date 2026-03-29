import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { changePassword, getProfile, upsertProfile } from "../services/profileApi";

export default function ProfileSection() {
  const [profile, setProfile] = useState({
    storeName: "",
    username: "",
    logoUrl: "",
    password: ""
  });
  const [storeId, setStoreId] = useState("-");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordPayload, setPasswordPayload] = useState({
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const payload = await getProfile();

        if (payload) {
          setProfile({
            storeName: payload.storeName || "",
            username: payload.username || "",
            logoUrl: payload.logoUrl || "",
            password: ""
          });
          setStoreId(payload.storeId || "-");
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSaveProfile(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMessage("");

      const payload = await upsertProfile(profile);
      setStoreId(payload.storeId || "-");
      setMessage("Profil toko berhasil diperbarui.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await changePassword(passwordPayload);
      setPasswordPayload({
        currentPassword: "",
        newPassword: ""
      });
      setMessage("Password berhasil diubah.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section-stack">
      <div className="dashboard-grid">
        <GlassCard eyebrow="Store identity" title="Profil Toko">
          {loading ? <p className="muted">Memuat profil...</p> : null}
          <form className="form-grid" onSubmit={handleSaveProfile}>
            <label>
              Nama toko
              <input
                value={profile.storeName}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    storeName: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              Username
              <input
                value={profile.username}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    username: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              URL logo
              <input
                value={profile.logoUrl}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    logoUrl: event.target.value
                  }))
                }
                placeholder="Opsional"
              />
            </label>
            {storeId === "-" ? (
              <label>
                Password awal
                <input
                  type="password"
                  value={profile.password}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      password: event.target.value
                    }))
                  }
                  required
                />
              </label>
            ) : null}
            <label>
              ID toko
              <input value={storeId} disabled readOnly />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              Simpan profil
            </button>
          </form>
        </GlassCard>

        <GlassCard eyebrow="Security" title="Ganti Password">
          <form className="form-grid" onSubmit={handlePasswordChange}>
            <label>
              Password sekarang
              <input
                type="password"
                value={passwordPayload.currentPassword}
                onChange={(event) =>
                  setPasswordPayload((current) => ({
                    ...current,
                    currentPassword: event.target.value
                  }))
                }
                required
              />
            </label>
            <label>
              Password baru
              <input
                type="password"
                value={passwordPayload.newPassword}
                onChange={(event) =>
                  setPasswordPayload((current) => ({
                    ...current,
                    newPassword: event.target.value
                  }))
                }
                required
              />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              Perbarui password
            </button>
          </form>
          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
        </GlassCard>
      </div>
    </div>
  );
}
