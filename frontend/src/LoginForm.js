import React, { useState } from "react";
import { API, FRONTEND } from "./utils";

function submitForm(email, loading, setLoading, path) {
  return async event => {
    event.preventDefault();
    if (loading || email === "") return;
    setLoading(true);

    // Call our API to generate a login email.
    const redirect = FRONTEND(`auth-redirect${path}`);
    const response = await fetch(API("requestLoginLink"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, redirect })
    });
    setLoading(false);

    // Check the response from our API and display a message accordingly.
    // Todo: make an in-app alert box instead of using JS alerts.
    if (response.status !== 200) {
      alert("Something went wrong.");
    } else {
      alert(`Success! We sent a login link to ${email}`);
    }
  };
}

export default function LoginForm({ path }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form onSubmit={submitForm(email, loading, setLoading, path)}>
      <input
        type="text"
        value={email}
        placeholder={"e.g. karl@marx.edu"}
        onChange={e => setEmail(e.target.value)}
      />
      <button>{loading ? "..." : "Go"}</button>
    </form>
  );
}
