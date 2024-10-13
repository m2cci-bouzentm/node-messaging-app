const express = require('express');
const  router  = express.Router();
const usersController = require('../controllers/usersController')



router.get("/", usersController.getUsers);
router.get("/:userId", usersController.getUserById);

router.post("/message/:senderId", usersController.sendMessage);






module.exports = router;