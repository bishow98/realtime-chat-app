import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


//yesle chai aru logged in user lai left side ma dekhayo tara aafu lai chai dekhayena
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSIdebar", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//yesle chai 2ta user bich ko message lai get garna sakinxa
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId }, //sender chai ma ho ra receiver chai aarko user jasle message pairaxa
        { senderId: userToChatId, receiverId: myId }, //sender chai aarko user ho ra receiver chai ma ho
        //sabai complete message chai receive hunxa yaha bata
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//for sending the message 
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      //upload to the cloudianry if there is image:
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();


    //realtime functionality goes here with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId) {
      //io.to().emit() - to() le chai specific person lai matra message pathauna help garxa 
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }


    res.status(201).json(newMessage);



  } catch (error) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
