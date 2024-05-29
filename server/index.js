require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require("mysql2/promise");
const { Sequelize, DataTypes } = require("sequelize");
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

const Address = sequelize.define(
    "addresses",
    {
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


// path = GET /users
app.get('/users', async (req, res) => {
    try {
        const results = await conn.query('SELECT * FROM users')
        res.json(results[0])
    } catch (error) {
        console.error('Error fetching users:', error.message)
        res.status(500).json({
            massage: 'Error fetching users'
        })
    }
})

// path = GET /users/:id
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id)

        if (results[0].length == 0) {
            throw { statusCode: 404, message: 'User not found' }
        }
        res.json({
            success: true,
            data: results[0][0]
        });

    } catch (error) {
        console.error('Error fetching users:', error.message)
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
            massage: 'Error fetching users',
            errorMessage: error.message
        })
    }
})

//  path = POST /user
app.post('/user', async (req, res) => {

    try {
        let user = req.body;
        const results = await conn.query('INSERT INTO users SET ?', user)
        res.json({
            success: 'insert ok',
            data: results[0]
        });
    } catch (error) {
        console.error('Error inserting user:', error.message)
        res.status(500).json({
            error: 'Error inserting user'
        })
    }
})

//  path = PUT /use/:id
app.put('/user/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        const results = await conn.query(
            'UPDATE users SET ? WHERE id = ?',
            [updateUser, id]
        )
        res.json({
            success: 'update ok',
            data: results[0]
        });
    } catch (error) {
        console.error('Error upda user:', error.message)
        res.status(500).json({
            error: 'Error upda user'
        })
    }
})

// path = DELETE /user/:id
app.delete('/user/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM users WHERE id = ?', id)
        res.json({
            success: 'deleted ok',
            data: results[0]
        });
    } catch (error) {
        console.error('Error deleted user:', error.message)
        res.status(500).json({
            error: 'Error deleted user'
        })
    }
})


app.listen(port, async (req, res) => {
    await initMySql()
    await sequelize.sync({ force: true });
    console.log(`Server is running on http://localhost:${port}`)
})