const { register } = require('./src/repositories/userRepository');
const { StringeeClient } = require("./lib/StringeeSDK-1.5.10.js");

const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http");
const {Server} = require("socket.io");
const port = process.env.PORT || 2002;
const port_group = 7000;
const { userRouter, messengerRouter, roomRouter} = require("./src/routes/index");
const connect = require("./src/databases/mongodb");
const checkToken = require("./src/authentication/auththentication");
const cors = require("cors")
const { join } = require("node:path");
const { log } = require('console');
const server = http.createServer(app);
const server_group = http.createServer(app);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
// CORS middleware
app.use(cors({origin: true}));
// check token
// app.use(checkToken);
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// 
app.use(express.static("./src"))
// url users
app.use("/users", userRouter);
// url messengers
app.use("/messengers", messengerRouter)
// url rooms
app.use("/rooms", roomRouter);

function getAccessToken(idUser) {
  const apiKeySid = 'SK.0.QzbQyQiyFdV7tC18LBvbiw0twB7y7v';
  const apiKeySecret = 'RGRMM0piRDVMaEhFVFh5UVRlWG5hejZTYjBBOGZs';

  var now = Math.floor(Date.now() / 1000);
  var exp = now * 3600;

  var header = { cty: "stringee-api;v=1" };
  var payload = {
      jti: apiKeySid + "-" + now,
      iss: apiKeySid,
      exp: exp,
      userId: idUser
  };

  var jwt = require('jsonwebtoken')

  var token = jwt.sign(payload,
      apiKeySecret,
      { algorithm: 'HS256' })
  console.log("token " + idUser + " : " + token);
  return token;
}

app.use("/createCallToken", async (req, res) => {
  const {phoneNumber} = req.body;
  const data = await getAccessToken(phoneNumber);

  return res.status(200).json({
    data: data
  });
})

// const socketIo = require("socket.io")(server, {
const socketIo = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "*",
  }
}); 
const socketIo_group = require("socket.io")(server_group, {
  cors: {
    origin: "*",
  }
}); 
// nhớ thêm cái cors này để tránh bị Exception nhé :D  ở đây mình làm nhanh nên cho phép tất cả các trang đều cors được. 

let messages = [];

let rooms = []

