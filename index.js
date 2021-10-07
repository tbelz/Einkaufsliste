require('dotenv').config()
const express = require('express');
const crypto = require('crypto');
var cookieParser = require('cookie-parser')


const app = express();
app.use(cookieParser())
const port = 3000;

const jwt = require('jsonwebtoken');


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
        { "art": "Apfel", "anzahl": 4, "einheit": "kg", "abgehakt": true}
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
      const token = jwt.sign(
        {username: req.body.username },
        process.env.TOKEN_KEY,
        { expiresIn: "2h"}

      );
      getUser(req.body.username).token = token;
      res.status(201).json(token)
      //res.status(201).json({"sucess": "User created."})
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
        const token = jwt.sign(
          {username: req.body.username },
          process.env.TOKEN_KEY,
          { expiresIn: "2h"}
        );
        res.cookie("token" ,token , { maxAge: 900000, httpOnly: true });
        getUser(req.body.username).token = token;
        //res.status(200).json({success: "Authorized"})
        res.status(200).json(token)
      }
      else{
        res.status(401).json({error: "Unauthorized"})
      }
  }
  }
  else{res.status(400).json({error: "No or invalid argument for user or password."})}
});

function verifyCookie(req){
    const token = req.cookies.token;
    if (token === undefined) {
      return false;
    }
    else{
      try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY)
      req.username = getUser(decoded);
      } 
      catch(err) {
        return false;
      }
    return true;
    }

}


function userExits(username){
  const user = users.filter(singleUser => { return singleUser.username === username});
  return user.length !== 0;
}

function getUser(username){
  const user = users.filter(singleUser => { return singleUser.username === username});
  return user[0];
}


function validateUser(user){
  console.log(user);
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

// Abrufen von Bespieldaten und nicht von durch Nutzer erstellte Liste

app.get('/einkaufsliste', function(req, res) {
  //User Till ist Platzhalter um Musterdaten abzurufen
  let UserEinkaufslisten = getUser("till").listen;
  res.json(UserEinkaufslisten);
});

// Anlegen von Ressource mit Authentifizierung

app.post('/einkaufsliste', function(req, res) {
  if(verifyCookie(req)){
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
    
}
  else{
    res.status(401).json({
      
      error: 'Unauthorized'
    });
  }
});

// unten stehende Funktionen nicht relevant für die Abgabe

/*app.post('/einkaufsliste/:idListe', function(req, res){
    if(verifyCookie(req) === true){
      let list = getUser(req.username).listen.filter(o => { return o.id == req.params.idListe })[0]
      if(list !== undefined){
        if(validateItem === true){
          if(undefined !== list.filter(item => { return item.art === req.body.art })[0]){
            let newItem = req.body;
            newItem.abgehakt = false;
            list.push(newItem);
            res.status(200).json({
              success: 'Item created'
            });
          }else{
            res.status(403).json({
              error: 'Item already exists'
            });
          }
        }else{
          res.status(400).json({
            error: 'Invalid Argument'
          });
        }
      }else{
        res.status(404).json({
          error: 'List not found'
        });
      }
    }else{
      res.status(401).json({
        error: 'Authentication is required'
      });
    }
});

function validateItem(item){
  return item.hasOwnProberty("art") && item.hasOwnProberty("anzahl") && typeof item.art === 'string' && item.anzahl.isInteger() && typeof item.einheit === 'string'
}
*/