const express = require('express');
const  router  = express.Router();
const conversationRouter = require('../controllers/conversationRouter')


 
router.get("/", conversationRouter.getAllConversationsByUserId);
router.post("/twoUsers", conversationRouter.createOrGetIfExistConversationBetweenTwoUsers);
router.put("/twoUsers", conversationRouter.removeUserFromConversation);


router.get("/groups", conversationRouter.getAllGroupsByUserId);
router.post("/groups", conversationRouter.createGroup);
router.put("/groups", conversationRouter.removeUserFromGroup);







module.exports = router;