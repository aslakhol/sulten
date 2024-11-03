import Head from "next/head";
import { SettingsView } from "../../views/Settings/SettingsView";

export default function Settings() {
  return (
    <>
      <Head>
        <title>Sulten</title>
        <meta name="description" content="Dinner planning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SettingsView />
    </>
  );
}