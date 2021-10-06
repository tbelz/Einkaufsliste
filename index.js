const express = require('express');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Register & Login
let users = [];

users.push({
  "username": "till",
  "passwordDerivative": "geheim",
  "auth": ["kjmvrekvkj"],
  "listen": [
    {        
      "name": "ALDI",
      "einträge":[
        { "namen": "Apfel", "anzahl": 4, "abgehakt": true, "gang": "5"}
      ]
    }
  ]
})




app.use(express.json());
app.use(express.static('public'));

// Your code goes here

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

// Register & Login

app.post('/register', function(req, res) {
  if(validateUser(req.body)){
    if(!userExits(req.body.username)){
      users.push({username: req.body.username, passwordDerivative: derivePassword(req.body.password)})
     res.status(201).json({"sucess": "User created."})
    }
    else{
      res.status(400).json({error: "User already exits."})
    }
  }
  else{res.status(400).json({error: "No or invalid argument for user or password."})}
});

app.post('/login', function(req, res) {
  if(validateUser(req.body)){
    if(!userExits(req.body.username)){
      res.status(401).json({error: "User does not exist"})
    }
    else
    {
      if(derivePassword(req.body.password) === getUser(req.body.username).passwordDerivative){
        res.status(200).json({success: "Authorized"})
      }
      else{
        res.status(401).json({error: "Unauthorized"})
      }
  }
  }
  else{res.status(400).json({error: "No or invalid argument for user or password."})}
});

function userExits(username){
  const user = users.filter(singleUser => { return singleUser.username === username});
  return user.length !== 0;
}

function getUser(username){
  const user = users.filter(singleUser => { return singleUser.username === username});
  return user[0];
}


function validateUser(user){
  return user.hasOwnProperty("username") && user.hasOwnProperty("password") &&
  typeof user.password === 'string' && typeof user.username === 'string'
}

function derivePassword(password){
  return crypto.pbkdf2Sync(
  password, 
  'eeo2ubsWHDgegH9CPaFv', 
  100000, 
  64, 
  'sha512'
  ).toString('hex')
}

// Listen Abrufen

app.get('/einkaufsliste', function(req, res) {
  //User identifizieren anhand von auth id (user till ist Platzhalter)
  let UserEinkaufslisten = getUser("till").listen;
  res.json(UserEinkaufslisten);
});

// Register & Login

app.post('/einkaufsliste', function(req, res) {
  if(req.body.name === undefined){
    res.status(400).json({
      error: 'Please insert a name for your list'
    });
  }
  else{
    let liste = {"name": req.body.name, "einträge": []}
    getUser("till").listen.push(liste);
    res.status(200).json({
      success: 'List created'
    });
  }
});

