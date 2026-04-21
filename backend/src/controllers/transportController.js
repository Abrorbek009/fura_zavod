const Transport = require("../models/Transport");

const isValidPayload = (body) => {
  const required = [
    "truck_number",
    "driver_name",
    "origin",
    "destination",
    "gross_weight_kg",
    "tare_weight_kg",
    "unit_price"
  ];

  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      return `${key} is required`;
    }
  }

  const gross = Number(body.gross_weight_kg);
  const tare = Number(body.tare_weight_kg);
  const unitPrice = Number(body.unit_price);

  if ([gross, tare, unitPrice].some((n) => Number.isNaN(n))) {
    return "Gross, tare and unit price must be numbers";
  }

  if (gross < tare) {
    return "Gross weight cannot be smaller than tare weight";
  }

  return null;
};

function normalizePayload(body) {
  return {
    transport_date: body.transport_date ? new Date(body.transport_date) : new Date(),
    truck_number: String(body.truck_number || "").trim(),
    driver_name: String(body.driver_name || "").trim(),
    cargo_name: String(body.cargo_name || "Temir").trim(),
    origin: String(body.origin || "").trim(),
    destination: String(body.destination || "").trim(),
    gross_weight_kg: Number(body.gross_weight_kg),
    tare_weight_kg: Number(body.tare_weight_kg),
    unit_price: Number(body.unit_price),
    currency: body.currency === "USD" ? "USD" : "UZS",
    note: String(body.note || "").trim()
  };
}

exports.createTransport = async (req, res) => {
  try {
    const validationError = isValidPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const transport = await Transport.create(normalizePayload(req.body));
    res.status(201).json(transport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTransports = async (req, res) => {
  try {
    const items = await Transport.find().sort({ transport_date: -1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransportById = async (req, res) => {
  try {
    const item = await Transport.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Transport not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTransport = async (req, res) => {
  try {
    const item = await Transport.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Transport not found" });

    const merged = { ...item.toObject(), ...req.body };
    const validationError = isValidPayload(merged);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(item, normalizePayload(merged));
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTransport = async (req, res) => {
  try {
    const deleted = await Transport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transport not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Transport.aggregate([
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalNetWeight: { $sum: "$net_weight_kg" },
          totalPrice: { $sum: "$total_price" },
          avgUnitPrice: { $avg: "$unit_price" }
        }
      }
    ]);

    res.json(
      stats[0] || {
        totalTrips: 0,
        totalNetWeight: 0,
        totalPrice: 0,
        avgUnitPrice: 0
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
