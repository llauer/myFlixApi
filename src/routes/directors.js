//jshint esversion:6

const mongoose = require("mongoose");
const Models = require("../models.js");

const Movies = Models.Movie;

let express = require("express");

let router = express.Router();

// GETs movies by director
router.get("/movies/directors/:director", (req, res) => {
  Movies.find({ "Director.Name": req.params.director })
    .then(movies => {
      res.status(201).json(movies);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

module.exports = router;
