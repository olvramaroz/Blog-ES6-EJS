import {fileURLToPath} from "url";
import path from "path";
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql';

const app = express();
const PORT = process.env.PORT || process.env.PORT_LOCAL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname + '/public')));

const pool = mysql.createPool({
    host: "localhost",
    database: "blog",
    user: "root",
    password: process.env.DB_PWD,
});

console.log(`connected to ${pool.config.connectionConfig.database}`);

// get all posts
app.get('/', (req, res) => {
    pool.query("SELECT Id, Title, Contents, CreationTimestamp FROM post", (error, allPosts) => {
        if(error) {
            console.log(error);
        } else {
            res.render('layout', {template: 'home', data: allPosts})
        }
    })
})

// get one post
app.get('/post/:id', (req, res) => {
    let id = req.params.id;
    pool.query(`SELECT * FROM post WHERE Id = ?`, [id], (error, onePost) => {
        console.log(onePost);
        if(error) {
            throw error
        } else {
            res.render('layout', {template: 'postdetails', data: onePost})
        }
    })
})





app.listen(PORT, ()=>{
    console.log(`Listening at http://localhost:${PORT}`);
})