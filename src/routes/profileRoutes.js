const express = require("express");
const {
  getProfile,
  upsertProfile,
  changePassword
} = require("../controllers/profileController");

const router = express.Router();

router.get("/", getProfile);
router.put("/", upsertProfile);
router.patch("/password", changePassword);

module.exports = router;
