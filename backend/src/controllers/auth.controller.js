import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

//for the signup part here is the logic
export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 character" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exist " });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//for the login part here is the logic
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id,res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//for the logout part here is the logic
export const logout = (req, res) => {
  try {
    res.cookie("jwt","",{
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


//for the user to update the photo 
export const updateProfile=async(req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true})

        res.status(200).json({updatedUser})
        
    } catch (error) {
        console.log("Error in update profile controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }


}


export const checkAuth = async(req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in CheckAuth controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }

}