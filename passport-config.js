// passport-config.js

const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); // Replace with your user model

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      // Verify username and password
      User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (user.password !== password) return done(null, false);
        return done(null, user);
      });
    }
  ));

  // Serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

};
