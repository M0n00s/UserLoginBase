const jwt = require("jsonwebtoken");

const validarToken = (req, res, next) => {
	const token = req.header("x-token");

	if (!token) {
		return res.status(401).json({
			ok: false,
			msg: "no hay token",
		});
	}

	try {
		const { uid, name } = jwt.verify(token, process.env.JWT_TOKEN);
		req.uid = uid;
		req.name = name;
	} catch (error) {
		return res.status(401).json({
			ok: false,
			msg: "token expired",
		});
	}

	next();
};

module.exports = {
	validarToken,
};
