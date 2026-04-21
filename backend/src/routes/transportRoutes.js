const express = require("express");
const controller = require("../controllers/transportController");

const router = express.Router();

router.get("/stats", controller.getStats);
router.get("/", controller.getTransports);
router.get("/:id", controller.getTransportById);
router.post("/", controller.createTransport);
router.put("/:id", controller.updateTransport);
router.delete("/:id", controller.deleteTransport);

module.exports = router;
