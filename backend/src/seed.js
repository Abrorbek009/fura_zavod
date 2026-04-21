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

const drivers = [
  "Javlon",
  "Bekzod",
  "Sardor",
  "Aziz",
  "Bekmurod",
  "Rustam",
  "Dilshod",
  "Anvar",
  "Shaxzod",
  "Murod",
  "Said",
  "Islom",
  "Oybek",
  "Sherzod",
  "Azamat",
  "Nodir",
  "Jasur",
  "Komil",
  "Akmal",
  "Farhod",
];

const destinations = [
  "Toshkent",
  "Chirchiq",
  "Angren",
  "Bekobod",
  "Navoiy",
  "Jizzax",
  "Samarqand",
  "Andijon",
  "Namangan",
  "Farg'ona",
];

function makeSeedItem(index) {
  const gross = 980 + index * 20;
  const tare = 320 + (index % 5) * 5;
  const unitPrice = 30 + (index % 4) * 2;
  const cargoName = index % 2 === 0 ? "Temir" : "Metal";

  return {
    transport_date: new Date(Date.now() - index * 86400000),
    truck_number: trucks[index],
    driver_name: drivers[index],
    cargo_name: cargoName,
    origin: "Zavod",
    destination: destinations[index % destinations.length],
    gross_weight_kg: gross,
    tare_weight_kg: tare,
    unit_price: unitPrice,
    currency: "UZS",
    note: `Namuna kirim #${index + 1}`,
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
