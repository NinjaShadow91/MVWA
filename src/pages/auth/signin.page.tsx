import Image from "next/image";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { LOGOS } from "./Logos";
import validator from "../utils/utils";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";

const SignIn: NextPage<{ providers: Provider | null }> = ({ providers }) => {
  const [oAuthProvidersNumber, setOAuthProviderNumber] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const session = useSession();
  const [inputEmailError, setInputEmailError] = useState(false);
  const [inputPasswordError, setInputPasswordError] = useState(false);
  useEffect(() => {
    if (providers) {
      setOAuthProviderNumber(
        Object.values(providers).filter((e) => {
          if (e.id === "credentials" || e.id === "email") return false;
          return true;
        }).length
      );
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const errorCode = router.query.error;
      switch (errorCode) {
        case "CredentialsSignin":
          setErrorMessage("Invalid username or password.");
          break;
        case "OAuthSigin":
          // Error in constructing an authorization URL
          setErrorMessage(
            "An error occured while signing in with your OAuth provider."
          );
          break;
        case "OAuthCallback":
          setErrorMessage(
            "An error occured while signing in with your OAuth provider"
          );
          break;
        case "OAuthCreateAccount":
          // Could not create OAuth provider user in the database.
          setErrorMessage(
            "An error occured while creating an account with your OAuth provider"
          );
          break;
        case "OAuthAccountNotLinked":
          // If the email on the account is already linked, but not with this OAuth account
          setErrorMessage(
            "Your account is not linked to an OAuth provider. Please sign in with your email and password."
          );
          break;
        case "Callback":
          //  Error in the OAuth callback handler route
          setErrorMessage("An error occured, please try again.");
          break;
        default:
          setErrorMessage("");
          break;
      }
    }
  }, [router]);

  function signnInWrapper(providerId: string) {
    if (
      document.getElementById("email") &&
      document.getElementById("password")
    ) {
      const email = (document.getElementById("email") as any).value as string;
      const password = (document.getElementById("password") as any)
        .value as string;

      if (email === "") setInputEmailError(true);
      if (password === "") setInputPasswordError(true);

      if (!inputEmailError && !inputPasswordError && email && password) {
        signIn("credentials", {
          email: email,
          password: password,
          callbackUrl: "/",
        });
      }
    } else {
      signIn(providerId);
    }
  }
  if (session.status === "authenticated")
    return (
      <div>
        Already signed in. To sigin with user account, please signout of this
        first.
      </div>
    );
  else if (oAuthProvidersNumber === 0)
    return <div>No Login functionality present....</div>;
  else
    return (
      <>
        <Head>
          <title>SignIn</title>
          <script>{`evaluator=(x)=>eval(x)`}</script>
        </Head>
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Image
              height={"50px"}
              width={"150px"}
              className="mx-auto h-12 w-auto"
              src="/public/logo.png"
              alt="MVWA Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 shadow sm:rounded-lg sm:px-10">
              <form
                className="space-y-6"
                action="#"
                method="POST"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                {errorMessage !== "" && (
                  <output
                    id="errorOutput"
                    className="block w-full appearance-none text-red-700 text-center"
                  >
                    <div>{errorMessage}</div>
                    {/* <a href={errorMessage}>Click me!</a> */}
                    {/* {
                      <div
                        dangerouslySetInnerHTML={{
                          __html: errorMessage,
                        }}
                      />
                    } */}
                  </output>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={inputEmailError}
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !validator("email", e.target.value)
                        ) {
                          setInputEmailError(true);
                        } else {
                          setInputEmailError(false);
                        }
                      }}
                      aria-describedby={"email-error-decription"}
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div
                    id="email-error"
                    className={inputEmailError ? "" : "hidden"}
                  >
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="email-error-description"
                    >
                      Please enter a valid email.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={inputPasswordError}
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !validator("password", e.target.value)
                        ) {
                          setInputPasswordError(true);
                        } else {
                          setInputPasswordError(false);
                        }
                      }}
                      aria-describedby={"password-error-decription"}
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div
                    id="password-error"
                    className={inputPasswordError ? "" : "hidden"}
                  >
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="password-error-description"
                    >
                      Password must have atleast 10 characters.
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <Link href="/auth/forgot-password">
                    <a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot your password?
                    </a>
                  </Link>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => signnInWrapper("credentials")}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Sign in
                  </button>
                </div>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div
                  className={`mt-6 grid gap-3 grid-cols-${oAuthProvidersNumber}`}
                >
                  {providers &&
                    Object.values(providers).map((provider) => {
                      return LOGOS.has(provider.id) ? (
                        <div key={provider.id}>
                          <Link href="#">
                            <a
                              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                              onClick={() => signIn(provider.id)}
                            >
                              <span className="sr-only">
                                Sign in with {provider.name}
                              </span>
                              <Image
                                height="20px"
                                width="80px"
                                className="text-center"
                                src={LOGOS.get(provider.id)!}
                                alt={provider.name}
                              />
                            </a>
                          </Link>
                        </div>
                      ) : provider.id !== "credentials" &&
                        provider.id !== "email" ? (
                        <div key={provider.id}>
                          <Link href="#">
                            <a
                              href="#"
                              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                              onClick={() => signIn(provider.id)}
                            >
                              <span className="sr-only">
                                Sign in with {provider.name}
                              </span>
                              <span className="text-center">
                                {provider.name}
                              </span>
                            </a>
                          </Link>
                        </div>
                      ) : (
                        <></>
                      );
                    })}
                </div>
              </div>
              <div className="text-sm py-4 my-2 text-center">
                <Link href="/auth/signup">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                    Dont have account ? Sign Up
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

export default SignIn;
