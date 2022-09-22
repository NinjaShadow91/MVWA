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
export default (_type: string, data: string): boolean => {
  if (!ValidatorRegEx.has(_type))
    throw new Error(`Cant validate the type:${_type}`);

  return ValidatorRegEx.get(_type)!.test(data);
};
