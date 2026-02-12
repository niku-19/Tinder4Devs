import validator from "validator";

export const validateRegisterUser = (user) => {
  const {
    firstName,
    lastName,
    age,
    contactNumber,
    email,
    password,
    yearsOfExperience,
    skills,
  } = user;

  if (
    !firstName ||
    !lastName ||
    !age ||
    !contactNumber ||
    !email ||
    !password ||
    !yearsOfExperience ||
    !skills
  ) {
    throw new Error(
      "All fields are required for registration" + JSON.stringify(user),
    );
  }

  if (age < 18 || age > 100) {
    throw new Error("Age must be between 18 and 100");
  }

  if (!validator.isMobilePhone(contactNumber, "any")) {
    throw new Error("Invalid contact number format");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
    );
  }

  if (yearsOfExperience < 0 || yearsOfExperience > 80) {
    throw new Error("Years of experience must be between 0 and 80");
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    throw new Error("Skills must be a non-empty array");
  }
};

export const validateSignInUser = (user) => {
  const { email, password } = user;

  if (!email || !password) {
    throw new Error("Email and password are required for sign-in");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
    );
  }
};
