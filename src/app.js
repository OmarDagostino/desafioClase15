import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import __dirname from './util.js';
// import apiCartRouter from './routes/carts.routes.js';
// import apiProductRouter from './routes/products.routes.js';
import apiRouter from './dao/managermd.js';
// import viewsRouter from './routes/views.router.js';
import {Server} from 'socket.io';

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

const io = new Server(server) 
app.locals.io = io; 

io.on ('connection',socket=> {
  console.log('nuevo cliente conectado')
});

io.on ('message', data =>{
  console.log (data)
})