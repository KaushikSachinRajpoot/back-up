const express = require('express');
const { execute } = require('@getvim/execute');
const dotenv = require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const Pool = require('pg').Pool;

const baseDbconfig = {
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'testabase'
};

const versionDbconfig = {
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  // database: 'version_1'
};

const pool1 = new Pool(baseDbconfig);
// const pool2 = new Pool(versionDbconfig)
app.post('/todos', async (req, res) => {
  const {dbname} = req.body;
  const newVersionDbconfig = {...versionDbconfig, database: dbname}
  const pool2 = new Pool(newVersionDbconfig);
  const client2 = await pool2.connect()
  
  try {
    const table = await client2.query("SELECT * from emp");
    res.json(table.rows);
  } catch (error) {
    console.log('table error', error);
  }finally{
    client2.release();
  }
})

app.post('/insert', async (req, res) => {
  const client1 = await pool1.connect();
  // try {
  //   const {  } = req.body;
  //   const result = await client1.query(
  //     "INSERT INTO users (email, password) VALUES ($1, $2, $3)",
  //     [id, name, pos])
  //     res.json(result.rows);
  // } catch (error) {
  //   res.status(500).send(error);
  // }
  try {
    const { id, name, pos } = req.body;
    const insertedRow = await client1.query(
      "INSERT INTO emp (id, name, pos) VALUES ($1, $2, $3)",
      [id, name, pos]
    );
    res.json(insertedRow.rows)
  } catch (error) {
    console.log(error.massage);
  }
   finally {
    client1.release();
  }
})



const fetchAndDisplayDatabases = async(req,res) => {
  const client1 = await pool1.connect();
  try {
    const result = await client1.query("SELECT datname FROM pg_database WHERE datistemplate = false")
    const databases = result.rows.map(row => row.datname);
    console.log('List of databases:', databases);
    let versionNumberArray = []
    let highestVersion = 0;
    databases.filter((item) => {
      if ((item.slice(0, 8)) === "version_") {
        versionNumberArray.push((item.slice(8)));
      }
    })
    const sortedVersionNumberArray = versionNumberArray.sort((a, b) => {
      return b - a;
    });
    if(sortedVersionNumberArray[0]){highestVersion = parseInt(sortedVersionNumberArray[0]);}
    res.json({ data: databases, highestVersion })
  } catch (error) {
    console.error('Error fetching databases:', error);
  }finally{
    client1.release();
  }
}
app.post('/database', async (req, res) => {
  fetchAndDisplayDatabases(req,res);
})

app.post('/createDatabase', async (req, res) => {
  const { version } = req.body;
  const client1 = await pool1.connect();
  try {
    const templateDb = 'testabase';
    const newDb = `version_${version}`;
    await client1.query(`CREATE DATABASE ${newDb} WITH TEMPLATE ${templateDb} OWNER postgres`);
    const result = await client1.query("SELECT datname FROM pg_database WHERE datistemplate = false")
    const databases = result.rows.map(row => row.datname);
    let versionNumberArray = []
    let highestVersion = 0;
    databases.filter((item) => {
      if ((item.slice(0, 8)) === "version_") {
        versionNumberArray.push((item.slice(8)));
      }
    })
    const sortedVersionNumberArray = versionNumberArray.sort((a, b) => {
      return b - a;
    });
    if(sortedVersionNumberArray[0]){highestVersion = parseInt(sortedVersionNumberArray[0]);}
    res.status(200).json({ message: 'Database created successfully', highestVersion });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).json({ error: 'An error occurred while creating the database' });
  }finally{
    client1.release();
  }
});

app.listen(5000, () => {
  console.log("sever is running is on the server 5000");
})