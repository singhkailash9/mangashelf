const User = require("../models/User");
const jwt = require("jsonwebtoken");

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(statusCode).json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
};

exports.register = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const userExists = await User.findOne({email});
        
        if(userExists) {
            return res.status(400).json({success: false, message: "Email already in use"});
        }
        
        const user = await User.create({username, email, password});

        sendTokenResponse(user, 201, res);
    } catch (err){
        res.status(500).json({success: false, message: `Error in Registering User: ${err.message}`});
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({success: false, message: "Please provide email and password"});
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }
        
        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }
        
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({success: false, message: `Login error: ${err.message}`});
    }
};

exports.logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({success: true, message: "Logged out!"});
};

exports.getMe = async (req, res) => {
    res.status(200).json({success: true, user: req.user});
}