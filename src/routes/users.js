// jshint esversion:6
const mongoose = require('mongoose');
const validator = require('express-validator');

const express = require('express');

const router = express.Router();

const passport = require('passport');
const Models = require('../models.js');

const Users = Models.User;
require('../passport');

router.use(validator());

// get request for all users
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then(function(users) {
        res.status(201).json(users);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// Get a user by username.
router.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Users.findOne({ Username: req.params.Username }).populate({
      path: 'FavoriteMovies',
      model: 'Movie'
    })
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// GET favoriteMovies by username.
router.get(
  '/users/:Username/Movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne(
      { Username: req.params.Username },
      { Username: true, FavoriteMovies: true }
    )
      .then(function(movie) {
        res.json(movie);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(`Error ${err}`);
      });
  }
);
// Add a user
/* We’ll expect JSON in this format
{
 ID : Integer,
 Username : String,
 Password : String,
 Email : String,
 Birthday : Date
} */
router.post(
  '/users',
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // here is were the validation checks go.
    req.checkBody('Username', 'Username is required').notEmpty();
    req
      .checkBody(
        'Username',
        'Username contains non alphanumeric characters - not allowed'
      )
      .isAlphanumeric();
    req.checkBody('Password', 'Password is required').notEmpty();
    req.checkBody('Email', 'Email is required').notEmpty();
    req.checkBody('Email', 'Email does not appear to be valid').isEmail();

    // check the validation object for errors
    const errors = req.validationErrors();

    if (errors) {
      return res.status(422).json({ errors });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({
      Username: req.body.Username,
    })
      .then(function(user) {
        if (user) {
          return res.status(400).send(`${req.body.Username} already exists`);
        }
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then(function(user) {
            res.status(201).json(user);
          })
          .catch(function(error) {
            console.error(error);
            res.status(500).send(`Error: ${error}`);
          });
      })
      .catch(function(error) {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

// add a movie to a users favorites
router.post(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send(`Error ${err}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// delete favorite by ID.
router.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send(`Error ${err}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

router.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(function(user) {
        if (!user) {
          res.status(400).send(`${req.params.Username} was not found`);
        } else {
          res.status(200).send(`${req.params.Username} was deleted.`);
        }
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
} */

router.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // here is were the validation checks go.
    req.checkBody('Username', 'Username is required').notEmpty();
    req
      .checkBody(
        'Username',
        'Username contains non alphanumeric characters - not allowed'
      )
      .isAlphanumeric();
    req.checkBody('Password', 'Password is required').notEmpty();
    req.checkBody('Email', 'Email is required').notEmpty();
    req.checkBody('Email', 'Email does not appear to be valid').isEmail();

    // check the validation object for errors
    const errors = req.validationErrors();

    if (errors) {
      return res.status(422).json({ errors });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // updated document is returned
      function(err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send(`Error: ${err}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

module.exports = router;
