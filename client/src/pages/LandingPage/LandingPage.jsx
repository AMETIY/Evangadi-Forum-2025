import React from "react";
import { Link } from "react-router-dom";
import classes from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div>
      <div className={classes.background}>
        <div className={classes.textDiv}>
          <h2>
            Bypass the Industrial, <br /> Dive into the Digital!
          </h2>
          <p>
          We stand at the edge of a golden opportunity — it's time to take a bold step into the digital future. Join the Evangadi Networks Q&A platform and connect with developers across the globe.
          </p>
          <div className={classes.linkDiv}>
            {/* Updated links to work with your auth system */}
            <Link className={classes.createAccount} to="/auth?mode=signup">
              Create Account
            </Link>
            <Link className={classes.signIn} to="/auth?mode=login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;