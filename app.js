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
    database: config.DATABASE,
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

app.post('/testdata/nih', (req, res, next) => {
	pool.query('Select * from nsf_nih join topics on nsf_nih.topic_id = topics.topic_id where nsf_nih.topic_id != -1 order by id limit 20')
		.then(testData => {
			res.send(testData.rows);
		})
})

app.post('/testdata/general', (req, res, next) => {
	const s = req.body.reduce((st, item) =>{
		if(item.label === 'index'){}
		else if(['awardnumber','topic_id', 'id'].includes(item.label)){
			st.push(Number(item.value))
		}else if(item.value){
			st.push(`%${item.value}%`)
		}else{
			st.push('%%')
		}
		return st
	},[])

	console.log(s)

	pool.query("select * from nsf_nih join topics on nsf_nih.topic_id = topics.topic_id where nsf_nih.topic_id != -1 AND (awardnumber = $1 or $1 = 0) AND COALESCE(nsforganization, '') ILIKE $2 AND COALESCE(\"Program(s)\", '') ILIKE $3 AND COALESCE(\"StartDate\", '') ILIKE $4 AND COALESCE(\"LastAmendmentDate\", '') ILIKE $5 AND COALESCE(principalinvestigator, '') ILIKE $6 AND COALESCE(\"AwardInstrument\", '') ILIKE $7 AND COALESCE(\"ProgramManager\", '') ILIKE $8 AND COALESCE(\"EndDate\", '') ILIKE $9 AND COALESCE(\"AwardedAmountToDate\", '') ILIKE $10 AND COALESCE(\"Co-PIName(s)\", '') ILIKE $11 AND COALESCE(\"PIEmailAddress\", '') ILIKE $12 AND COALESCE(\"OrganizationStreet\", '') ILIKE $13 AND COALESCE(\"OrganizationZip\", '') ILIKE $14 AND COALESCE(\"OrganizationPhone\", '') ILIKE $15 AND COALESCE(\"NSFDirectorate\", '') ILIKE $16 AND COALESCE(\"ProgramElementCode(s)\", '') ILIKE $17 AND COALESCE(\"ProgramReferenceCode(s)\", '') ILIKE $18 AND COALESCE(\"ARRAAmount\", '') ILIKE $19 AND COALESCE(abstract, '') ILIKE $20 AND (nsf_nih.topic_id = $21 or $21 = 0) AND COALESCE(organization, '') ILIKE $22 AND COALESCE(funding_type, '') ILIKE $23 AND COALESCE(project_title, '') ILIKE $24 AND COALESCE(funding, '') ILIKE $25 AND COALESCE(city, '') ILIKE $26 AND COALESCE(state, '') ILIKE $27 AND COALESCE(award_date, '') ILIKE $28 AND COALESCE(for_med_school, '') ILIKE $29 AND COALESCE(grant_number, '') ILIKE $30 AND COALESCE(congressional_district, '') ILIKE $31 AND COALESCE(nih_reference, '') ILIKE $32 AND (id = $33 or $33 = 0) limit $34"
	, [s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9], s[10], s[11], s[12], s[13], s[14], s[15], s[16], s[17], s[18], s[19], s[20], s[21], s[22], s[23], s[24], s[25], s[26], s[27], s[28], s[29], s[30], s[31], s[32], 20], function (err, result){
		if(err){
			console.log(err)
		}
		res.send(result.rows)
	})
})

app.post('/testdata/relatedProjects', (req, res, next) => {
	pool.query("select distinct on (project_title) * from nsf_nih join topics on nsf_nih.topic_id = topics.topic_id and nsf_nih.topic_id = $1 limit 20", [req.body.topic_id], function (err, result){
		res.send(result.rows)
	})
})

//add returns the DIFFERENCE
app.post('/magicAdd', (req, res, next) => {
	pool.query("select * from mathcounts", function (err, result){
		res.send(result.rows)
	})
	console.log(req.body)
	x = {result:(req.body.number1 - req.body.number2)}
	res.send(x)
})

//subtract returns the sum
app.post('/magicSubtract', (req, res, next) => {
	console.log(req.body)
	x = {result:(req.body.number1 + req.body.number2)}
	res.send(x)
})

//find min returns the max
app.post('/magicFindMin', (req, res, next) => {
	console.log(req.body)
	x = {result: Math.min(req.body.number1 + req.body.number2)}
	res.send(x)
})

//find max returns the min
app.post('/magicFindMax', (req, res, next) => {
	console.log(req.body)
	x = {result:Math.max(req.body.number1 + req.body.number2)}
	res.send(x)
})

app.get('/testdata/nih', (req, res, next) => {
	pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' and table_name = 'nsf_nih' Order by ordinal_position")
		.then(testData => {
			res.status(200).send(testData.rows.map(row => row.column_name));
		})
})
//https://stackoverflow.com/questions/33353997/how-to-insert-csv-data-into-postgresql-database-remote-database
//how to use the /copy command COALESCE(to copy local files to the database. or connect through pgadminapp.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app