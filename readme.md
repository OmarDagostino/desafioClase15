# Desafío de la clase 10 del curso de Programación Back-end
# Comisión 55565  de CoderHouse

## Autor : Omar D'Agostino

## Tecnologías utilizadas : 
- Node JS (con su sistema de archivos nativo fs) : v18.16.1
- Motor de plantillas : Handlebars
- Websocket : socket.io

- Dependencias 
    - express : "^4.18.2"
    - express-handlebars: "^7.1.2"
    - express-validator : "^7.0.1"
    - socket.io: "^4.7.2"
    - socket.io-client: "^4.7.2"

## Funcionalidades agregadas a la primera entrega final (se hzo sobre el mismo codigo)

    - Se creo la vista home.handlebars para desplegar el listado de productos disponibles

    - Se creo la vista realTimeProducts.handlebas que trabaja con socket.io para desplegar los productos cuando se agrega un nuevo producto o se da de baja alguno.

## Funcionalidades pre-existentes (ya desarralladas para la primera pre-entrega final)

- El servidor app.js escucha peticiones en el puerto 8080.

- Los enrutadores products.routes.js y carts.routes.js  (importados ambos en app.js) poseen los siguientes servicios (para productos y carritos respectivamente) en las siguientes rutas 
    * Para Productos (en el router products.routes.js)
        + __GET__ = devuelve los objetos de los productos solicitados (todos o por id), en el caso de todos, se puede limitar la cantidad de productos solicitar por medio del parametro ? limit , en cuyo caso solo devolcera desde el principio hasta la cantidad solicitada. Si el id solicitado no existe, devuelve el error correspondiente
        + __POST__ = crea el producto con los datos enviados en el body de la requisición, siempre y cuando esten todos los datos requeridos con sus formatos pertienentes (caso contrario da un error explicando el motivo del rechazo). El id del producto es generado automaticamente a partir del ultimo elemento del array de productos. Si el campo status no es "false" (o no es informado), graba el valor por defecto "true".
        + __PUT__ = actualiza el contenido del producto requerido (si no existe devuelve un mensaje de error), solo los campos informados en el body del mensaje, siempre y cuando tengan el formato correcto (caso contrario devuelve el error correpondiente)
        + __DELETE__ = borra el producto cuya id fue informada por parametro (si no existiera , devuelve el mensaje de error correpondiente)
        
    * Para Carritos de compra (en el router carts.routes.js)
        + __GET__ = devuelve el objeto de la id del carrito solicitado (si no existiera, devuelve el mensaje de error correspondiente)
        + __POST (para crear un carrito nuevo)__ = graba un registro en el carrito de compras con el id del producto informado (siempre y cuando exista en el archivo de productos) con cantidad en 1. Se genera la id del carrito automaticamente a partir de la id del último elemento del archivo de carritos. 
        + __POST (para agregar un producto a un carrito existente)__ = debe informarse el id del carrito, busca el correpondiente carrito (en caso de no encontrarlo devuelve el error acorde), si esta todo ok , agrega el id del producto informado (siempra y cuando exista, sino devuelve un error), si el id del producto informado ya existe en el carrito, le agrega un 1 a la cantidad pre-existente en el archivo.

- El archivo de productos se llama productos.json, y el archivo de carritos se llama carrito.json. Ambos se crean (si no estan creados) en la misma ruta de la app.js.