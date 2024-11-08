const express = require('express');
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.put('/username', settingsController.handleUsernameChange);
router.put('/email', settingsController.handleEmailChange);
router.put('/password', settingsController.handlePasswordChange);
router.put('/avatarUrl', settingsController.handleAvatarChange);

module.exports = router;
