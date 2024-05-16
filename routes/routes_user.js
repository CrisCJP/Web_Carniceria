const express = require('express');
const router_user = express.Router();
const multer = require('multer');
const upload = multer();
const { loginUser } = require('../controller/loginuser_controller');

router_user.post('/login_user', upload.none(), loginUser);

module.exports = router_user;