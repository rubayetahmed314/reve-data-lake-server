const express = require("express");
const router = express.Router();

const { getData, postData, convert } = require("./controller");

router.get("/getData", getData);
router.post("/postData", postData);
router.post("/convert", convert);

module.exports = router;
