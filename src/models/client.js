const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  etapa: DataTypes.NUMBER,
});

(async () => {
  await sequelize.sync({ force: false });
  // Code here
})();

module.exports = { User };
