const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const path = require("path");
const { rmSync } = require("fs");

const app = express();

app.use(express.static(__dirname + "/views/"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://Abdullah:ebrJwtd5HgqsXCh@cluster0.9d1p1.mongodb.net/usersDB");
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const UserSchema = new mongoose.Schema({
    username: String,
    name: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//Home page get request
app.get("/", (req, res) => {

    res.sendFile(__dirname+"/views/index.html");
});


// Signup Post Req
app.post("/signup", (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const username = req.body.username;

    User.register(new User({ username: username, name: name }), password, function (err, user) {
        if (!err) {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        }
        else {
            res.redirect("/authenticate/signup");
        }
    });
});

// Login post Request
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = new User({
        username: username,
        password: password
    });

    passport.authenticate("local", { failureRedirect: "/authenticate/login", failureMessage: true })(req, res, function () {
        res.redirect("/");
    });
});


//API request handing

app.get("/userState", (req, res) => {

    if (req.isAuthenticated()) {
        res.json({ isLoggedIn: true, name: req.user.name });
    }
    else {
        res.json({ isLoggedIn: false, name: "" });
    }
});

//Logout request

app.get("/logout", (req, res) => {
    req.logout((err) => {
        res.redirect("/");
    });
});

//For handling react routing
app.use((req, res, next) => {
    res.sendFile(__dirname+"/views/index.html");
});

//Server listening

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running!");
});