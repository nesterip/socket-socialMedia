const io = require('socket.io')(process.env.PORT, {
    cors: {
        //esta direccion no tiene nada que ver con la del servidor por donde
        //accedemos a nuestra app
        origin: "http://localhost:3000"
    }
});
//8800
let activeUsers =[];

io.on("connection", (socket) => {

    // add new User
    socket.on("new-user-add", (newUserId) => {
        // comprobamos que este nuevo user no esta en activeUsers(usuarios Activos)
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            
            //como no esta lo agregamos
            activeUsers.push({ userId: newUserId, socketId: socket.id });
            console.log("New User Connected", activeUsers);
        }
        // envia todos los activeUsers(usuarios activos)
        // a todos los demos usuarios
        io.emit("get-users", activeUsers);
    });

    //removiendo al user
    socket.on("disconnect", () => {
        // remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        // envia todos los activeUsers(usuarios activos)
        // a todos los demos usuarios
        io.emit("get-users", activeUsers);
    });

    // enviar mensage a un user en especifico
    socket.on("send-message", (data) => {
        
        //id del user que recivira el message
        const { receiverId } = data;

        //verificamos que ese user esta activo
        const user = activeUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to :", receiverId)
        console.log("Data: ", data)

        //si esta activo
        if (user) {
            //le emitimos el nuevo mensaje
            io.to(user.socketId).emit("recieve-message", data);
        }
    });

})
