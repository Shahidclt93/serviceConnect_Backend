const { Router } = require("express");
const {registerUser, verifyOtp, resendOtp, signIn} = require("../controllers/userControllers")

const router = Router();

router.post("/register", registerUser)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/sign-in", signIn)

module.exports = router;
