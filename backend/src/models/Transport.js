const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    transport_date: { type: Date, default: Date.now },
    truck_number: { type: String, required: true, trim: true, uppercase: true },
    gross_weight_kg: { type: Number, required: true, min: 0 },
    tare_weight_kg: { type: Number, required: true, min: 0 },
    cargo_weight_kg: { type: Number, default: 0, min: 0 },
    discount_kg: { type: Number, default: 0, min: 0 },
    net_weight_kg: { type: Number, default: 0, min: 0 },
    unit_price: { type: Number, required: true, min: 0 },
    total_price: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

transportSchema.pre("save", function (next) {
  const gross = Number(this.gross_weight_kg || 0);
  const tare = Number(this.tare_weight_kg || 0);
  const cargoWeight = Number(this.cargo_weight_kg || Math.max(gross - tare, 0));
  const discount = Number(this.discount_kg || 0);
  const unitPrice = Number(this.unit_price || 0);

  this.cargo_weight_kg = cargoWeight;
  this.net_weight_kg = Math.max(cargoWeight - discount, 0);
  this.total_price = Number((this.net_weight_kg * unitPrice).toFixed(2));
  next();
});

module.exports = mongoose.model("Transport", transportSchema);
