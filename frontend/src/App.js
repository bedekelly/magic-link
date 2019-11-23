import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams
} from "react-router-dom";
import createPersistedState from "use-persisted-state";

import "./App.css";
import LoginForm from "./LoginForm";
import { API } from "./utils";

function Secret({ user, api }) {
  const [secret, setSecret] = useState(null);

  // Try hitting an authenticated endpoint each time the user changes.
  useEffect(() => {
    console.log("doing effect because user is now " + user);
    if (user)
      api("privateData")
        .then(response => response.json())
        .then(response => setSecret(response.secret));
    else {
      setSecret(null);
    }
  }, [user]);

  if (secret) return <pre className="secret">{JSON.stringify(secret)}</pre>;
  else if (user) return <span>Loading..."</span>;
  else
    return (
      <>
        <h1>
          <em>Well spotted...</em>
        </h1>
        <p>
          But you can't just <em>see</em> the secrets without signing up. Drop
          your email in the box below and we'll get back you right back here in
          no time.
        </p>
      </>
    );
}

function Home({ user, setUser }) {
  return (
    <>
      <h1>Hey, {user ? `${user}!` : "stranger."}</h1>

      {user ? (
        <>
          <p>Welcome to the cool gang.</p>
          {user ? <button onClick={() => setUser(null)}>Log out</button> : null}
        </>
      ) : (
        <>
          <p>Here's some really good public content for you to enjoy.</p>
          <img
            src="https://placekitten.com/300/300"
            width={200}
            alt="cute kitten"
          />
          <p>
            When you're all done with that, go ahead and sign in/sign up with
            your email ⤵️
          </p>
        </>
      )}
    </>
  );
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SetUsernameRoute({ setUser }) {
  const query = useQuery();
  useEffect(() => {
    setUser(query.get("email"));
  });
  let { location } = useParams();
  return <Redirect to={`/${location || ''}`} />;
}

const useUser = createPersistedState("email");

export default function App() {
  const [user, setUser] = useUser(null);

  const api = async path => {
    try {
      const response = await fetch(API(path), {
        credentials: "include",
        mode: "cors",
        headers: {
          Accept: "application/json"
        }
      });
      if (response.status !== 200) throw new Error(JSON.stringify(response));
      return response;
    } catch (e) {
      alert("Sorry, you've been logged out.");
      setUser(null);
    }
  };

  return (
    <Router>
      <nav>
        <Link to={"/"}>Home</Link>
        <Link to={"/secret"}>Secret</Link>
      </nav>

      <div className="content-box">
        <Switch>
          <Route path={"/auth-redirect/:location?"}>
            <SetUsernameRoute setUser={setUser} />
          </Route>

          <Route path={"/secret"}>
            <Secret api={api} user={user} />
            {!user ? <LoginForm path={"/secret"} /> : null}
          </Route>

          <Route path={"/"}>
            <Home user={user} setUser={setUser} />
            {!user ? <LoginForm path={"/"} /> : null}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
