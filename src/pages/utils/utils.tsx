import Image from "next/image";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";

const ValidatorRegEx = new Map<string, RegExp>([
  [
    "email",
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
  ],
  ["password", /^.{10,}$/],
  [
    // not working for all cases
    "date",
    /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)[0-9]{2}/,
  ],
]);

// validator
export const validator = (_type: string, data: string): boolean => {
  if (!ValidatorRegEx.has(_type))
    throw new Error(`Cant validate the type:${_type}`);

  return ValidatorRegEx.get(_type)!.test(data);
};

export default validator;

// Add support for different type of medias
export const Media = ({ media }: { media: string }) => {
  const [url, setURL] = useState("");
  const [altText, setAltText] = useState("");

  trpc.useQuery(["media.get", media], {
    onSuccess: (data) => {
      if (data && data.url) {
        if (!data.url.startsWith("/")) {
          setURL("/".concat(data.url));
        } else {
          setURL(data.url);
        }
        setAltText(data.altText);
      }
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  return (
    <Image
      height={200}
      width={200}
      src={url}
      alt={altText}
      className="h-full w-full object-cover object-center"
    />
  );
};

export const getProductLink = (productId: string) => {
  return `http://localhost:3000/product/${productId}`;
};
