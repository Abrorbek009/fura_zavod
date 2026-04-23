const app = require("../src/app");
const { connectDB } = require("../src/db");
const { seedTransportsIfEmpty } = require("../src/seed");

let initPromise;

async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await seedTransportsIfEmpty();
    })();
  }

  return initPromise;
}

module.exports = async (req, res) => {
  await ensureInit();
  return app(req, res);
};
