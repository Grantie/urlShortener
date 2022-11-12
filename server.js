const express = require("express");
const app = express();
const shortId = require("shortid");

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get } = require("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyC0DSWfc-n3obenmsgiETxJzSAmmU84bXE",
    authDomain: "url-shortener-tikogrant.firebaseapp.com",
    projectId: "url-shortener-tikogrant",
    storageBucket: "url-shortener-tikogrant.appspot.com",
    messagingSenderId: "453523582132",
    appId: "1:453523582132:web:091cdd4e4079bf9e02fbe1"
};

const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }))

app.get("/", async (req, res) => {
    await get(ref(db, "/shortenedUrls")).then(async (snapshot) => {
        var urls = [];
        await snapshot.forEach((childSnapshot) => {
            urls.push(childSnapshot.val());
        });
        res.render("index.ejs", {shortenedUrls: urls});
    });
});

app.post("/create", async (req, res) => {
    var id = shortId.generate();
    await set(ref(db, "/shortenedUrls/" + id), {
        short: id,
        full: req.body.full,
        clicks: 0
    });
    res.render("created.ejs", { short: id, full: req.body.full });
});

app.get("/:shortUrl", async (req, res) => {
    await get(ref(db, "/shortenedUrls/" + req.params.shortUrl)).then((snapshot) => {
        if (snapshot.val() == null) {
            res.render("404.ejs");
        }
        set(ref(db, "/shortenedUrls/" + req.params.shortUrl + "/clicks"), ++snapshot.val().clicks);
        res.redirect(snapshot.val().full);
    });
});

app.listen(5000);