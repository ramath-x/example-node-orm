const Service = require('../services/user.service')

const medthods = {
    async onGetAll(req, res) {
        try {
            const results = await Service.find(req)
            res.json(results);
        } catch (error) {
            console.log(error)
            // res(error)
        }
    }

}

module.exports = { ...medthods }