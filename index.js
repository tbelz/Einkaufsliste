require('dotenv').config()
const express = require('express')
const crypto = require('crypto')
var cookieParser = require('cookie-parser')
const pathUtils = require("path")
const { readData, writeData } = require("./fileStorage.js")


const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser("Schhhhhhh!"))

const port = 3000;
const jwt = require('jsonwebtoken');
let users = [];

users.push({
  "username": "till",
  "passwordDerivative": "geheim",
  "auth": ["kjmvrekvkj"],
  "listen": [
    {
      "name": "ALDI",
      "einträge": [
        { "art": "Apfel", "anzahl": 4, "einheit": "kg", "abgehakt": true }
      ]
    }
  ]
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

// Your code goes here

// Register & Login

app.post('/register', function (req, res) {
  console.log("adding user")
  if (validateUser(req.body)) {
    if (!userExits(req.body.username)) {
      users.push({ username: req.body.username, passwordDerivative: derivePassword(req.body.password), listen: [] })
      const token = jwt.sign(
        { username: req.body.username },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }

      );
      getUser(req.body.username).token = token;
      res.status(201).json(token)
      console.log("adding user1")
      //res.status(201).json({"sucess": "User created."})
    }
    else {
      console.log("adding user2")
      res.status(400).json({ error: "User already exits." })
    }
  }
  else {
    res.status(400).json({ error: "No or invalid argument for user or password." })
    console.log("adding user3")
  }
});

app.post('/login', function (req, res) {

  if (validateUser(req.body)) {
    if (!userExits(req.body.username)) {
      res.status(401).json({ error: "User does not exist" })
    }
    else {
      if (derivePassword(req.body.password) === getUser(req.body.username).passwordDerivative) {
        const token = jwt.sign(
          { username: req.body.username },
          process.env.TOKEN_KEY,
          { expiresIn: "2h" }
        );
        res.cookie("token", token, { maxAge: 900000, httpOnly: true, secure: false, sameSite: "Lax" });
        getUser(req.body.username).token = token;
        //res.status(200).json({success: "Authorized"})
        res.status(200).json(token)
      }
      else {
        res.status(401).json({ error: "Unauthorized" })
      }
    }
  }
  else { res.status(400).json({ error: "No or invalid argument for user or password." }) }
});

app.post('/logout', function (req, res) {
  res.clearCookie("token")
  res.sendStatus(200);
});


app.get('/loginStatus', function (req, res) {
  if (verifyCookie(req)) {
    res.json({ "isLoggedin": "true" });
  }
  else {
    res.json({ "isLoggedin": "false" });
  }

});

function verifyCookie(req) {
  const token = req.cookies.token;
  if (token === undefined) {
    return false;
  }
  else {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY)
      req.username = decoded.username;
      if (!userExits(decoded.username)) {
        return false;
      }
    }
    catch (err) {
      return false;
    }
    return true;
  }

}


function userExits(username) {
  const user = users.filter(singleUser => { return singleUser.username === username });
  return user.length !== 0;
}

function getUser(username) {
  const user = users.filter(singleUser => { return singleUser.username === username });
  return user[0];
}


function validateUser(user) {
  return user.hasOwnProperty("username") && user.hasOwnProperty("password") &&
    typeof user.password === 'string' && typeof user.username === 'string'

}

function derivePassword(password) {
  return crypto.pbkdf2Sync(
    password,
    'eeo2ubsWHDgegH9CPaFv',
    100000,
    64,
    'sha512'
  ).toString('hex')
}

// Abrufen von Bespieldaten und nicht von durch Nutzer erstellte Liste

app.get('/einkaufslisten/:name', function (req, res) {
  if (verifyCookie(req)) {
    let UserEinkaufslisten = getUser(req.username).listen;
    const einkaufliste = UserEinkaufslisten.filter(o => { return o.name === req.params.name });
    if (einkaufliste.length === 1) {
      res.status(200).json(
        einkaufliste
      );
    }
    else {
      res.status(404).json(
        {
          error: 'List not Found'
        }
      );
    }
  }
  else {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }

});

app.get('/einkaufslisten', function (req, res) {
  if (verifyCookie(req)) {
    let UserEinkaufslisten = getUser(req.username).listen;
    res.json(UserEinkaufslisten);
  }
  else {
    res.status(401).json({
      error: 'Unauthorized'
    });
  }

});




// Anlegen von Ressource mit Authentifizierung

