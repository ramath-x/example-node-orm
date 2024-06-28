const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes, cast } = require("sequelize");
const { query, validationResult, body, matchedData, checkSchema } = require('express-validator');
// const { createUserValidationSchema } = require("../utils/validationSchemas.js")
const { userValidationRules } = require('../utils/user')
const validationHandler = require('../middlewares/validationHandler')
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
});



const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true

    }
}, {
    timestamps: true
})

const Address = sequelize.define("addresses", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
    {},
);

User.hasMany(Address)
Address.belongsTo(User)

router.use(require('./user'))

router.get('/api/users/:id/address', async (req, res) => {
    try {
        const userId = req.params.id
        const results = await User.findOne({
            where: { id: userId },
            include: {
                model: Address
            }
        })
        res.json({
            data: results
        });
    } catch (error) {
        console.log('Error insert users adddress:', error.message)
        res.json({
            massage: 'Error insert users adddress',
            errorMessage: error.message
        })
    }
})



//  path = POST /user + address
// router.post('/user', async (req, res) => {
router.post('/user', userValidationRules(), validationHandler, async (req, res, next) => {
    try {
        const user = matchedData(req)
        let addresses = req.body.addresses;
        // console.log(user)
        let addressCreated = []
        const data = await User.create(user)
        user.userId = await data.id
        const addressData = addresses
        console.log(addressData)
        for (let i = 0; i < addressData.length; i++) {
            let cAddressData = addressData[i]
            cAddressData.userId = user.userId
            const address = await Address.create(cAddressData)
            addressCreated.push(address)
        }

        res.json({
            success: 'insert ok',
            user: data,
            address: addressCreated
        });
    } catch (errors) {
        console.error('insert user:', errors)
        res.status(500).json({
            message: 'insert error',
            error: errors.errors.map(e => e.message)
            // errorMessage: errors
        })
    }
})

//  path = PUT /use/:id
router.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userData = req.body;
        await User.update(userData, { where: { id: userId } })
        const addressData = userData.addresses
        const results = await User.findOne({
            where: { id: userId },
        })
        let addressUserted = []
        for (let i = 0; i < addressData.length; i++) {
            let cAddressData = addressData[i]
            cAddressData.userId = userId
            const address = await Address.upsert(cAddressData)
            addressUserted.push(address)
        }

        res.json({
            success: 'insert ok',
            user: results,
            address: addressUserted
        });
    } catch (errors) {
        console.error('insert user:', errors)
        res.status(500).json({
            message: 'insert error',

        })
    }
})

// path = DELETE /user/:id
router.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const results = await User.destroy({ where: { id: userId } })
        // const address = await Address.destroy({ where: { userId: userId } })
        res.json({
            success: 'deleted ok',
            user: results,
        });
    } catch (error) {

        res.status(500).json({
            message: 'delete error',
            error: dataError
        })
    }


})

// api for pactise validation
// path = POST /user/validation
router.post('/user/validation', userValidationRules(), validationHandler, async (req, res, next) => {
    try {
        const data = matchedData(req)
        res.json({
            success: 'insert ok',
            user: data,
            // address: addressCreated
        });
    } catch (error) {
        res.status(400).error(error)
    }


})

module.exports = router;