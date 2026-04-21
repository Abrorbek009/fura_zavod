const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    transport_date: { type: Date, default: Date.now },
    truck_number: { type: String, required: true, trim: true, uppercase: true },
    driver_name: { type: String, required: true, trim: true },
    cargo_name: { type: String, default: "Temir", trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    gross_weight_kg: { type: Number, required: true, min: 0 },
    tare_weight_kg: { type: Number, required: true, min: 0 },
    net_weight_kg: { type: Number, default: 0, min: 0 },
    unit_price: { type: Number, required: true, min: 0 },
    total_price: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ["UZS", "USD"], default: "UZS" },
    note: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

transportSchema.pre("save", function (next) {
  const gross = Number(this.gross_weight_kg || 0);
  const tare = Number(this.tare_weight_kg || 0);
  const unitPrice = Number(this.unit_price || 0);

  this.net_weight_kg = Math.max(gross - tare, 0);
  this.total_price = Number((this.net_weight_kg * unitPrice).toFixed(2));
  next();
});

module.exports = mongoose.model("Transport", transportSchema);
