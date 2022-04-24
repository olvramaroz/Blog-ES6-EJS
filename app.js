// Variable d'environnement
import 'dotenv/config';
const PORT = process.env.PORT || process.env.PORT_LOCAL

// Gestion des routes folders
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base de données
import mysql from 'mysql';

// Express
import express from 'express';
const app = express();

// Moteur d'affichage
app.set('views', './views');
app.set('view engine', 'ejs');

// Middleware pour extraire les données du formaulaire
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


/**********************
 *  
 * DATABASE CONNECTION *
 * 
 * *******************/
const pool = mysql.createPool({
    host: "localhost",
    database: "blog",
    user: "root",
    password: process.env.DB_PWD,
});

console.log(`connected to ${pool.config.connectionConfig.database}`);


/**********************
 *  
 * A D M I N *
 * 
 * *******************/
// get all posts
app.get('/admin', (req, res) => {
    pool.query(`
        SELECT post.Id, post.Title, post.Contents, post.CreationTimestamp, author.Avatar, author.FirstName, author.LastName
        FROM post
        JOIN author
        ON post.Author_Id = author.Id
        `, (error, adminPosts) => {
        if(error) {
            console.log(error);
        } else {
            res.render('layout', {template: 'admin', dataAdmin: adminPosts})
        }
    })
})
// end get all posts admin

// create a post
app.get('/admin/post', (req, res) => {
    pool.query(`SELECT * FROM author`,
       (error, getAuthor) => {
            pool.query(`SELECT * FROM category`, (error, getCategory) => {
                if (error) {
                   throw error
                } else {
                   res.render('layout', { template: 'adminPost', author: getAuthor, category: getCategory })
                }
            })
        }
    )
})
 
app.post('/admin/post', (req, res) => {
    const titre = req.body.title
    const message = req.body.content
    const date = new Date()
    const auteur = req.body.author
    const categorie = req.body.category

    pool.query(`
    INSERT INTO post (Title, Contents, CreationTimestamp, Author_Id, Category_Id) 
    VALUES(?,?,?,?,?)`,
       [titre, message, date, auteur, categorie], (error, sendPost) => {
          if (error) {
             throw error;
          } else {
             res.redirect('/admin');
          }
       })
})
// end create a post admin

// update a post
app.get('admin/edit/:id', (req, res) => {
    let id = req.params.id
    pool.query(`
        SELECT Title, Contents
        FROM post
        WHERE post.Id = ?
        `, [id], (error, results) => {
            console.log('results::', results)

            if (error) {
                throw error;
            } else {
                res.render('layout', { template: 'adminEdit', data: results })
            }
        }
    )             
}) 
 
app.put('admin/edit/:id', (req, res) => {
    const titre = req.body.title
    const message = req.body.content
    let id = req.params.id

    pool.query(`
        UPDATE post
        SET Title = ?, Contents = ?
        WHERE post.Id = ?`,
        [id, titre, message],
        (error, result) => {
            if (error) {
                throw error;
            } else {
                res.redirect('/admin');
            }
        }
    )
})
// end update a post admin



/**********************
 *  
 * P U B L I C *
 * 
 * *******************/

// get all posts
app.get('/', (req, res) => {
    pool.query(`
        SELECT post.Id, post.Title, post.Contents, post.CreationTimestamp, author.Avatar, author.FirstName, author.LastName
        FROM post
        JOIN author
        ON post.Author_Id = author.Id
        `, (error, allPosts) => {
        if(error) {
            console.log(error);
        } else {
            res.render('layout', {template: 'home', data: allPosts})
        }
    })
})

// get one post with comments
app.get('/post/:id', (req, res) => {
    let id = req.params.id;

    // Query to get a post by id
    pool.query(`
        SELECT post.Title, post.Contents, post.CreationTimestamp, author.Avatar, author.FirstName, author.LastName
        FROM post
        JOIN author
        ON post.Author_Id = author.Id
        WHERE post.Id = ?
    `, [id], (error, onePost) => {
        
        // Query to get comments linked to the post id
        pool.query(`
            SELECT comment.NickName, comment.Contents AS message, comment.CreationTimestamp, post.Title, post.Contents, author.FirstName, author.LastName
            FROM comment
            JOIN post
            ON post.Id = comment.Post_Id
            JOIN author
            ON author.Id = post.Author_Id
            WHERE post.Id = ?
        `, [id], (err, comments) => {
            if (err) {
                throw err
            } else {
                res.render('layout', {template: 'postdetails', dataComments: comments, dataPost: onePost})
            }
        })
    })
})


app.listen(PORT, ()=>{
    console.log(`Listening at http://localhost:${PORT}`);
})

