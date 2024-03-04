const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');
const { connect } = require('http2');


app.use(methodOverride("__method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


//create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'userdata',
  password: '@@aaru123',
});


let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),

  ];
}

//home route

app.get("/", (req, res) => {

  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
});


//show route

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;

  try {
    connection.query(q, (err, user) => {
      if (err) throw err;

      res.render("show.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in database");
  }
});

// add route
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});


app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();

  //query to insert new user

  let q = `INSERT INTO user (id, username,email,password) VALUES
     ('${id}', '${username}', '${email}', '${password}' )`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("Added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("Some error occured Please try again ");
  }
});


// Edit route

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in database");
  }
});

// update database route

// app.patch("/user/:id",(req,res)=>{
//   res.send("updated");
// });






app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;

  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("Wrong password");
      } else {

        let q2 = `UPDATE user SET username='${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error in database please try after some time");
  }
});




//delete route

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id ='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with database");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = ` SELECT * FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password enetered !");
      } else {
        let q2 = ` DELETE FROM user WHERE id = '${id}'`;  // query to delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with database");
  }
});


app.listen("3000", () => {
  console.log("Listening on port 3000");
});


