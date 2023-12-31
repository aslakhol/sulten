import Head from "next/head";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function Secret() {
  const posthog = usePostHog();
  const [secret, setSecret] = useState("");

  function superSecret() {
    posthog.capture("user entered secret phrase");
    localStorage.setItem("sulten-secret", secret);
    setSecret("");
  }

  return (
    <>
      <Head>
        <title>Sulten</title>
        <meta name="description" content="Dinner planning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Input
        type="password"
        placeholder="Enter superdupersecret phrase"
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
      />
      <Button onClick={superSecret}>Save</Button>
    </>
  );
}
