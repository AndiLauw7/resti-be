const bcrypt = require("bcrypt");

exports.hashingPassrowd = async (password) => {
  const hassing = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, hassing);
};

exports.comparePassword = async (password, has) => {
  return bcrypt.compare(password, has);
};
