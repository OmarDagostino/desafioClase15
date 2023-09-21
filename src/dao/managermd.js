import mongoose from 'mongoose';
import {cartModel} from './models/user.model.js';
import {productModel} from './models/user.model.js';
import {Router} from 'express';
import { body, validationResult } from 'express-validator';

const router = Router ()

// Conectar a la base de datos MongoDB Atlas
mongoose.connect('mongodb+srv://omardagostino:laly9853@cluster0.x1lr5sc.mongodb.net/ecommerce');

// Rutas para carritos

// GET para retornar un carrito por su ID
router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ cartId }).exec();
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// POST para agregar un producto a un carrito existente
router.post('/carts/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = 1;

    const cart = await cartModel.findOne({ cartId }).exec();

    if (!cart) {
      res.status(404).send('Carrito no encontrado');
      return;
    }

    // Añadir el producto al carrito
    const existingProduct = cart.products.find((p) => p.productId == productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// POST para crear un nuevo carrito
router.post('/carts/product/:pid', async (req, res) => {
    try {
      const productId = req.params.pid;
      const quantity = 1;
  
      // Verificar si el producto existe en la base de datos de productos
      const product = await productModel.findOne({ productId }).exec();
  
      if (!product) {
        res.status(404).send('Producto no encontrado');
        return;
      }
  
      // Encuentra el documento con el cartId más grande y proyecta solo el campo cartId
      const cartlast = await cartModel
        .findOne()
        .sort({ cartId: -1 }) // Ordena en orden descendente
        .select('cartId') // Proyecta solo el campo cartId
        .exec();
  
      // Si se encontró un documento, incrementa el cartId en 1; de lo contrario, usa 1 como valor inicial
      const nextcartId = cartlast ? cartlast.cartId + 1 : 1;
    
  
      // Crea el nuevo carrito con el cartId actualizado
      const newCart = new cartModel({
        cartId: nextcartId, 
        products: [{ productId, quantity }]
      });
     
      await newCart.save();
  
      res.status(201).json(newCart);
    } catch (error) {
      // Manejo adecuado de errores
      res.status(500).send('***Error en el servidor');
    }
  });
  

// Rutas para productos

// validaciones de los datos de los productos nuevos

  const validateAddProduct = [
      body('title').notEmpty().isString(),
      body('description').notEmpty().isString(),
      body('code').notEmpty().isString(),
      body('price').notEmpty().isNumeric(),
      body('stock').notEmpty().isNumeric(),
      body('category').notEmpty().isString(),
      body('status').optional().isBoolean(),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.setHeader('Content-Type','application/json');
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ];

// Validaciones de las datos de los productos a actualizar
  
  const validateUpdateProduct = [
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('code').optional().isString(),
    body('price').optional().isNumeric(),
    body('stock').optional().isNumeric(),
    body('category').optional().isString(),
    body('status').optional().isBoolean(),
     (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];


// GET para retornar varios productos o todos
router.get('/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productModel.find().limit(limit).exec();
    res.json(products);
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// GET para retornar un producto por su ID
router.get('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productModel.findOne({ productId }).exec();
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// POST para crear un nuevo producto
router.post('/products', validateAddProduct, async (req, res) => {
    try {
      const newProduct = req.body;
  
      // Verificar si el producto ya existe por su código
      const existingProduct = await productModel.findOne({ code: newProduct.code }).exec();
      if (existingProduct) {
        res.status(400).send('El producto con este código ya existe');
        return;
      }
  
      // Encuentra el documento con el productId más grande y proyecta solo el campo productId
      const productlast = await productModel
        .findOne()
        .sort({ productId: -1 }) // Ordena en orden descendente
        .select('productId') // Proyecta solo el campo productId
        .exec();
  
      // Si se encontró un documento, incrementa el productId en 1; de lo contrario, usa 1 como valor inicial
      const nextProductId = productlast ? productlast.productId + 1 : 1;
  
      // Crea el nuevo producto con el productId actualizado
      const product = new productModel({ ...newProduct, productId: nextProductId });
      await product.save();
  
      res.status(201).json(product);
    } catch (error) {
      // Manejo adecuado de errores
      res.status(500).send('Error en el servidor');
    }
  });
  

// PUT para actualizar un producto por su ID
router.put('/products/:pid', validateUpdateProduct, async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProduct = req.body;

    const product = await productModel.findOne({ productId }).exec();

    if (!product) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    // Actualizar el producto
    for (const key in updatedProduct) {
      if (updatedProduct.hasOwnProperty(key)) {
        product[key] = updatedProduct[key];
      }
    }

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
});

// DELETE para eliminar un producto por su ID
router.delete('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;

    const product = await productModel.findOne({ productId }).exec();

    if (!product) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    await product.deleteOne({ productId })
    res.status(200).send(`Producto con ID ${productId} eliminado`)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error en el servidor')
  }
});

export default router;
