require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// Create Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  }
);

// ========================
// Models
// ========================

// Province or Territory
const ProvinceOrTerritory = sequelize.define('ProvinceOrTerritory', {
  code: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  region: DataTypes.STRING,
  capital: DataTypes.STRING
}, { timestamps: false });

// National Historic Site
const Site = sequelize.define('Site', {
  siteId: { type: DataTypes.STRING, primaryKey: true },
  site: DataTypes.STRING,
  description: DataTypes.TEXT,
  date: DataTypes.INTEGER,
  dateType: DataTypes.STRING,
  image: DataTypes.STRING,
  location: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  designated: DataTypes.INTEGER,
  provinceOrTerritoryCode: DataTypes.STRING
}, { timestamps: false });

// Association
Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

// ========================
// Functions
// ========================

// Sync DB
function initialize() {
  return sequelize.sync();
}

// Create
function addSite(siteData) {
  return Site.create(siteData);
}

// Read
function getAllSites() {
  return Site.findAll({ include: [ProvinceOrTerritory] });
}

function getSiteById(id) {
  return Site.findAll({
    where: { siteId: id },
    include: [ProvinceOrTerritory]
  }).then(data => {
    if (data.length > 0) return data[0];
    else throw "Unable to find requested site";
  });
}

function getAllProvincesAndTerritories() {
  return ProvinceOrTerritory.findAll();
}

function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
  return Site.findAll({
    include: [ProvinceOrTerritory],
    where: {
      '$ProvinceOrTerritory.name$': {
        [Op.iLike]: `%${provinceOrTerritory}%`
      }
    }
  });
}

function getSitesByRegion(region) {
  return Site.findAll({
    include: [ProvinceOrTerritory],
    where: {
      '$ProvinceOrTerritory.region$': region
    }
  });
}

// Update
function editSite(id, siteData) {
  return Site.update(siteData, { where: { siteId: id } });
}

// ✅ Delete
function deleteSite(id) {
  return Site.destroy({ where: { siteId: id } });
}

// ========================
// Exports
// ========================
module.exports = {
  initialize,
  Site,
  ProvinceOrTerritory,
  Sequelize,
  Op,
  addSite,
  getAllSites,
  getSiteById,
  getAllProvincesAndTerritories,
  getSitesByProvinceOrTerritoryName,
  getSitesByRegion,
  editSite,
  deleteSite // ✅ Don't forget to export this!
};

/// --------------------------------------
/// Optional: One-time Sample Data Insert
/// --------------------------------------
const INSERT_SAMPLE_DATA = false;

if (INSERT_SAMPLE_DATA) {
  const siteData = require('../data/NHSiteData.json');
  const provinceAndTerritoryData = require('../data/provinceAndTerritoryData.json');

  sequelize.sync({ force: true }).then(async () => {
    try {
      await ProvinceOrTerritory.bulkCreate(provinceAndTerritoryData);
      await Site.bulkCreate(siteData);
      console.log('✅ Sample data inserted successfully!');
      process.exit();
    } catch (err) {
      console.error('❌ Error inserting sample data:', err);
      process.exit(1);
    }
  });
}
