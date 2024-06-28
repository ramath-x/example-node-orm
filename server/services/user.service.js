const { query, validationResult, body, matchedData, checkSchema } = require('express-validator');
const User = require('../models/User');
const { Sequelize, DataTypes, cast } = require("sequelize");

const medthods = {
    find(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findAll()
                resolve({
                    data: user
                });
            } catch (error) {
                reject(error.message)
            }
        })
    }
}

module.exports = { ...medthods }