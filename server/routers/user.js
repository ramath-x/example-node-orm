const router = require('express').Router();
const controllers = require('../controllers/user.controller')

// path = GET /users
router.get('/api/users', controllers.onGetAll)

module.exports = router