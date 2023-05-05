const {commandsData} = require("../../utils/commands")

module.exports.getAll = (req, res) => {
    res.status(200).json(commandsData)
} 