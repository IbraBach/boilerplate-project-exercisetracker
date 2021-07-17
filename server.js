const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const Schema = mongoose.Schema;
const router = express.Router();
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, 'useCreateIndex': true});

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

const userSchema = new Schema({
  username: {type: String, required: true},
  exercises: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: String}
  }]
});

app.use(cors());
app.use(express.static('public'))

const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const create = (data, done) =>{
  const user = new User(data);
  user.save((err, data)=> {
    if (err)
      return done(err)
    return done(null, user);
  });
}

const getAll = (done) => {
  User.find((err, data) => {
     if (err) return done(err);
    return done(null, data);
  });
}

const update = (req, done) => {
    User.findById(req.params, (err, user) => {
      err ? console.error(err) : user;
      if(req.body.date == null || req.body.date == undefined || req.body.date == ''){
        req.body.date = new Date().toISOString().slice(0, 10);
      }
      user.exercises.push(req.body);
      user.markModified("edited-field");
      user.save((err, user) => {
        if (err)
          return done(err)
        console.log("The returned 'user' object: ");
        console.log({_id: user._id, username: user.username, exercises: user.exercises});
        return done(null, {_id: user._id, username: user.username, exercises: user.exercises});       
        //return done(null, user);
      })
    });
}

app.post("/api/users", (req, res, next) => {
  create(req.body, (err, date)=> {
    if (err) return next(err);
    res.json(date);
  });
});

app.get("/api/users", (req, res, next) => {
  getAll((err, data) => {
      if (err) {
        return next({ message: err});
      }
      res.json(data);
  });
});

app.post("/api/users/:_id/exercises", (req, res, next) => {
  let request = {params : req.params, body: req.body};
  /*console.log("New Request object just created: ");
  console.log(request);
  console.log("Body: ");
  console.log(req.body);
  console.log("Params: ");
  console.log(req.params);*/
  update(request, (err, date)=> {
    if (err) {
      return next({ message: err});
    }
    //console.log(date);
    res.json(date);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
