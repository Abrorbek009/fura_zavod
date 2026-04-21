import { useEffect, useMemo, useState } from "react";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const USD_RATE = 12600;

const emptyForm = {
  transport_date: new Date().toISOString().slice(0, 16),
  truck_number: "",
  driver_name: "",
  cargo_name: "Temir",
  origin: "",
  destination: "",
  gross_weight_kg: "",
  tare_weight_kg: "",
  unit_price: "",
  currency: "UZS",
  note: "",
};

function toLocalInputValue(value) {
  const d = value ? new Date(value) : new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function money(value) {
  return Number(value || 0).toLocaleString();
}

export default function App() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalNetWeight: 0,
    totalPrice: 0,
    avgUnitPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const gross = Number(form.gross_weight_kg || 0);
  const tare = Number(form.tare_weight_kg || 0);
  const unitPrice = Number(form.unit_price || 0);
  const netWeight = Math.max(gross - tare, 0);
  const totalPrice = netWeight * unitPrice;
  const totalPriceUzs =
    form.currency === "UZS" ? totalPrice : "";
  const totalPriceUsd =
    form.currency === "USD" ? totalPrice : "";

  async function loadData() {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/transports`),
        fetch(`${API_URL}/api/transports/stats`),
      ]);
      setItems(await itemsRes.json());
      setStats(await statsRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.truck_number,
        item.driver_name,
        item.cargo_name,
        item.origin,
        item.destination,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, search]);

  useEffect(() => {
    setPage(1);
  }, [search, items.length]);

  const totalPages = Math.max(Math.ceil(filteredItems.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setForm({
      transport_date: toLocalInputValue(item.transport_date),
      truck_number: item.truck_number || "",
      driver_name: item.driver_name || "",
      cargo_name: item.cargo_name || "Temir",
      origin: item.origin || "",
      destination: item.destination || "",
      gross_weight_kg: String(item.gross_weight_kg ?? ""),
      tare_weight_kg: String(item.tare_weight_kg ?? ""),
      unit_price: String(item.unit_price ?? ""),
      currency: item.currency || "UZS",
      note: item.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        transport_date: new Date(form.transport_date).toISOString(),
        gross_weight_kg: Number(form.gross_weight_kg),
        tare_weight_kg: Number(form.tare_weight_kg),
        unit_price: Number(form.unit_price),
      };

      const url = editingId
        ? `${API_URL}/api/transports/${editingId}`
        : `${API_URL}/api/transports`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Save failed");
      }

      resetForm();
      await loadData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Ushbu yozuv o'chirilsinmi?")) return;
    const response = await fetch(`${API_URL}/api/transports/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.message || "Delete failed");
      return;
    }
    await loadData();
  }

  return (
    <div className="appShell">
      <header className="topbar">
        <div>
          <p className="topbarKicker">Temir Zavod</p>
          <h1>Fura kirim inputlari</h1>
          <p className="topbarText">
            Oddiy jadval uslubida fura raqami, og'irlik va narxlarni kiriting.
          </p>
        </div>
        <button className="refreshBtn" onClick={loadData}>
          Yangilash
        </button>
      </header>

      <section className="statsRow">
        <div className="statBox">
          <span>Reyslar</span>
          <strong>{stats.totalTrips}</strong>
        </div>
        <div className="statBox">
          <span>Netto kg</span>
          <strong>{money(stats.totalNetWeight)}</strong>
        </div>
        <div className="statBox">
          <span>Jami narx</span>
          <strong>{money(stats.totalPrice)}</strong>
        </div>
        <div className="statBox">
          <span>Jami narx $</span>
          <strong>{money(stats.totalPrice / USD_RATE)}</strong>
        </div>
        <div className="statBox">
          <span>O'rtacha 1 kg</span>
          <strong>{money(stats.avgUnitPrice)}</strong>
        </div>
      </section>

      <section className="sheet">
        <div className="sheetHead">
          <h2>{editingId ? "Yozuvni tahrirlash" : "Yangi yozuv"}</h2>
          <input
            className="search"
            placeholder="Qidirish: fura, haydovchi, yo'nalish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="gridHeader">
            <div>Sana</div>
            <div>Fura</div>
            <div>Haydovchi</div>
            <div>Qayerdan</div>
            <div>Qayerga</div>
            <div>Brutto kg</div>
            <div>Tara kg</div>
            <div>Netto kg</div>
            <div>1 kg narx</div>
            <div>Jami narx</div>
            <div>Jami narx $</div>
            <div>Valyuta</div>
          </div>

          <div className="gridBody">
            <input
              type="datetime-local"
              value={form.transport_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, transport_date: e.target.value }))
              }
            />
            <input
              value={form.truck_number}
              onChange={(e) =>
                setForm((p) => ({ ...p, truck_number: e.target.value }))
              }
              placeholder="50U109DB"
              required
            />
            <input
              value={form.driver_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, driver_name: e.target.value }))
              }
              placeholder="Haydovchi"
              required
            />
            <input
              value={form.origin}
              onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))}
              placeholder="Zavod"
              required
            />
            <input
              value={form.destination}
              onChange={(e) =>
                setForm((p) => ({ ...p, destination: e.target.value }))
              }
              placeholder="Boshqa joy"
              required
            />
            <input
              type="number"
              value={form.gross_weight_kg}
              onChange={(e) =>
                setForm((p) => ({ ...p, gross_weight_kg: e.target.value }))
              }
              required
            />
            <input
              type="number"
              value={form.tare_weight_kg}
              onChange={(e) =>
                setForm((p) => ({ ...p, tare_weight_kg: e.target.value }))
              }
              required
            />
            <input className="readonly" value={netWeight.toLocaleString()} readOnly />
            <input
              type="number"
              value={form.unit_price}
              onChange={(e) =>
                setForm((p) => ({ ...p, unit_price: e.target.value }))
              }
              required
            />
            <input
              className={`readonly ${form.currency === "UZS" ? "activeTotal" : "inactiveTotal"}`}
              value={form.currency === "UZS" ? money(totalPriceUzs) : ""}
              placeholder="—"
              readOnly
            />
            <input
              className={`readonly ${form.currency === "USD" ? "activeTotal" : "inactiveTotal"}`}
              value={form.currency === "USD" ? money(totalPriceUsd) : ""}
              placeholder="—"
              readOnly
            />
            <select
              value={form.currency}
              onChange={(e) =>
                setForm((p) => ({ ...p, currency: e.target.value }))
              }
            >
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="notesRow">
            <label className="noteField">
              Izoh
              <input
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Masalan: zavoddan oldi, omborga yetkazildi"
              />
            </label>

            <div className="actions">
              <button className="primary" type="submit" disabled={saving}>
                {saving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Saqlash"}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Bekor qilish
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      <section className="sheet">
        <div className="listHead">
          <h2>Yozuvlar</h2>
          <div className="pager">
            <button
              type="button"
              className="pageBtn"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Oldingi sahifa"
            >
              <RxDoubleArrowLeft />
            </button>
            <span className="pageInfo">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pageBtn"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Keyingi sahifa"
            >
              <RxDoubleArrowRight />
            </button>
          </div>
        </div>
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Fura</th>
                  <th>Haydovchi</th>
                  <th>Yo'nalish</th>
                  <th>Brutto</th>
                  <th>Tara</th>
                  <th>Netto</th>
                  <th>1 kg narx</th>
                  <th>Jami</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.transport_date).toLocaleDateString()}</td>
                    <td>{item.truck_number}</td>
                    <td>{item.driver_name}</td>
                    <td>
                      {item.origin} → {item.destination}
                    </td>
                    <td>{money(item.gross_weight_kg)}</td>
                    <td>{money(item.tare_weight_kg)}</td>
                    <td className="highlight">{money(item.net_weight_kg)}</td>
                    <td>{money(item.unit_price)}</td>
                    <td className="totalCell">{money(item.total_price)}</td>
                    <td className="rowActions">
                      <button type="button" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: 20 }}>
                      Hech qanday yozuv topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
