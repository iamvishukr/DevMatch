const validator = require("validator");
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "about",
    "skills",
    "age",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditAllowed;
};

const passwordValidation = (req) => {
  const { newPassword } = req.body;
  const allowedEditField = ["password", "newPassword"];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditField.includes(field)
  );
  if (!isEditAllowed) {
    return res.status(400).json({ error: "Only password can be updated." });
  }else if(!validator.isStrongPassword(newPassword)) {
    throw new Error("Please enter a strong password");
  }
  return isEditAllowed;
};


module.exports = {
  validateSignUpData,
  validateEditProfileData,
  passwordValidation,
};
