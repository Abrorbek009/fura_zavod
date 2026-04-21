const Transport = require("./models/Transport");

const trucks = [
  "50U109DB",
  "60R436EB",
  "50D569HA",
  "60N597CB",
  "60W459QA",
  "60A487XA",
  "60Q765MB",
  "50D964BB",
  "60P315JB",
  "60N621VA",
  "60P041KA",
  "60S688DB",
  "60A357RA",
  "60D683QA",
  "60K118TA",
  "60T552BA",
  "60E772CA",
  "60H904DA",
  "60L221EA",
  "60M774FA",
];

function makeSeedItem(index) {
  const gross = 980 + index * 20;
  const tare = 320 + (index % 5) * 5;
  const cargoWeight = Math.max(gross - tare, 0);
  const discount = index % 3 === 0 ? 0 : index % 4;
  const unitPrice = 30 + (index % 4) * 2;

  return {
    transport_date: new Date(Date.now() - index * 86400000),
    truck_number: trucks[index],
    gross_weight_kg: gross,
    tare_weight_kg: tare,
    cargo_weight_kg: cargoWeight,
    discount_kg: discount,
    unit_price: unitPrice,
  };
}

async function seedTransportsIfEmpty() {
  const count = await Transport.countDocuments();
  if (count > 0) return false;

  const records = Array.from({ length: 20 }, (_, index) => makeSeedItem(index));
  await Transport.insertMany(records);
  console.log("✅ 20 ta namuna fura kirim yozuvi qo'shildi");
  return true;
}

module.exports = { seedTransportsIfEmpty };
