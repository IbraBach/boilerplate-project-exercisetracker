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
  log: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: String}
  }]
}, { versionKey: false });

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

/*POST EXERCISES*/
const postExercise = (id, data, done) => {
  if (data.date == null || data.date == '')
    data.date = new Date().toISOString().slice(0, 10);
  User.findById(id, (err, user) => {
    user.log.push(data);
    user.save((err, data)=> {
      if (err)
        return done(err);
      return done(null, user);
    });
    
  });
};

app.post('/api/users/:_id/exercises', (req, res, next) => {
  const { _id, description, duration, date } = req.body || req.params;
  postExercise(req.params, req.body, (err, user) => {
    if (err) {
      return next({ message: err});
    }
    let date = new Date(user.log[user.log.length-1].date).toDateString()
    let data = {
      username: user.username,
      description: user.log[user.log.length-1].description,
      duration: user.log[user.log.length-1].duration,
      _id: user._id,
      date: date
    }
    res.json(data);
  });
});

/* GET EXERCISES*/
app.get("/api/users", (req, res, next) => {
  getAll((err, data) => {
      if (err) {
        return next({ message: err});
      }
      res.json(data);
  });
});

/*GET EXERCISES*/
const getExercise = (id, done) => {
  User.findById(id,(err, user) => {
    if (err)
      return done(err);
    return done(null, user);    
  });
};

app.get('/api/users/:_id/logs', (req, res, next) => {
  getExercise(req.params, (err, user) => {
    let logs = user.log;
    if (err) {
      return next({ message: err});
    }
    if((req.query.from) && (req.query.to)){
      logs = logs.filter((data)=> (Date.parse(data.date) >= Date.parse(req.query.from)) && (Date.parse(data.date) <= Date.parse(req.query.to)));
    }
    if(req.query.limit){
      logs = logs.filter((data,limit)=> limit < req.query.limit);
    }
    res.json({_id: user._id, username: user.username, log: logs, count: logs.length});
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
