const express = require('express');
const  router  = express.Router();
const conversationRouter = require('../controllers/conversationRouter')


 
router.get("/", conversationRouter.getAllConversationsByUserId);
router.post("/twoUsers", conversationRouter.createOrGetIfExistConversationBetweenTwoUsers);






module.exports = router;