import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import rp from 'request-promise';
import { IgApiClient } from 'instagram-private-api';
import { CronJob } from "cron";
import dotenv from "dotenv";
import multer from "multer";
import path from 'path';
import * as url from 'url';
dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const db= new pg.Client({
  user : "postgres",
  hostname: "localhost",
  database:"loginInfo",
  password : "Harekrishna@04",
  port : 5432,
})
db.connect();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, fileName);
  }
});

const upload = multer({ storage: storage });
var userIsAuthorised = false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function passwordCheck(req, res, next) {
  const password = req.body["password"];
  if (password === "ILoveProgramming") {
    userIsAuthorised = true;
  }
  next();
}
app.use(passwordCheck);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/logIn", (req, res) => {
  res.sendFile(__dirname + "/public/logIn.html");
});
app.get("/post", (req, res) => {
  res.sendFile(__dirname + "/public/post.html");
});
app.get("/account", (req, res) => {
  res.sendFile(__dirname + "/public/account.html");
});

// Sign up route
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signUp.html");
});
app.get("/sign",(req, res) =>{
  res.redirect("/");
})
app.get("/infoFb", (req, res)=>{
  res.sendFile(__dirname + "/public/infoFormFb.html");
});
app.get("/twit", (req, res)=>{
  res.sendFile(__dirname + "/public/twit.html");
});
app.get("/insta", (req, res)=>{
  res.sendFile(__dirname + "/public/insta.html");
});
app.get("/linkdn", (req, res)=>{
  res.sendFile(__dirname + "/public/linkdn.html");
});
app.get("/youtube", (req, res)=>{
  res.sendFile(__dirname + "/public/youtube.html");
});
app.post("/PostIn",upload.single('images'),async (req, res)=>{
  const content=req.body.Content;
  try{
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const images = 'uploads/' + req.file.filename;
    const directoryPath = images;
    const normalizedPath = directoryPath.replace(/\\/g, '/');
    const imageUrl = url.format({
      protocol: 'file:',
      pathname: path.resolve(normalizedPath),
      slashes: true,
    });
    //const imageUrl = `http://localhost:${port}/${images}`;
    const postToInsta = async () => {
      const ig = new IgApiClient();
      ig.state.generateDevice(process.env.IG_USERNAME);
      await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    
      const imageBuffer = await rp({
        url: 'https://i.imgur.com/BZBHsauh.jpg',
        encoding: null,
      });
  
      console.log("i am here 1")
      await ig.publish.photo({
        file: imageBuffer,
        caption: content,
      });
      console.log("i am here 2")
    };
    postToInsta();
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/signUp", async (req, res) => {
  const name= req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  try {
    console.log(name);
    console.log(email);
    console.log(password);
    //console.log($2),[email];
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(checkResult.rows.length); 
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      const result = await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, password]
      );
      console.log(checkResult);
      //res.render("secrets.ejs");
      res.sendFile(__dirname + "/public/account.html");
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/infoFB", async(req, res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const platform="fb";
  try{
    const result= await db.query(
      "insert into info (username, password,  platform) values ($1, $2, $3)",
      [username, password, platform]
    );
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/infoTw", async(req, res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const platform="Twitter";
  try{
    const result= await db.query(
      "insert into info (username, password,  platform) values ($1, $2, $3)",
      [username, password, platform]
    );
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/infoIn", async(req, res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const platform="Insta";
  try{
    const result= await db.query(
      "insert into info (username, password,  platform) values ($1, $2, $3)",
      [username, password, platform]
    );
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/infoYou", async(req, res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const platform="youtube";
  try{
    const result= await db.query(
      "insert into info (username, password,  platform) values ($1, $2, $3)",
      [username, password, platform]
    );
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/infoLn", async(req, res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const platform="linkedn";
  try{
    const result= await db.query(
      "insert into info (username, password,  platform) values ($1, $2, $3)",
      [username, password, platform]
    );
    res.redirect("/");
  }catch{
    console.log(err);
  }
});
app.post("/check", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(checkResult.rows.length);
    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        // res.render("secrets.ejs");
        res.sendFile(__dirname + "/public/account.html");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});