require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require('./swagger.json'); // เปลี่ยนมาใช้ json
const fs = require("fs"); // เปลี่ยนมาใช้ yaml
const YAML = require("yaml"); // เปลี่ยนมาใช้ yaml
const { Sequelize, DataTypes, cast } = require("sequelize");

const file = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

const port = 8000;
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let conn = null;

// sequelize
const sequelize = require("./configs/databases");
sequelize;

// app.use(require('./routers/index'));
app.use(require("./routers/index"), (err, req, res, next) => {
  if (err) {
    const status = err.status || 500;
    const errorResponse = {
      message: err.message,
      errors: err.details || [],
    };
    res.status(status).json(errorResponse);
  } else {
    next();
  }
});

app.listen(port, async (req, res) => {
  // await sequelize.sync({ force: true });
  // await sequelize.sync({ alter: true });
  // await sequelize.sync();
  console.log(`Server is running on http://localhost:${port}`);
});
