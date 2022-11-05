import Image from "next/image";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import validator from "../utils/utils";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import { trpc } from "../../utils/trpc";
import Modal from "../../components/Modal";

const SignIn: NextPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(0);
  const [inputEmailError, setInputEmailError] = useState(false);
  const [inputNewPasswordError, setInputNewPasswordError] = useState(false);
  const [inputConfirmNewPasswordError, setInputConfirmNewPasswordError] =
    useState(false);
  // const trpcSubmitPasswordReset = trpc.useMutation(["auth.forgotPassword"]);
  const trpcSubmitPasswordReset = trpc.useMutation(["auth.forgotPasswordV1"]);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [useCase, setUseCase] = useState<"getlink" | "setpassword">("getlink");
  useEffect(() => {
    if (router.isReady) {
      const { token } = router.query;
      if (token && typeof token === "string") {
        setUseCase("setpassword");
        setToken(token);
      }
    } else {
      setUseCase("getlink");
    }
  }, [router]);

  useEffect(() => {
    if (submitted !== 0 && useCase === "getlink") {
      if (!email) {
        setInputEmailError(true);
      } else {
        setInputEmailError(false);
      }
      if (email && !inputEmailError)
        trpcSubmitPasswordReset.mutate(
          { generatePasswordResetLink: { email: email } },
          {
            onError: (e) => {
              setErrorMessage(e.message);
            },

            onSuccess: () => {
              setShowModal(true);
              setErrorMessage("");
            },
          }
        );
    } else if (useCase === "setpassword" && submitted !== 0) {
      if (!password || inputNewPasswordError) {
        setInputNewPasswordError(true);
      } else {
        setInputNewPasswordError(false);
      }

      if (password && (!confirmPassword || inputConfirmNewPasswordError)) {
        setInputConfirmNewPasswordError(true);
      } else {
        setInputConfirmNewPasswordError(false);
      }
      if (
        !inputNewPasswordError &&
        !inputConfirmNewPasswordError &&
        password &&
        confirmPassword
      ) {
        trpcSubmitPasswordReset.mutate(
          { resetPassword: { token: token, newPassword: password } },
          {
            onError: (e) => {
              setErrorMessage(e.message);
            },

            onSuccess: () => {
              setShowModal(true);
              setErrorMessage("");
            },
          }
        );
      }
    }
  }, [submitted]);

  if (useCase === "getlink")
    return (
      <>
        <Head>
          <title>Forgot Password</title>
        </Head>

        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <Modal
            title="Success!!"
            message="Password reset link sent if the given email was in our database."
            main={
              <button
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
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
              Reset Password
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
                          setEmail(e.target.value);
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
                <button
                  type="button"
                  onClick={() => setSubmitted(submitted + 1)}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Get Password Reset Link
                </button>
              </form>
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
  else
    return (
      <>
        <Head>
          <title>Set New Password</title>
        </Head>

        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <Modal
            title="Success!!"
            message="Password resetted sucessfully.Please login using your new password."
            main={
              <button
                onClick={() => {
                  router.push("/auth/signin");
                }}
              >
                Close
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
              New Password
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
                  </output>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="newpassword"
                      name="newpassword"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={inputNewPasswordError}
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !validator("password", e.target.value)
                        ) {
                          setInputNewPasswordError(true);
                        } else {
                          setInputNewPasswordError(false);
                          setPassword(e.target.value);
                        }
                      }}
                      aria-describedby={"new-password-error-decription"}
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div
                    id="email-error"
                    className={inputNewPasswordError ? "" : "hidden"}
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
                      Please enter a valid password. Your password must have
                      minumum lenght of 10.
                    </p>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmnewpassword"
                      name="confirmnewpassword"
                      type="password"
                      aria-invalid={inputConfirmNewPasswordError}
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          (document.getElementById("newpassword") as any)
                            .value !== e.target.value
                        ) {
                          setInputConfirmNewPasswordError(true);
                        } else {
                          setInputConfirmNewPasswordError(false);
                          setConfirmPassword(e.target.value);
                        }
                      }}
                      aria-describedby={"new-password-error-decription"}
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div
                    id="email-error"
                    className={inputConfirmNewPasswordError ? "" : "hidden"}
                  >
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="confirm-password-error-description"
                    >
                      Passwords dont match.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(submitted + 1)}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
};

export default SignIn;
