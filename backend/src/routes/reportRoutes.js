const express = require("express");
const router = express.Router();

const { downloadReport } = require("../controllers/reportController");

router.get("/:id", downloadReport);

module.exports = router;