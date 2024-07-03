import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, "123456", {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
		httpOnly: true, // prevent XSS attacks
		sameSite: "strict", // prevent CSRF attacks
		// secure: process.env.NODE_ENV !== "development", // Enable secure cookies in production
	});
};

export default generateTokenAndSetCookie;
