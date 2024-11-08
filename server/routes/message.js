const express = require('express');
const  router  = express.Router();
const messageController = require('../controllers/messageController')



router.get("/status/:conversationId", messageController.getMessageReadStatus);
router.put("/status", messageController.handleMessageReadStatusChange);






module.exports = router;