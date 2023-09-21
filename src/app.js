import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import __dirname from './util.js';
// import apiCartRouter from './routes/carts.routes.js';
// import apiProductRouter from './routes/products.routes.js';
import apiRouter from './dao/managermd.js';
// import viewsRouter from './routes/views.router.js';
import {Server} from 'socket.io';
import { chatModel } from './dao/models/user.model.js';

const app = express();

app.engine('handlebars',handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/',viewsRouter);
app.use('/socket.io', express.static(path.join(__dirname, '../node_modules/socket.io/client-dist')));

app.use(express.json());

app.use('/api', apiRouter);

const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});

let mensajes = []
leerMensajes();
let usuarios = []

app.get('/', (req,res)=>{
  res.setHeader('Content-Type','text/html');
  res.status(200).render('home');
}

  )
app.get('/chat', (req,res)=> {
  res.setHeader('Content-Type','text/html');
  res.status(200).render('chat');
})

const io = new Server(server) 
app.locals.io = io; 

io.on ('connection',socket=> {
  console.log(`se ha conectado un cliente con id ${socket.id}`)

io.on ('message', data =>{
  console.log (data)
})

socket.on('id', email=>{
  console.log(`se ha conectado el usuario ${email}`),
  mensajes.push ({
    user:'server',
    message:'Bienvenido al chat'
  });
  usuarios.push ({id: socket.id, usuario: email});
  socket.emit ('bienvenida', mensajes);
  socket.broadcast.emit ('nuevoUsuario', email);
  mensajes.pop();
  
})

socket.on('nuevoMensaje', mensaje =>{
  mensajes.push(mensaje);
  io.emit ('llegoMensaje', mensaje);
  const newmessage = new chatModel({
    user: mensaje.user, 
    message: mensaje.message
  });
  
  newmessage.save()
    .then(() => {
      console.log('Nuevo mensaje guardado con éxito:');
    })
    .catch((error) => {
      console.error('Error al guardar el mensaje:', error);
    });
  
})

socket.on ('disconnect', () =>{
console.log (`se desconecto el cliente con id ${socket.id} `);
let indice = usuarios.findIndex(usuario=> usuario.id === socket.id);
let emaildesconectado = usuarios[indice].usuario;
socket.broadcast.emit ('desconeccion', emaildesconectado);
usuarios.splice(indice,1);
}) 

});

async function leerMensajes() {
  try {
    const mensajesDB = await chatModel.find({}, 'user message').exec();
    const mensajesArray = mensajesDB.map((documento) => ({
      user: documento.user,
      message: documento.message,
    }));
    mensajes.length = 0; 
    mensajes.push(...mensajesArray); 
  } catch (error) {
    console.error('Error al leer los mensajes guardados:', error);
  } 
}

