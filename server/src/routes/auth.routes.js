const express = require('express');
const router = express.Router();
const { login, refresh, logout, getMe ,signup,getAllUsers , checkAuth,updateProfile} = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.post('/login', validate(schemas.login), login);
router.post('/create' , validate(schemas.signup) , signup)
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyAccessToken, getMe);
router.get('/check-auth', verifyAccessToken , checkAuth)
router.get("/", verifyAccessToken, getAllUsers);
router.patch("/update-profile", verifyAccessToken, updateProfile);

module.exports = router;
