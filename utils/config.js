require('dotenv').config()

require('dotenv').config()

PORT = process.env.PORT
PGPORT = process.env.PGPORT
POSTGRES_URI = process.env.POSTGRES_URI
DATABASE = process.env.DATABASE
PASSWORD = process.env.PASSWORD
PGUSER = process.env.PGUSER
module.exports = {
  PORT,
  PGPORT,
  POSTGRES_URI,
  DATABASE,
  PASSWORD,
  PGUSER
}