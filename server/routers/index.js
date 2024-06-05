const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes, cast } = require("sequelize");
const { query, validationResult, body, matchedData, checkSchema } = require('express-validator');
import { createUserValidationSchema } from ("../utils/validationSchemas.mjs")
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

// path = GET /users
router.get('/users',
    // validation search=string, 3-10 characters, sort_feld=string, asc/desc
    [query('search')
        .isString()
        .withMessage('search must be a string')
        .isLength({ min: 3, max: 10 })
        .withMessage('search must be between 3 and 10 characters'),
    query('sort_field')
        .isString()
        .withMessage('sort_field must be a string')
        .isIn(['name', 'email'])
        .withMessage('sort_field must be name or email')
    ],
    async (req, res) => {
        try {
            const results = validationResult(req)
            console.log(results)
            if (!results.isEmpty()) {
                throw new Error(result.array())
                // res.send(results.array())
            }
            const user = await User.findAll()
            res.json({
                data: user
            });
        } catch (error) {
            console.log('Error fetching users:', error.message)
            res.json({
                massage: 'Error fetching users',
                errorMessage: error.message,
                error: error
            })
        }
    })

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
router.post('/user', async (req, res) => {
    try {

        let user = req.body;
        let addressCreated = []
        const data = await User.create(user)
        user.userId = await data.id
        const addressData = user.addresses

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
        console.error('insert user:', errors.errors)
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

    }


})

// api for pactise validation
// path = POST /user/validation
router.post('/user/validation', checkSchema(createUserValidationSchema), async (req, res) => {
    const results = validationResult(req)
    const data = matchedData(req)
    console.log(results)
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array() })
    }
    let user = req.body;
    let addressCreated = []


    // const data = await User.create(user)
    // user.userId = await data.id
    // const addressData = user.addresses

    // for (let i = 0; i < addressData.length; i++) {
    //     let cAddressData = addressData[i]
    //     cAddressData.userId = user.userId
    //     const address = await Address.create(cAddressData)
    //     addressCreated.push(address)
    // }

    res.json({
        success: 'insert ok',
        user: data,
        // address: addressCreated
    });

})

module.exports = router;