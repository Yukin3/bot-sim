import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
dotenv.config();

// Google OAuth 
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);

        // TODO: Store/find user in database
        const user = {
          id: profile.id,
          name: profile.displayName || `${profile.name.familyName} ${profile.name.givenName}`,
          username: profile.username || `user${profile.id}g`,
          email: profile.emails?.[0]?.value || null, // If missing email
          avatar: profile.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}`,
          provider: profile.provider,  
        };

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth 
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub Profile:", profile);

        // TODO: Store/find user in database
        const user = {
          id: profile.id,
          name: profile.displayName || profile.username,
          username: profile.username || `githubuserg${profile.id}`,
          email: profile.emails?.[0]?.value || null, 
          avatar: profile.photos?.[0]?.value || `https://api.dicebear.com/9.x/big-ears/svg?seed=${encodeURIComponent(profile.displayName)}`,
          provider: "github",  
        };

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
