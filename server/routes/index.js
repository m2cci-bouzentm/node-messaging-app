const express = require('express');
const router = express.Router();
const indexController = require("../controllers/indexController");

router.post('/login', indexController.handleUserLogin);
router.post('/signup', indexController.handleUserSignUp);
router.post('/verifyLogin', indexController.verifyUserLogIn);


module.exports = router;
