import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import crypto from "crypto";

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            email: profile.emails[0].value,
          });

          if (user) {
            if (!user.isVerified) {
              await user.updateOne(
                { _id: user._id },
                { isVerified: true }
              );
              user.isVerified = true;
            }
            return done(null, user);
          }

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(32).toString("hex"),
            role: "student",
            avatar: profile.photos?.[0]?.value || "",
            isVerified: true,
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

export default passport;