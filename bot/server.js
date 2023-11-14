import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";

const app = express();
const port = 3000; // Порт, на котором будет работать сервер

app.use(bodyParser.json());

// Заменить на свои учетные данные для базы данных
const connection = mysql.createConnection({
  host: "sql11.freemysqlhosting.net",
  user: "sql11662083",
  password: "snyXlrTrjd",
  port: "3306",
  database: "sql11662083",
});

connection.connect();

// Обработчик POST-запроса для сохранения данных в базу
app.post("/saveData", (req, res) => {
  const userId = req.body.usr;
  const artistName = req.body.artist;

  const sql = "INSERT INTO FavoriteArtists (userId, artistName) VALUES (?, ?)";

  connection.query(sql, [userId, artistName], (err, results) => {
    if (err) {
      console.error("Error saveData:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("saveData successfully:", results);
      res.status(200).send("Data saved successfully");
    }
  });
});


app.get("/checkUser/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = "SELECT 1 FROM `Users` WHERE id = ?";

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error checkUser:", err);
      res.status(500).send("checkUser Internal Server Error");
    } else {
      if (results.length > 0) {
        res.status(200).json({ userExists: true, userData: results });
      } else {
        res.status(200).json({ userExists: false });
      }
    }
  });
});
app.post("/addUser", (req, res) => {
  const id = req.body.id;
  const searchResolving = req.body.searchResolving;
  const name = req.body.name;
  const gender = req.body.gender;

  const sql =
    "INSERT INTO Users (id, name, gender, searchResolving) VALUES (?, ?, ?, ?)";

  connection.query(sql, [id, name, gender, searchResolving], (err, results) => {
    if (err) {
      console.error("Error addUser:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("addUser successfully:", results);
      res.status(200).send("addUser successfully");
    }
  });
});

app.post("/searchResolving", (req, res) => {
  const searchResolving = req.body.searchResolving;

  const sql = "INSERT INTO Users (searchResolving) VALUES (?)";

  connection.query(sql, [searchResolving], (err, results) => {
    if (err) {
      console.error("Error searchResolving:", err);
      res.status(500).send("Internal Server Error searchResolving");
    } else {
      console.log("searchResolving successfully:", results);
      res.status(200).send("searchResolving successfully");
    }
  });
});

app.get("/getUserFavoriteArtists/:userId", (req, res) => {
  const usr = req.params.userId;

  const sql = "SELECT artistName FROM FavoriteArtists WHERE userId = ?";

  connection.query(sql, [usr], (err, results) => {
    if (err) {
      console.error("Error getting user FavoriteArtists:", err);
      res.status(500).send("getUserFavoriteArtists Internal Server Error");
    } else {
      if (results.length > 0) {
        res.status(200).json({ favoriteArtistsExists: true, userData: results });
      } else {
        res.status(200).json({ favoriteArtistsExists: false });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
