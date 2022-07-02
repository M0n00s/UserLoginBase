// rutas de usuarios
//   /api/auth

const { Router } = require("express");
const router = Router();

const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { validarToken } = require("../middlewares/validarToken");
const { validarCampos } = require("../middlewares/validarCampos");
const { User } = require("../db");

//ruta login
router.post(
	"/",
	[
		//validaciones
		check("email", "el email es obligatorio").isEmail().notEmpty(),
		check("password", "el password es obligatorio").notEmpty(),
		validarCampos,
	],
	async (req, res) => {
		const { email, password } = req.body;
		try {
			//buscar usuario
			const usuario = await User.findOne({ where: { email } });
			if (!usuario) {
				return res
					.status(400)
					.json({ ok: false, msg: "usuario no valido" });
			}
			//compara contraseñas encryptadas
			const validPass = bcrypt.compareSync(password, usuario.password);
			if (!validPass) {
				return res
					.status(200)
					.json({ ok: false, msg: "contraseña no valida" });
			}
			// generar Token
			const token = await jwt.sign(
				{ uid: usuario.id, name: usuario.firstName },
				process.env.JWT_TOKEN,
				{ expiresIn: "2h" }
			);

			res.status(200).json({
				ok: true,
				token,
			});
		} catch (error) {
			console.log(error);
		}
	}
);
// registro de usuario
router.post('/new', [
	//validaciones de campos
	check('email', 'el email es obligatorio').notEmpty(),
	check('firstName', 'el firstName es obligatorio').notEmpty(),
	check('password', 'el password es obligatorio').notEmpty(),
	validarCampos

],async (req, res)=> {
	const {email, firstName, lastName, password} = req.body
	// buscar si existe usuario
	try {
	const existUser = await User.findOne({ where: { email } });
		if (existUser) {
			return res
				.status(400)
				.json({ ok: false, msg: "usuario ya registrado" });
		}
	//crear usuario
		const usuario = await User.create({
			email,
			password: bcrypt.hashSync(password, 10),
			firstName,
			lastName,
		});
	// generar Token Login
	const token = await jwt.sign(
		{ uid: usuario.id, name: usuario.firstName },
		process.env.JWT_TOKEN,
		{ expiresIn: "2h" }
	);

	res.status(200).json({
		ok: true,
		msg: 'user Created',
		token,
	});

	} catch (error) {
		console.log(error);
	}
});
//revalidar token y mantener el usuario logueado
router.get("/renew", validarToken, async (req, res) => {
	// recuperamos del token por medio de "validar token" el uid y el name
	const { uid, name } = req;

	//generamos un nuevo token
	const token = await jwt.sign({ uid, name }, process.env.JWT_TOKEN, {
		expiresIn: "2h",
	});

	// devolvemos el nuevo token
	res.json({ ok: true, token });
});

module.exports = router;
