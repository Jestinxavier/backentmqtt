const { Server } = require("socket.io");

const io = new Server({ cors: "*" });

io.on(`connection`, (socket) => {
  socket.on("disconnect", () => {});
});

module.exports = io;
