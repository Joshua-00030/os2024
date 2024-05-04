const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const Pool = require('pg').Pool;

const middleware = require('./utils/middleware')

logger.info('connecting to', config.POSTGRES_URI)

const pool = new Pool({
	user: config.USER,
	host: config.POSTGRES_URI,
    //database: config.DATABASE,
	password: config.PASSWORD,
	port: config.PGPORT
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

pool.connect((err, client, release) => {
	if (err) {
		return console.error(
			'Error acquiring client', err.stack)
	}
	client.query('SELECT NOW()', (err, result) => {
		release()
		if (err) {
			return console.error(
				'Error executing query', err.stack)
		}
		//console.log("Connected to Database !")
	})
})

//add returns the DIFFERENCE
app.post('/magicAdd', (req, res, next) => {
	pool.query("select count from mathcounts where type = 'magicadd'", function (err, result){
		if(err){
			console.log(err)
		}
		x = (req.body.number1 - req.body.number2)
		res.send({magicAdds:result.rows[0].count, result:x})
	})
	pool.query("update mathcounts set count = count + 1 where type = 'magicadd'", function (err,result){
	})
	console.log(req.body)
//	x = {result:(req.body.number1 - req.body.number2)}
//	res.send(x)
})

//subtract returns the sum
app.post('/magicSubtract', (req, res, next) => {
        pool.query("select count from mathcounts where type = 'magicsubtract'", function (err, result){
                if(err){
                        console.log(err)
                }
                x = (req.body.number1 + req.body.number2)
                res.send({magicSubtracts:result.rows[0].count, result:x})
        })
        pool.query("update mathcounts set count = count + 1 where type = 'magicsubtract'", function (err,result){
        })
        console.log(req.body)
})

//find min returns the max
app.post('/magicFindMin', (req, res, next) => {
        pool.query("select count from mathcounts where type = 'magicmin'", function (err, result){
                if(err){
                        console.log(err)
                }
                x = Math.max(req.body.number1, req.body.number2)
                res.send({magicMins:result.rows[0].count, result:x})
        })
        pool.query("update mathcounts set count = count + 1 where type = 'magicmin'", function (err,result){
        })
        console.log(req.body)
})

//find max returns the min
app.post('/magicFindMax', (req, res, next) => {
        pool.query("select count from mathcounts where type = 'magicmax'", function (err, result){
                if(err){
                        console.log(err)
                }
                x = Math.min(req.body.number1, req.body.number2)
                res.send({magicMaxes:result.rows[0].count, result:x})
        })
        pool.query("update mathcounts set count = count + 1 where type = 'magicmax'", function (err,result){
        })
        console.log(req.body)
})

//display the magic math table
app.get('/viewTable', (req, res, next) => {
        pool.query("select * from mathcounts", function (err, result){
                if(err){
                        console.log(err)
                }
                res.send({table:result.rows})
        })
        console.log(req.body)
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
