const Chat = require('../models/chat'); 
const Message = require('../models/message'); 
const mongoose = require("mongoose");

const createChat = async (req, res) => {
  try {
    const userId = req.user.userId;  // Extracted from token
    if(!req.body.id){
        return res.status(400).json({ status:false,message: "Please provide a user id" });
    }
    const otherUserId = req.body.id;  // From request body

    if (userId === otherUserId) {
      return res.status(400).json({ status:false,message: "You cannot chat with yourself" });
    }

    // Check if the chat already exists between the two users
    const existingChat = await Chat.findOne({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId }
      ]
    });

    if (existingChat) {
      return res.status(400).json({status:false, message: "Chat already exists" });
    }

    // Create a new chat
    const newChat = new Chat({ from: userId, to: otherUserId });
    await newChat.save();

    return res.status(201).json({ status:true,message: "Chat created successfully", chat: newChat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status:false,message: "Server error" });
  }
};

const sendMessage = async (req, res) => {
    try {
      const userId = req.user.userId;  // Extracted from the token (user sending the message)
      const { message, chat_id } = req.body;  // message, chat_id, and recipient from the body
  
      if (!message || !chat_id) {
        return res.status(400).json({ message: 'Message, chat_id are required' });
      }
  
      // Check if the chat_id exists
      const chat = await Chat.findById({_id:chat_id});
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
  
      // Set from and to based on the chat_id
      const fromUser = chat.from.toString() === userId.toString() ? chat.from : chat.to;
      const toUser = fromUser.toString() === chat.from.toString() ? chat.to : chat.from;
  
      // Create a new message in the specified chat
      const newMessage = new Message({
        from: fromUser,
        to: toUser,  // recipient of the message
        chat_id: chat_id,
        message: message
      });
  
      await newMessage.save();
  
      res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const getChat = async (req, res) => {
    try {
      const userId = req.user.userId;  // User making the request
      const { chat_id } = req.body;  // Chat ID from the request body
  
      if (!chat_id) {
        return res.status(400).json({ message: 'Chat ID is required' });
      }
  
      // Aggregation pipeline to fetch messages and add isOwnMessage field
      const chatMessages = await Message.aggregate([
        { 
          $match: { chat_id: new mongoose.Types.ObjectId(chat_id) }  // Match messages for the specific chat
        },
        {
          $addFields: {
            isOwnMessage: { $eq: ['$from', new mongoose.Types.ObjectId(userId)] }  // Add isOwnMessage field to indicate ownership
          }
        }
      ]);
  
      if (!chatMessages || chatMessages.length === 0) {
        return res.status(404).json({ message: 'Chat not found' });
      }
  
      res.status(200).json({ chat: chatMessages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  

module.exports = { createChat , sendMessage,getChat};
