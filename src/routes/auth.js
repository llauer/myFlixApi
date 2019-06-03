var jwtSecret = "your_jwt_secret"; //this has to be the sam key used in the JWTStrategy
var jwt = require("jsonwebtoken");
const passport = require("passport");
require("../passport"); // your local passport file.
let express = require("express");
let router = express.Router();

function generateJWTToken(user) {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you're encoding in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256" // This is the algorithm used to "sign" or encode the values of the JWT
  });
}

// /* POST login */
// router.post("/login", (req, res) => {
//   passport.authenticate("local", { session: false }, (error, user, info) => {
//     if (error || !user) {
//       return res.status(400).json({
//         message: 'Something is not right',
//         user: user
//       });
//     }
//     req.login(user, { session: false }, error => {
//       if (error) {
//         res.send(error);
//       }
//       var token = generateJWTToken(user.toJSON());
//       return res.json({ user, token }); // es6 shorthand
//     });
//   })(req, res);
// });

/* POST login. */

router.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user
      });
    }
    req.login(user, { session: false }, error => {
      if (error) {
        res.send(error);
      }
      var token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    });
  })(req, res);
});

module.exports = router;