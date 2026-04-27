const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const controller = require("../controllers/admin.controller");

router.get("/stats", auth, controller.getStats);

module.exports = router;
