const Transport = require("../models/Transport");

const isValidPayload = (body) => {
  const required = [
    "truck_number",
    "gross_weight_kg",
    "tare_weight_kg",
    "discount_kg",
    "unit_price"
  ];

  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      return `${key} is required`;
    }
  }

  const gross = Number(body.gross_weight_kg);
  const tare = Number(body.tare_weight_kg);
  const cargoWeight =
    body.cargo_weight_kg === undefined || body.cargo_weight_kg === null || body.cargo_weight_kg === ""
      ? gross - tare
      : Number(body.cargo_weight_kg);
  const discount = Number(body.discount_kg);
  const unitPrice = Number(body.unit_price);

  if ([gross, tare, cargoWeight, discount, unitPrice].some((n) => Number.isNaN(n))) {
    return "Og'irliklar va narx son bo'lishi kerak";
  }

  if (gross < tare) {
    return "Gross weight cannot be smaller than tare weight";
  }

  if (cargoWeight < discount) {
    return "Yuklangan yuk skintkadan kichik bo'lmasligi kerak";
  }

  return null;
};

function normalizePayload(body) {
  return {
    transport_date: body.transport_date ? new Date(body.transport_date) : new Date(),
    truck_number: String(body.truck_number || "").trim(),
    gross_weight_kg: Number(body.gross_weight_kg),
    tare_weight_kg: Number(body.tare_weight_kg),
    cargo_weight_kg:
      body.cargo_weight_kg === undefined || body.cargo_weight_kg === null || body.cargo_weight_kg === ""
        ? Math.max(Number(body.gross_weight_kg) - Number(body.tare_weight_kg), 0)
        : Number(body.cargo_weight_kg),
    discount_kg: Number(body.discount_kg),
    unit_price: Number(body.unit_price),
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
          totalGrossWeight: { $sum: "$gross_weight_kg" },
          totalTareWeight: { $sum: "$tare_weight_kg" },
          totalCargoWeight: { $sum: "$cargo_weight_kg" },
          totalDiscountWeight: { $sum: "$discount_kg" },
          totalNetWeight: { $sum: "$net_weight_kg" },
          totalPrice: { $sum: "$total_price" },
          avgUnitPrice: { $avg: "$unit_price" }
        }
      }
    ]);

    res.json(
      stats[0] || {
        totalTrips: 0,
        totalGrossWeight: 0,
        totalTareWeight: 0,
        totalCargoWeight: 0,
        totalDiscountWeight: 0,
        totalNetWeight: 0,
        totalPrice: 0,
        avgUnitPrice: 0
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
