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

app.get('/', (req, res) => {
    pool.query("SELECT Title, Contents, CreationTimestamp FROM post", (error, result) => {
        if(error) {
            console.log(error);
        } else {
            res.render('layout', {template: 'home', data: result})
        }
    })
})

// app.get('/admin', (req, res) => {
    
//     pool.query("SELECT Role FROM user", (error, result) => {
//         if(error) {
//             console.log(error);
//         } if (role === admin) {
//             res.render('layout', {template: 'admin', data: result})
//         } else {
//             res.render('layout', {template: 'home', data: result})
//         }
//     })
// })





app.listen(PORT, ()=>{
    console.log(`Listening at http://localhost:${PORT}`);
})