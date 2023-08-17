const express = require('express');
// const pool = require('./sever/db');
const { execute } = require('@getvim/execute'); 
const dotenv = require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());


const Pool = require('pg').Pool;

const pool  = new Pool({
    user: 'postgres',
    password: 'Cel@123451234',
    host: 'localhost',
    port: 5432,
    database: 'perntodo'
});

// create to do here
app.post('/todos', async (req, res)=>{
try {
const {description} = req.body;
    const newTodo = await pool.query(
        "INSERT INTO todo (description) VALUES($1) RETURNING * " , [description]
    );
res.json(newTodo)    
} catch (error) {
    console.log(error.massage);
    
}
})



// Backup function
// const takePGBackup = () => {
   


// const backupCommand = `pg_dump -U ${pool.user} -h ${pool.host} -p ${pool.port} -f ${backupFile} -d ${pool.database}`;
    // const date = new Date();
    // const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    // const backupCommand = `pg_dump -U ${pool.user} -h ${pool.host} -p ${pool.port} -f ${backupFile} -d ${pool.database}`;
  
    // function takePGBackup (aut) { 
    //     console.log(aut , 'auth is here');
    //     const date = new Date();
    //     const today = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    //     const backupFile = `pg-backup-${today} 1_${}.sql`;
    //     const backupCommand = `pg_dump -U postgres -h localhost -p 5432 -f ${backupFile} -d perntodo`;
    //     // console.log("execute here", execute(backupCommand));
    //     execute(backupCommand).then(async() => {
    //     console.log(`Backup created successfully`); })
    //     .catch((err) => { console.log(err);
    //     });
    //  };
    // // }
//  takePGBackup()

  // app.post('/backup', async (req, res) => {
  //   const {version} = req.body;
  //   console.log(version);
  //   function takePGBackup () { 
  //       const date = new Date();
  //       const today = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  //       const backupFile = `pg-backup-${today}-1_${version}.sql`;
  //       const backupCommand = `pg_dump -U postgres -h localhost -p 5432 -f ${backupFile} -d perntodo`;
  //       execute(backupCommand).then(async() => {
  //       console.log(`Backup created successfully`); })
  //       .catch((err) => { console.log(err);
  //       });
  //    };
  //   takePGBackup();
  //   res.json({ message: 'Backup process initiated' });
  // });

// get all todo here


app.get('/todos', async (req, res)=>{
    try {
    const allTodo = await pool.query('SELECT * FROM todo')
    res.json(allTodo);        
    } catch (error) {
        
    }
})

app.post('/database', async (req, res)=>{
    async function fetchAndDisplayDatabases() {
        try {
        //   const result = await pool.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
const result = await pool.query("SELECT datname FROM pg_database WHERE datistemplate = false")
          const databases = result.rows.map(row => row.datname);
          res.json({data: databases})
          console.log('List of databases:', databases);
        } catch (error) {
          console.error('Error fetching databases:', error);
        }
      }
      
      fetchAndDisplayDatabases();
})



// const client = new Client(clientConfig);

app.post('/createDatabase', async (req, res) => {
    const {version} = req.body;
    try {
      const templateDb = 'perntodo';
      const newDb = `version_${version}`;
      await pool.query(`CREATE DATABASE ${newDb} WITH TEMPLATE ${templateDb} OWNER postgres`);
      res.status(200).json({ message: 'Database created successfully' });
    } catch (error) {
      console.error('Error creating database:', error);
      res.status(500).json({ error: 'An error occurred while creating the database' });
    }
  });




app.listen(5000, ()=>{
    console.log("sever is running is on the server 5000");
})