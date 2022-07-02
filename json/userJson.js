const { User } = require("../src/db");
const bcrypt = require("bcrypt");

const userAddJson = async () => {
	try {
		await User.create({
			email: "abda08.ab@gmail.com",
			password: bcrypt.hashSync("12345", 10),
			firstName: "Abdel",
			lastName: "Arocha",
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	userAddJson,
};
