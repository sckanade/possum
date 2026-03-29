const bcrypt = require("bcryptjs");
const { StoreProfile } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequired } = require("../middlewares/validate");
const { prefixedId } = require("../utils/ids");
const AppError = require("../utils/appError");

const getProfile = asyncHandler(async (_req, res) => {
  const profile = await StoreProfile.findOne();

  if (!profile) {
    return res.json(null);
  }

  res.json({
    id: profile.id,
    storeId: profile.storeId,
    storeName: profile.storeName,
    logoUrl: profile.logoUrl,
    username: profile.username
  });
});

const upsertProfile = asyncHandler(async (req, res) => {
  validateRequired(["storeName", "username"], req.body);

  let profile = await StoreProfile.findOne();

  if (!profile) {
    validateRequired(["password"], req.body);

    profile = await StoreProfile.create({
      storeId: prefixedId("STR"),
      storeName: req.body.storeName,
      logoUrl: req.body.logoUrl || null,
      username: req.body.username,
      passwordHash: await bcrypt.hash(req.body.password, 10)
    });
  } else {
    await profile.update({
      storeName: req.body.storeName ?? profile.storeName,
      logoUrl: req.body.logoUrl !== undefined ? req.body.logoUrl : profile.logoUrl,
      username: req.body.username ?? profile.username
    });
  }

  res.json({
    id: profile.id,
    storeId: profile.storeId,
    storeName: profile.storeName,
    logoUrl: profile.logoUrl,
    username: profile.username
  });
});

const changePassword = asyncHandler(async (req, res) => {
  validateRequired(["currentPassword", "newPassword"], req.body);

  const profile = await StoreProfile.findOne();
  if (!profile) {
    throw new AppError(404, "Store profile not found");
  }

  const isValid = await bcrypt.compare(req.body.currentPassword, profile.passwordHash);
  if (!isValid) {
    throw new AppError(400, "Current password is invalid");
  }

  await profile.update({
    passwordHash: await bcrypt.hash(req.body.newPassword, 10)
  });

  res.json({ message: "Password updated successfully" });
});

module.exports = {
  getProfile,
  upsertProfile,
  changePassword
};
