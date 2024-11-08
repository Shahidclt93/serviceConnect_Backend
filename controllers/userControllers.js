const httpError = require("../models/errorModel")
const bcrypt = require("bcrypt")
const User = require("../models/userModel")
const Otp = require("../models/otpModel")
const jwt = require("jsonwebtoken");



// SIGN IN USER
const signIn = async (req, res, next) => {
    const { email_or_phone, password } = req.body;

    if (!email_or_phone || !password) {
        return next(new httpError("Email/Phone and password are required.", 400));
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email_or_phone });
        if (!user) {
            return next(new httpError("Invalid credentials.", 401));
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new httpError("Invalid credentials.", 401));
        }

        // Generate Access Token 
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Generate Refresh Token 
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Save refresh token with the user or in a secure storage (e.g., Redis)
        user.refreshToken = refreshToken;
        await user.save();
        res.status(200).json({
            message: "Sign-in successful",
            token:{
                accessToken,
                refreshToken
            },
            user: { userId: user._id, email_or_phone: user.email_or_phone, role: user.role }
        });

    } catch (error) {
        console.error("Sign-in error:", error);
        next(new httpError("Sign-in failed.", 500));
    }
};


// REGISTER A NEW USER
const registerUser = async (req, res, next) =>{
    try{
      const { email_or_phone, password, confirmPassword } = req.body;
      if (!email_or_phone || !password) {
        return next(new httpError("Fill in all the fields.", 422));
      }
      const newEmail = email_or_phone.toLowerCase();

      const emailExists = await User.findOne({ email_or_phone: newEmail });

      if (emailExists) {
        return next(new httpError("Email already exists.", 422));
      }

      if (password.trim().length < 6) {
        return next(
          new httpError("Passwords should be atleast 6 characters.", 422)
        );
      }

      if (password !== confirmPassword) {
        return next(new httpError("Passwords do not match.", 422));
      }
      // Generate and save OTP
      const generateOtp = () => Math.floor(1000 + Math.random() * 9000);
      const otp = generateOtp();
      const otpEntry = new Otp({
        email_or_phone,
        otp,
        expiresAt: new Date(Date.now() + 60 * 1000), // Expires in 1 minute
      });
      await otpEntry.save();

      // Simulate OTP sending
      console.log(`OTP for ${email_or_phone}: ${otp}`);
      res.status(200).json({ message: "OTP sent to email or phone" });
    } catch (error){
        return next(new httpError("User registration failed.", 422))
    }
}

const generateOtp = () => Math.floor(1000 + Math.random() * 9000);



// VERIFY OTP AND CREATE USER
const verifyOtp = async (req, res, next) => {
    const { email_or_phone, otp, password, role } = req.body;
  
    try {
      // Find the OTP entry
      const otpEntry = await Otp.findOne({ email_or_phone });
      if (!otpEntry) {
        return res.status(400).json({ message: 'OTP expired or does not exist' });
      }
  
      // Check if OTP matches
      if (otpEntry.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Hash the password and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email_or_phone,
        password: hashedPassword,
        role
      });
  
      await newUser.save();
  
      // Delete OTP entry after verification
      await Otp.deleteOne({ email_or_phone });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      next(error);
    }
  };


  // RESEND OTP
const resendOtp = async (req, res, next) => {
    const { email_or_phone } = req.body;

    if (!email_or_phone) {
        return next(new httpError("Email or phone number is required.", 400));
    }

    try {
        // Check if an OTP already exists for the user
        let otpEntry = await Otp.findOne({ email_or_phone });
        
        // If no existing OTP entry, create a new one
        if (!otpEntry) {
            otpEntry = new Otp({
                email_or_phone,
                otp: generateOtp(),
                expiresAt: new Date(Date.now() + 60 * 1000), // Expires in 1 minute
            });
        } else {
            // Update OTP and expiration time
            otpEntry.otp = generateOtp();
            otpEntry.expiresAt = new Date(Date.now() + 60 * 1000);
        }

        // Save the updated or new OTP entry
        await otpEntry.save();

        // Simulate sending OTP (for testing purposes)
        console.log(`Resent OTP for ${email_or_phone}: ${otpEntry.otp}`);

        res.status(200).json({ message: 'OTP has been resent to your email or phone' });
    } catch (error) {
        console.error("Error resending OTP:", error);
        next(new httpError("Failed to resend OTP. Please try again.", 500));
    }
};


module.exports = {registerUser, verifyOtp, resendOtp, signIn}