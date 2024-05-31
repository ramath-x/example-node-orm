require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require("mysql2/promise");
const { Sequelize, DataTypes, cast } = require("sequelize");
app.use(bodyParser.json());


const port = 8000;

let conn = null

const initMySql = async () => {
    conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    })
}

// sequelize
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
});


// table users
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
app.get('/users', async (req, res) => {
    try {
        const user = await User.findAll()
        res.json({
            data: user
        });
    } catch (error) {
        console.log('Error fetching users:', error.message)
        res.json({
            massage: 'Error fetching users',
            errorMessage: error.message
        })
    }
})

//  path = GET /users/:id/address
app.get('/api/users/:id/address', async (req, res) => {
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
app.post('/user', async (req, res) => {
    try {
        let user = req.body;
        const results = await User.create(user)
        user.userId = await results.id
        const addressData = user.addresses

        let addressCreated = []
        for (let i = 0; i < addressData.length; i++) {
            let cAddressData = addressData[i]
            cAddressData.userId = user.userId
            const address = await Address.create(cAddressData)
            addressCreated.push(address)
        }

        res.json({
            success: 'insert ok',
            user: results,
            address: addressCreated
        });
    } catch (errors) {
        console.error('insert user:', errors.errors)
        res.status(500).json({
            message: 'insert error',
            error: errors.errors.map(e => e.message)
        })
    }
})

//  path = PUT /use/:id
app.put('/api/users/:id', async (req, res) => {
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
app.delete('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const results = await User.destroy({ where: { id: userId } })
        // const address = await Address.destroy({ where: { userId: userId } })
        res.json({
            success: 'insert ok',
            user: results,
        });
    } catch (error) {

    }
})


app.listen(port, async (req, res) => {
    await initMySql()
    // await sequelize.sync({ force: true });
    await sequelize.sync({ alter: true });
    console.log(`Server is running on http://localhost:${port}`)
})