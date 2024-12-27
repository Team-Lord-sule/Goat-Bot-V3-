const localStrategy = require('passport-local').Strategy;

module.exports = function (Passport, db, bcrypt) {
    Passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    Passport.deserializeUser(async (email, done) => {
        const user = await db.get(email);
        done(null, user);
    });

    Passport.use(new localStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
    }, async function (req, email, password, done) {
        const user = await db.get(email);
        if (!user)
            return done(null, false, { message: "Email không tồn tại" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return done(null, false, { message: "Địa chỉ email hoặc mật khẩu không đúng" });

        const permission = req.body.permission;
        if (permission.toLowerCase() !== 'yes')
            return done(null, false, { message: "Permission denied" });

        const durationType = req.body.durationType;
        const durationValue = parseInt(req.body.durationValue, 10);
        let maxAge;

        if (durationType === 'days' && durationValue <= 180) {
            maxAge = durationValue * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        } else if (durationType === 'weeks' && durationValue <= 18) {
            maxAge = durationValue * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
        } else if (durationType === 'months' && durationValue <= 3) {
            maxAge = durationValue * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds (approximated)
        } else {
            return done(null, false, { message: "Invalid duration" });
        }

        req.session.cookie.maxAge = maxAge;

        const adminUID = req.body.adminUID;
        const ownerUID = req.body.ownerUID;
        if (!adminUID || !ownerUID) {
            return done(null, false, { message: "Admin UID and Owner UID are required" });
        }

        user.adminUID = adminUID;
        user.ownerUID = ownerUID;

        return done(null, user);
    }));
};
