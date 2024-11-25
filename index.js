//index.js
import express from 'express';
import cors from "cors";
import { MongoClient } from 'mongodb';
import { moviesRouter } from './routes/movies.js';
import { usersRouter } from './routes/users.js';
import dotenv from 'dotenv';

 dotenv.config();
console.log(process.env.MONGO_URL);
const app = express();
const   PORT=process.env.PORT;
app.use(express.json());
const MONGO_URL = process.env.MONGO_URL;
async function createConnection()
 {const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌️😊");
  return client;}
  export const client = await createConnection();
app.get('/', function (req, res) {
  res.send('Hello Worldggg')
})

app.use(cors());
app.use('/movies',moviesRouter);
app.use('/users',usersRouter);
app.listen(PORT,function()
{console.log('server start from PORT 4000')});


//helper.js
import { client } from './index.js';
export async function getMovieById(id) {
  return await client.db("b30wd").collection("movies")
    .findOne({ id: id });
}
export async function getUserByName(username) {
  return await client.db("b30wd").collection("users")
    .findOne({ username:username});
}

export async function getAllMovies() {
  await client.db("b30wd").collection("movies")
    .find({})
    .toArray();
}
export async function deleteMovie(id) {
  return client.db("b30wd")
    .collection("movies")
    .deleteMany({ id: id });
}
export async function createMovies(data) {
  return await client.db("b30wd")
    .collection("movies").insertMany(data);
}
export async function updateMovie(id, updateData) {
  return client.db("b30wd")
    .collection("movies") 
    .updateOne({ id: id }, { $set: updateData });
}
export async function createUser(data) {
  return await client.db("b30wd")
    .collection("users").insertOne(data);
}

//routes/movies.js
import express from "express";
const router=express.Router();
import{getMovieById,deleteMovie ,getAllMovies,updateMovie,createMovies} from '../helper.js';

router.get("/",async function (req, res) {
    const movies=await getAllMovies();
    console.log(movies);
    res.send(movies);
     })
  //display data and set error data also diplay(movie deleted error will display)
  router.get("/:id", async function (req, res) {
      console.log(req.params);
      const{id}=req.params;
      const movie=await getMovieById(id);
      console.log(movie);
     movie?res.send(movie):res.status("404 ").send({message:"404 error "});
          })
     //delete
     router.delete("/:id", async function (req, res) {
     console.log(req.params);
      const{id}=req.params;
      const result=await deleteMovie(id);
      console.log(result);
      res.send(result);
      })
      //deleteone
     /* app.delete("/movies/:id", async function (req, res) {
        console.log(req.params);
         const{id}=req.params;
         const result=await client.db("b30wd")
         .collection("movies")
         .deleteOnene({id:id});
         console.log(result);
         res.send(result);
         })*/
     
  //
  //update (only replace updateone or updatemulti)
  router.put("/:id", async function (req, res) {
    console.log(req.params);
     const{id}=req.params;
     const updateData=req.body;
     const result=await updateMovie(id, updateData);
     console.log(result);
     res.send(result);
     })
      //
  router.post("/", async function (req, res) {// db.movies.insertMany(data)
      const data = req.body;
      console.log(data);
      const result = await createMovies(data);
      res.send(result);});
      
      export const moviesRouter=router;



 //routes/user.js
      import express from "express";
import bcrypt from "bcrypt";
import {createUser,getUserByName} from '../helper.js';
const router=express.Router();
async function genPassword(password){
    const salt=await bcrypt.genSalt(10)
  const hashPassword=await bcrypt.hash(password,salt);
  console.log({salt,hashPassword});
  return hashPassword;
  }
  router.post("/signup", async function (req, res) {// db.users.insertOne(data)
      const {username,password}= req.body;
      const hashPassword=await genPassword(password) ;
      const newUser={
          username:username,
          password:hashPassword,
      }
      console.log(newUser);
      const result = await createUser(newUser);
      res.send(result);});

      router.post("/login", async function (req, res)
       {const { username, password } = req.body;
      // db.users.findOne({username: "tamil"})
      const userFromDB = await getUserByName(username);
      console.log(userFromDB);
      if (!userFromDB) 
      {res.status(401).send({ message: "Invalid credentials" });
    } 
    else {const storedPassword = userFromDB.password; // hashed password
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    console.log("isPasswordMatch", isPasswordMatch);
    if (isPasswordMatch) {res.send({ message: "Successfull login" });} 
    else {res.status(401).send({ message: "Invalid credentials" });}}});
             
      

      export const usersRouter=router;
