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
app.use('/public', express.static(path.join(__dirname, 'public')));
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

// logs in a user if account exists, creates account if it doesn't exist
app.post( "/login", async (req, res) => {
    const userExistsCount = await usersCollection.countDocuments({ username: req.body.username, password: req.body.password });
    if (userExistsCount !== 0) {
        // user exists, successfully logged in
        req.session.loggedIn = true;
        req.session.userName = req.body.username;
        const currentuser = await usersCollection.findOne({ username: req.body.username, password: req.body.password });
        req.session.userID = currentuser._id.toString();
        res.status(200);
        res.json(currentuser);
    } else {
        const usernameExistsCount = await usersCollection.countDocuments({ username: req.body.username });
        if (usernameExistsCount === 0 && req.body.username !== null && req.body.username !== "" && req.body.username !== "Guest") {
            // user doesn't exist, but username is available, creating account
            req.session.loggedIn = true;
            req.session.userName = req.body.username;
            let insertingUser = req.body;
            const result = await usersCollection.insertOne( insertingUser );
            res.set('Content-Type', 'application/json');
            res.status(200);
            res.json(result);
        } else {
            // username does exist, but password was incorrect
            res.status(403);
            res.send("Failed to login!");
        }
        
    }
})

app.get("/logout", async (req, res, next) => {
    req.session.loggedIn = false;
    req.session.userId = null;
    req.session.userName = null;
    res.status(200);
    res.send("Logged out successfully");
})

app.post("/saveScore", async (req, res, next) => {
    if (req.session.loggedIn) {
        const userScoreExists = await scoresCollection.countDocuments({ score: req.body.score, mode: req.body.mode, scoreUser: req.session.userID });
        if (userScoreExists === 0) {
            let insertingScore = req.body;
            insertingScore.scoreUser = req.session.userID;
            insertingScore.userName = req.session.userName;
            const result = await scoresCollection.insertOne(insertingScore);
            res.set('Content-Type', 'application/json');
            res.status(200);
            res.json(result);
        } else {
            res.status(200);
            res.send("User has already saved a score with the same time.")
        } 
    } else {
        res.status(403);
        res.send("User is not logged in ");
    }
})

app.post("/getHighscores", async (req, res, next) => {
    if (req.session.loggedIn) {
        let query = {};
        let scoresToSend = {};
        if (req.body.category === 'own') {
            query = {scoreUser: req.session.userID, mode: 'Easy'};
            const easyScore = await scoresCollection.find(query).sort({ score: 1 }).limit(1).toArray();
            if (easyScore.length > 0) {
                scoresToSend.easy = easyScore[0].score;
            } else {
                scoresToSend.easy = -1;
            }
            query = {scoreUser: req.session.userID, mode: 'Medium'};
            const mediumScore = await scoresCollection.find(query).sort({ score: 1 }).limit(1).toArray();
            if (mediumScore.length > 0) {
                scoresToSend.medium = mediumScore[0].score;
            } else {
                scoresToSend.medium = -1;
            }
            query = {scoreUser: req.session.userID, mode: 'Hard'};
            const hardScore = await scoresCollection.find(query).sort({ score: 1 }).limit(1).toArray();
            if (hardScore.length > 0) {
                scoresToSend.hard = hardScore[0].score;
            } else {
                scoresToSend.hard = -1;
            }
        } else if (req.body.category === 'easy') {
            query = {mode: 'Easy'};
            const scores = await scoresCollection.find(query).sort({ score: 1 }).limit(3).toArray();
            for (let i = 0; i < 3; i++) {
                if (scores.length > i) {
                    scoresToSend[i] = scores[i];
                } else {
                    scoresToSend[i] = -1;
                } 
            }
        } else if (req.body.category === 'medium') {
            query = {mode: 'Medium'};
            const scores = await scoresCollection.find(query).sort({ score: 1 }).limit(3).toArray();
            for (let i = 0; i < 3; i++) {
                if (scores.length > i) {
                    scoresToSend[i] = scores[i];
                } else {
                    scoresToSend[i] = -1;
                }
            }
        } else if (req.body.category === 'hard') {
            query = {mode: 'Hard'};
            const scores = await scoresCollection.find(query).sort({ score: 1 }).limit(3).toArray();
            for (let i = 0; i < 3; i++) {
                if (scores.length > i) {
                    scoresToSend[i] = scores[i];
                } else {
                    scoresToSend[i] = -1;
                }
            }
        }
        res.set('Content-Type', 'application/json');
        res.status(200);
        res.json(scoresToSend);
    } else {
        res.status(403);
        res.send("User is not logged in ");
    }
})

/* app.get( "/", authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
}) */

// starts up app to be listening to requests
app.listen( process.env.PORT || 3000 )
