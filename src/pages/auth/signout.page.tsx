import type { NextPage } from "next";
import Head from "next/head";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

const SignOut: NextPage = () => {
  const [wasSignedIn, setWasSignedIn] = useState(false);

  useEffect(() => {
    if (session.status === "authenticated") {
      setWasSignedIn(true);
    }
  }, []);

  const session = useSession();
  if (session.status === "loading") {
    return (
      <>
        <Head>
          <title>Sign Out</title>
        </Head>
        <div>Loading...</div>
      </>
    );
  } else if (session.status === "unauthenticated" && !wasSignedIn) {
    return (
      <>
        <Head>
          <title>Sign Out</title>
        </Head>
        <div>You are not signed in.</div>
      </>
    );
  } else if (session.status === "unauthenticated" && wasSignedIn) {
    return (
      <>
        <Head>
          <title>Sign Out</title>
        </Head>
        <div>You are signed out.</div>
      </>
    );
  } else
    return (
      <>
        <Head>
          <title>Sign Out</title>
        </Head>

        <div className="flex items-center min-h-full h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:m-auto sm:w-full sm:max-w-md">
            <Image
              height={"50px"}
              width={"150px"}
              className="mx-auto h-12 w-auto"
              src="/public/logo.png"
              alt="MVWA Logo"
            />
            <p className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Are you sure you want to sign out?
            </p>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </button>
          </div>
        </div>
      </>
    );
};

export default SignOut;
