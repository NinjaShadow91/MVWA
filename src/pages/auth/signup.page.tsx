import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { getProviders, signIn } from "next-auth/react";
import { Provider } from "next-auth/providers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import Image from "next/image";

import { LOGOS } from "./Logos";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import Modal from "../../components/Modal";
import validator from "../utils/utils";

const SignUp: NextPage<{ providers: Provider | null }> = ({ providers }) => {
  const [oAuthProvidersNumber, setOAuthProviderNumber] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  1;
  // const trpcSignUP = trpc.useMutation(["auth.signupV1"]);
  const trpcSignUP = trpc.useMutation(["auth.signup"]);

  const [inputEmailError, setInputEmailError] = useState(false);
  const [inputPasswordError, setInputPasswordError] = useState(false);
  const [inputDOBError, setInputDOBError] = useState(false);
  const [inputNameError, setInputNameError] = useState(false);

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

  function signUpWrapper(providerId: string) {
    if (providerId === "credentials") {
      const email = (document.getElementById("email") as any).value as string;
      const password = (document.getElementById("password") as any)
        .value as string;
      const name = (document.getElementById("name") as any).value as string;
      const dob = (document.getElementById("dob") as any).value as string;
      if (name === "") {
        setInputNameError(true);
      } else {
        setInputNameError(false);
      }

      if (password === "") setInputPasswordError(true);
      if (email === "") setInputEmailError(true);
      if (dob === "") setInputDOBError(true);

      if (
        !inputEmailError &&
        !inputDOBError &&
        !inputPasswordError &&
        dob &&
        email &&
        password &&
        name
      )
        trpcSignUP.mutate(
          { email, password, name, dob },
          {
            onSuccess() {
              setShowModal(true);
              setErrorMessage("");
            },
            onError(err) {
              setErrorMessage(err.message);
            },
          }
        );
    } else {
      console.log(providerId);
      signIn(providerId);
    }
  }

  function validateDateLiteral(dateLiteral: string) {
    try {
      new Date(dateLiteral);
      return true;
    } catch (err) {
      return false;
    }
  }

  if (oAuthProvidersNumber === 0)
    return <div>No SignUp functionality present....</div>;
  else
    return (
      <>
        <Head>
          <title>SignUp</title>
        </Head>

        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <Modal
            title="Success!!"
            message="Account created successfully..Please verify the email to signin by opening the link recieved in  email."
            main={
              <button
                id="signin"
                onClick={() => {
                  // setTimeout(() => router.push("/auth/signin"), 50);
                  router.push("/auth/signin");
                  // setShowModal(false);
                }}
              >
                SignIn
              </button>
            }
            open={showModal}
            setOpen={setShowModal}
          ></Modal>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Image
              height={"50px"}
              width={"150px"}
              className="mx-auto h-12 w-auto"
              src="/public/logo.png"
              alt="MVWA Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Create Account
            </h2>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 shadow sm:rounded-lg sm:px-10">
              <form
                id="signup-form"
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
                  </output>
                )}

                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="texxt"
                      autoComplete="given-name"
                      required
                      pattern="[a-zA-Z.]+"
                      aria-invalid={inputNameError}
                      onChange={() => {
                        setInputNameError(false);
                      }}
                      aria-describedby={"name-error-decription"}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                    <div className={inputNameError ? "" : "hidden"}>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon
                          className="h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                      <p
                        className="mt-2 text-sm text-red-600"
                        id="name-error-description"
                      >
                        Please enter your name.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700"
                  >
                    DOB
                  </label>
                  <div className="mt-1">
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      autoComplete="bday"
                      required
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !validateDateLiteral(e.target.value)
                        ) {
                          setInputDOBError(true);
                        } else {
                          setInputDOBError(false);
                        }
                      }}
                      aria-invalid={inputDOBError}
                      aria-describedby={"dob-error-decription"}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className={inputDOBError ? "" : "hidden"}>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="dob-error-description"
                    >
                      Enter a valid DOB. You must be atleast 3 years old to
                      signup.
                    </p>
                  </div>
                </div>
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
                      aria-invalid={inputEmailError}
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
                      autoComplete="new-password"
                      required
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
                      aria-invalid={inputPasswordError}
                      aria-describedby={"password-error-decription"}
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
                <div>
                  <button
                    type="button"
                    onClick={() => signUpWrapper("credentials")}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    SignUp
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
                    Object.values(providers).map((provider: Provider) => {
                      return LOGOS.has(provider.id) ? (
                        <div key={provider.id}>
                          <Link href="#">
                            <a
                              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                              onClick={() => signUpWrapper(provider.id)}
                            >
                              <span className="sr-only">
                                SignUp with {provider.name}
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
                              onClick={() => signUpWrapper(provider.id)}
                            >
                              <span className="sr-only">
                                SignUp with {provider.name}
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
                <Link href="/auth/signin">
                  <a className="font-medium text-center text-indigo-600 hover:text-indigo-500">
                    Already have account ? Sign In
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

export default SignUp;
