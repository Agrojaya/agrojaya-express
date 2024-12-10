const { Model, DataTypes } = require("sequelize");
const db = require("../config/Database.js");

class Artikel extends Model {}

Artikel.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    modelName: "Artikel",
    tableName: "artikel", // Pastikan nama tabel sesuai
  }
);

module.exports = Artikel;
