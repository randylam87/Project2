  //Encryption (password hashing)- bCrypt
  const bCrypt = require('bcrypt-nodejs');

  module.exports = function (passport, user) {
      let User = user;
      let LocalStrategy = require('passport-local').Strategy;

      passport.serializeUser(function (user, done) {
          done(null, user.id);
      });

      // Deserialize the user
      passport.deserializeUser(function (id, done) {
          User.findById(id).then(function (user) {
              if (user) {
                  done(null, user.get());
              } else {
                  done(user.errors, null);
              }
          });

      });
      //Signup uses email as username and will have a hashed password
      passport.use('local-signup', new LocalStrategy({
              usernameField: 'email',
              passwordField: 'password',
              passReqToCallback: true // allows us to pass back the entire request to the callback
          },

          function (req, email, password, done) {
              let generateHash = function (password) {
                  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
              };
              //Queries database to locate a single email
              User.findOne({
                  where: {
                      email: email
                  }
              }).then(function (user) {
                //Checks database if the email already exists
                  if (user) {
                      return done(null, false, {
                          message: 'That email is already taken'
                      });
                  } else {
                      //Hashes password
                      var userPassword = generateHash(password);
                      var data = {
                          email: email,
                          password: userPassword,
                          username: req.body.username,
                      };
                      //Creates user with password
                      User.create(data).then(function (newUser, created) {
                          if (!newUser) {
                              return done(null, false);
                          }

                          if (newUser) {
                              return done(null, newUser);
                          }
                      });
                  }
              });
          }
      ));

      //LOCAL SIGNIN
      passport.use('local-signin', new LocalStrategy(

          {
              // by default, local strategy uses username and password, we will override with email
              usernameField: 'email',
              passwordField: 'password',
              passReqToCallback: true // allows us to pass back the entire request to the callback
          },

          function (req, email, password, done) {

              let User = user;
              let isValidPassword = function (userpass, password) {
                  return bCrypt.compareSync(password, userpass);
              };
              //Queries database to locate a single email
              User.findOne({
                  where: {
                      email: email
                  }
              }).then(function (user) {
                //Checks database if the email already exists
                  if (!user) {
                      return done(null, false, {
                          message: 'Email does not exist'
                      });
                  }
                  //Checks database if the hashed passwords match
                  if (!isValidPassword(user.password, password)) {

                      return done(null, false, {
                          message: 'Incorrect password.'
                      });
                  }

                  let userinfo = user.get();
                  return done(null, userinfo);
                  //Error handler
              }).catch(function (err) {
                  console.log("Error:", err);
                  return done(null, false, {
                      message: 'Something went wrong with your Signin'
                  });
              });
          }
      ));
  };