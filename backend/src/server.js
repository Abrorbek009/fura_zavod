require("dotenv").config();
const app = require("./app");
const { connectDB, stopDB } = require("./db");
const { seedTransportsIfEmpty } = require("./seed");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedTransportsIfEmpty();
  app.listen(PORT, () => {
    console.log(`Backend running on http://127.0.0.1:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await stopDB();
  process.exit(0);
});