app.post('/einkaufslisten', function (req, res) {
  if (verifyCookie(req)) {
    if (req.body.name === undefined) {
      res.status(400).json({
        error: 'Please insert a name for your list'
      });
    }
    else {
      let user = getUser(req.username);
      const matchingItems = user.listen.filter(o => { return o.name === req.body.name });
      if (matchingItems.length !== 0) {
        res.status(400).json({
          error: 'Name invalid'
        });

      }
      let liste = { "name": req.body.name, "einträge": [] }
      user.listen.push(liste);
      res.status(200).json({
        success: 'List created'
      });
    }

  }
  else {
    res.status(401).json({

      error: 'Unauthorized'
    });
  }
});

app.delete('/einkaufslisten/:name', function (req, res) {
  if (verifyCookie(req) === true) {
    let lists = getUser(req.username).listen;
    let existingList = lists.filter(l => { return l.name == req.params.name })[0]
    if (existingList !== undefined) {
      const index = lists.indexOf(existingList);
      if (index !== -1) {
        lists.splice(index, 1);
      }
      res.status(200).json({
        success: 'List successfully removed'
      });
    } else {
      res.status(404).json({
        error: 'List not found'
      });
    }
  } else {
    res.status(401).json({
      error: 'Authentication is required'
    });
  }
})
function getList(user, listName) {
  let lists = user.listen;
  lists = lists.filter(l => { return l.name == listName })[0]
  if (lists.length == 0) {
    return null
  }
  return lists

}
// unten stehende Funktionen nicht relevant für die Abgabe

app.post('/einkaufslisten/:name/items', function (req, res) {
  if (verifyCookie(req) === true) {
    let list = getList(getUser(req.username), req.params.name)

    if (list != null) {
      if (validateItem(req.body) === true) {
        const existingItemList = list.einträge.filter(item => { return item.art === req.body.art });
        console.log(existingItemList);
        if (existingItemList.length == 0) {
          let newItem = req.body;
          console.log(newItem);
          newItem.abgehakt = false; //einheit optional muss aber vorhanden sein
          list.einträge.push(newItem);
          res.status(200).json({
            success: 'Item created'
          });
        } else {

          res.status(403).json({
            error: 'Item already exists'
          });
        }
      } else {
        console.log("Validation fail")
        res.status(400).json({
          error: 'Invalid Argument'
        });
      }
    } else {
      res.status(404).json({
        error: 'List not found'
      });
    }
  } else {
    res.status(401).json({
      error: 'Authentication is required'
    });
  }
});

function validateItem(item) {
  console.log(item.hasOwnProperty("art"), item.hasOwnProperty("anzahl"), typeof item.art === 'string', typeof item.einheit === 'string')
  return item.hasOwnProperty("art") && item.hasOwnProperty("anzahl") && typeof item.art === 'string' && typeof item.einheit === 'string'
}

app.delete('/einkaufsliste/:name/:nameItem', function (req, res) {
  if (verifyCookie(req) === true) {
    console.log("delete");
    let list = getUser(req.username).listen.filter(o => { return o.name == req.params.name })[0]
    if (list !== undefined) {
      let existingItem = list.einträge.filter(o => { return o.art === req.params.nameItem })
      if (existingItem !== undefined) {
        const index = list.einträge.indexOf(existingItem[0]);
        if (index !== -1) {
          list.einträge.splice(index, 1);
          console.log(list);
        }
        res.status(200).json({
          success: 'Item successfully removed'
        });
      } else {
        res.status(404).json({
          error: 'Item not found'
        });
      }
    } else {
      res.status(404).json({
        error: 'List not found'
      });
    }
  } else {
    res.status(401).json({
      error: 'Authentication is required'
    });
  }
})



app.put('/einkaufsliste/:name/:nameItem', function (req, res) {
  if (verifyCookie(req) === true) {
    let list = getUser(req.username).listen.filter(o => { return o.name == req.params.name })[0]
    console.log("list:" + list + getUser(req.username));
    if (list !== undefined) {
      let existingItem = list.einträge.filter(o => { return o.art === req.params.nameItem })
      if (existingItem !== []) {
        let newItem = req.body
        const index = list.einträge.indexOf(existingItem[0])
        if (index !== -1) {
          list.einträge[index] = newItem;
        }
        res.status(200).json({
          success: 'Item updated'
        })
      } else {
        res.status(404).jdocument.cookieson({
          error: 'Item not found'
        });
      }
    } else {
      res.status(404).json({
        error: 'List not found'
      });
    }
  } else {
    res.status(401).json({
      error: 'Authentication is required'
    });
  }

})



app.get("*", function (req, res) {
  res.sendFile(pathUtils.resolve("public", "index.html"));
});
