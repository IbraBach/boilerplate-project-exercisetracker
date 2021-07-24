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
  logs: [{
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
};

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

/*const update = (req, done) => {
  console.log(req.params);
  console.log(req.body);
  User.findById(req.params, (err, user) => {
    err ? console.error(err) : user;
    if(req.body.date == null || req.body.date == undefined || req.body.date == ''){
      req.body.date = new Date().toISOString().slice(0, 10);
    }
    user.logs.push(req.body);
    user.markModified("edited-field");
    user.save((err, user) => {
      if (err)
        return done(err)      
      return done(null, user);
    })
  });
}

app.post("/api/users/:_id/exercises", (req, res, next) => {
  let request = {params : req.params, body: req.body};
  update(request, (err, data)=> {
    if (err) {
      return next({ message: err});
    }
    console.log(data);
    res.json(data);
  });
});

const getExercises = (req, done) => {
  let resElem = {description: '', duration: 0, date: ''};
  let resArr = [];
  let finalOb = {count: 0, logs: []};
  //console.log(req);
  User.findById(req)
  .limit(5)
  //.limit(req.limt)
  .exec((err, user) => {
    if (user.logs != null || user.logs != [] ){
      for (let i = 0; i < user.logs.length; i++){
        resElem.description = user.logs[i].description;
        resElem.duration = user.logs[i].duration;
        resElem.date = user.logs[i].date;
        resArr.push(resElem);
      }
    }
    console.log("The user's exercises: ");
    console.log(resArr);
    finalOb.count = resArr.length;
    finalOb.logs = resArr;
    //console.log(user.exercises);
    err ? console.error(err) : finalOb.logs;
  }).countDocuments();
}

app.get("/api/users/:_id/logs", (req, res, next) => {
  console.log("req.params");
  console.log(req.params);
  getExercises(req.params,(err, data) => {
    if (err) {
      return next({ message: err});
    }
    console.log("The user's exercises: ");
    console.log(data);
    res.json(data);
  })
});*/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
