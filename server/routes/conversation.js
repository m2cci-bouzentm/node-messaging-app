const express = require('express');
const  router  = express.Router();
const conversationRouter = require('../controllers/conversationRouter')


 
router.post("/twoUsers", conversationRouter.createOrGetIfExistConversationBetweenTwoUsers);
// router.post("/group", conversationRouter.getConversationBetweenTwoUsers);






module.exports = router;