socketIo.on("connection", (socket) => {

  // Demo Socket
  socket.on('sendUserIdToServer', user => {
    socketIo.emit(user.phoneNumber, messages);

    socket.on(user.phoneNumber, data => {
      console.log("----------------------------------------");
      console.log("Listening on " + user.phoneNumber);
      console.log("Message data");
      console.log(data);

      data.id = new Date().valueOf();
      
      console.log("Array messages");
      console.log(messages);

      let roomFounds = rooms.filter(room => {
        return room.phoneNumber == data.receiver
      });

      // console.log("Room found");
      // console.log(roomFounds);

      // Neu tin nhan nay la tin nhan danh cho room
      if (roomFounds.length > 0) {
        data.chat_type = "room"
        messages.push(data);

        for (let i = 0; i < roomFounds[0].user.length; i++) {
          // console.log("User in that room");
          // console.log(roomFounds[0].user[i]);

          socketIo.emit(roomFounds[0].user[i], messages);
        }

        socketIo.emit(data.receiver, messages);
        socketIo.emit(data.sender, messages);
      } else {
        data.chat_type = "1-1"
        messages.push(data);

        socketIo.emit(data.receiver, messages);
        socketIo.emit(data.sender, messages);
      } 
    })
  });

  socket.on("deleteMessage", idMessage => {
    let messageToDelete = messages.findIndex(x => x.id === idMessage);

    if (messageToDelete != -1)
      messages[ messages.findIndex(x => x.id === idMessage) ].status = "deleted";

    console.log("Deleted message");
    console.log(messageToDelete);
    console.log("New message after deleted");
    console.log(messages);

    socketIo.emit(messages[ messages.findIndex(x => x.id === idMessage) ].sender, messages);
    socketIo.emit(messages[ messages.findIndex(x => x.id === idMessage) ].receiver, messages);
  });

  console.log("New client connected" + socket.id);

  // socket.on('chat-message',data => {
  //   socketIo.emit('chat-message', data);
  // })

  socket.on("join", data => {
    socket.join(data);

    if ( rooms.find(elem => elem.id == data) == undefined ) {
      let room = {"id": data, "messages": []};
      rooms.push(room);
    }
  });

  socket.on("join-room", data => {
    socket.join(data.id);

    if ( rooms.find(elem => elem.id == data.id) == undefined ) {
      rooms.push(data);
    }
  });

  socket.on("add-new-user", data => {
    console.log("Called add new user");
    console.log(data);

    rooms.find(elem => elem.id == data.id).user = 
      rooms.find(elem => elem.id == data.id).user.concat(data.remainingUser);

    for (let i = 0; i < data.remainingUser.length; i++) 
      rooms.find(elem => elem.id == data.id).messages.push({
        type: "notification", 
        idMessage: "mess" + new Date().valueOf(), 
        date: new Date().toLocaleString(),  
        idRoom: data.id, 
        sender: data.admin,
        sender_name: data.admin,
        receiver: data.id,
        content: data.remainingUserPhoneNumber[i].name + " had join the group at " + new Date().toLocaleString(),
        chat_type: "notification",
        status: "ready"
      });

    // -------------------------------------------------------------

    let list_rooms = [];
    list_rooms = rooms.filter(elem => {
      if (elem.admin == data.admin) return true;

      if (elem.user != undefined)
        return elem.user.includes(data.admin);
      else
        return false;
    });

    console.log("------------- List room");
    console.log(list_rooms);

    if (list_rooms == undefined)
      list_rooms = [];

    if (list_rooms.length > 0)
      for (let i = 0; i < list_rooms.length; i++) {
        socketIo.to(data.admin).emit("rooms2", list_rooms);

        for (let j = 0; j < list_rooms[i].user.length; j++)
          socketIo.to(list_rooms[i].user[j]).emit("rooms2", list_rooms);

        socketIo.to(list_rooms[i].id).emit("rooms2", list_rooms); 
      }
  });

  socket.on("init-room", userId => {
    socket.join(userId);

    let list_rooms = [];
    list_rooms = rooms.filter(elem => {
      if (elem.admin == userId) return true;

      if (elem.user != undefined)
        return elem.user.includes(userId);
      else
        return false;
    });

    if (list_rooms == undefined)
      list_rooms = [];

    if (list_rooms.length > 0)
      for (let i = 0; i < list_rooms.length; i++) {
        socketIo.to(userId).emit("rooms2", list_rooms);

        for (let j = 0; j < list_rooms[i].user.length; j++) {
          socketIo.to(list_rooms[i].user[j]).emit("rooms2", list_rooms);
        }

        socketIo.to(list_rooms[i].id).emit("rooms2", list_rooms); 
      } 
  });

  socket.on("remove-user-from-group", data => {
    rooms.find(elem => elem.id == data.user.id).user.splice(
      rooms.find(elem => elem.id == data.user.id).user.findIndex(x => x === data.removedUser.phoneNumber), 1
    );

    rooms.find(elem => elem.id == data.user.id).messages.push({
      type: "notification", 
      idMessage: "mess" + new Date().valueOf(), 
      date: new Date().toLocaleString(),  
      idRoom: data.user.id, 
      sender: data.removedUser.phoneNumber,
      sender_name: data.user.admin,
      receiver: data.user.id,
      content: data.removedUser.name + " had left the group at " + new Date().toLocaleString(),
      chat_type: "notification",
      status: "ready"
    });

    socketIo.to(data.user.id).emit("chat-message-2", 
      rooms.find(elem => elem.id == data.user.id).messages
    );

    // ---------------------------------------------------

    // let list_rooms = [];
    // list_rooms = rooms.filter(elem => {
    //   if (elem.admin == data.removedUser.phoneNumber) return true;

    //   if (elem.user != undefined)
    //     return elem.user.includes(data.removedUser.phoneNumber)
    //   else
    //     return false;
    // });

    // if (list_rooms == undefined)
    //   list_rooms = [];

    // // if (list_rooms.length > 0)
    //   for (let i = 0; i < list_rooms.length; i++) {
    //     socketIo.to(data.removedUser.phoneNumber).emit("rooms2", list_rooms);

    //     for (let j = 0; j < list_rooms[i].user.length; j++)
    //       socketIo.to(list_rooms[i].user[j]).emit("rooms2", list_rooms);

    //     socketIo.to(list_rooms[i].id).emit("rooms2", list_rooms); 
    //   }
  });

  socket.on("destroy-room", data => {
    let removedIndex = rooms.findIndex(x => x.id === data.id);
    rooms.splice(removedIndex, 1);

    console.log("----------- Destroyed room");
    console.log(data);

    socket.leave(data.id);
    // socketIo.emit("init-room", data.admin);
  });

  socket.on("init-chat-message", idRoom => {
    console.log("Init chat message");

    console.log("Room id");
    console.log(idRoom);
    console.log("Found room");
    console.log(rooms.find(elem => elem.id == idRoom));
    
    if ( rooms.find(elem => elem.id == idRoom) ) {
      socketIo.to(idRoom).emit("rooms", 
        rooms.find(elem => elem.id == idRoom).messages
      );
    }
  });

  socket.on("chat-message", async data => {
    data.date = new Date().toLocaleString();

    console.log(rooms.find(elem => elem.id == data.idRoom));
    
    if ( rooms.find(elem => elem.id == data.idRoom) != undefined ) {
      rooms.find(elem => elem.id == data.idRoom).messages.push(data);
    }

    socketIo.to(data.idRoom).emit("chat-message-2", 
      rooms.find(elem => elem.id == data.idRoom).messages
    );
    
    console.log("-- Socket: Sended data to client ");
    console.log(data);
  });

  socket.on("forward-message", async data => {
    for (let i = 0; i < data.receivers.length; i++) {
      console.log({
        type: "text", 
        idMessage: "mess" + new Date().valueOf(), 
        date: new Date().toLocaleString(), 
        idRoom: data.receivers[i].room_id, 
        sender: data.sender, 
        sender_name: data.sender_name, 
        receiver: data.receivers[i].phoneNumber, 
        content: data.content, 
        chat_type: data.type, 
        status: "ready"
      });
      
      socket.emit('chat-message', {
        type: "text", 
        idMessage: "mess" + new Date().valueOf(), 
        date: new Date().toLocaleString(), 
        idRoom: data.receivers[i].room_id, 
        sender: data.sender, 
        sender_name: data.sender_name, 
        receiver: data.receivers[i].phoneNumber, 
        content: data.content, 
        chat_type: data.type, 
        status: "ready"
      });
    }
  });

  socket.on("remove-message", async data => {
    let found_room = rooms.find(room => room.id == data.idRoom);

    let found_message = found_room.messages.find(mess => mess.idMessage == data.idMessageToRemove);
    found_message.status = "removed";
  
    console.log("------- Found Message to remove---------");
    console.log(found_message);

    socketIo.to(data.idRoom).emit("chat-message-2", 
      found_room.messages
    );
  });

  socket.on("delete-message", async data => {
    let found_room = rooms.find(room => room.id == data.idRoom);

    let found_message = found_room.messages.find(mess => mess.idMessage == data.idMessageToDelete);
    found_message.status = "deleted";
  
    console.log("------- Found Message to delete---------");
    console.log(found_message);

    socketIo.to(data.idRoom).emit("chat-message-2", 
      found_room.messages
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/api", (req, res) => {
  res.json(rooms);
});

server.listen(port, async () => {
  await connect();
  console.log(`Example app on for port ${port}`);
});