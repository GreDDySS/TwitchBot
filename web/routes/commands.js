const {Router} = require("express")
const {getAll} = require("../controllers/commands.js")
const router = Router()


router.get('/api/commands', getAll)

module.exports = router