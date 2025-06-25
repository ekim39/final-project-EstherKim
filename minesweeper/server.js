import dotenv from 'dotenv'; // added so that process.env would work
dotenv.config();
import express from 'express';
import { MongoClient, ObjectId } from "mongodb";
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// sets up files paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

const app = express();

// middleware for static files
//app.use( express.static( 'public' ) )
app.use('/assets', express.static(assetsDir));
app.use( express.json() ) // converts json in request messages automatically

// set up session information
app.use(session({
    name: 'session',
    secret: `${process.env.SECRET}`,
    resave: false,
    saveUninitialized: false,
    loggedIn: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    } 
    
  }));

/* app.use( passport.initialize() )
app.use( passport.session() )
passport.serializeUser(function (user, cb) {
    cb(null, user.id)
})
passport.deserializeUser(function (id, cb) {
    cb(null, id)
}) */

// middleware for authenticating users
/* function authenticate(req, res, next) {
    if (req.session.loggedIn === true) {
        next();
    } else {
        res.status(403);
        res.redirect('/login.html');
    }
} */

// this is the url for the database
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=a3-Webware`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

// variables to refer to database
let scoresCollection; // holds the scores saved
let usersCollection; // holds the users

// called when the app is run and connects to the database
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    scoresCollection = await client.db("minesweeperDatabase").collection("highscores")
    usersCollection = await client.db("minesweeperDatabase").collection("users")
    // Send a ping to confirm a successful connection
    await client.db("minesweeperDatabase").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    console.log("Finished connection attempt.");
  }
}
run()

// middleware to ensure database isn't null
app.use( (req,res,next) => {
    if( scoresCollection !== null && usersCollection !== null ) {
        next()
    }else{
        res.status( 503 ).send()
    }
});

// returns the main page
app.get( "/", (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

/* app.get( "/", authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
}) */

// starts up app to be listening to requests
app.listen( process.env.PORT || 3000 )
