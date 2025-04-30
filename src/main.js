const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Users, Carros } = require('./models.js'); // Ensure the exported names match

const storage = multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null,'uploads/');
  },
  filename:(req, file, cb)=>{
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({storage})

const app = express();

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variables for this

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User schema



// Connect to MongoDB
mongoose.connect('mongodb+srv://pietro:91672133@webcars.6la2sna.mongodb.net/?retryWrites=true&w=majority&appName=webCars')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
}


// Route to serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login POST route
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }
    
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta." });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );
    
    // Send token to client
    res.status(200).json({ 
      message: "Login bem-sucedido!",
      token: token,
      user: {
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login", error: error.message });
  }
});

// Check login status endpoint
app.get('/api/check-login', verifyToken, (req, res) => {
  res.json({ 
    isLoggedIn: true,
    user: {
      email: req.email
    }
  });
});

// Protected route example
app.get('/api/protected-data', verifyToken, (req, res) => {
  res.json({ message: "Esta é uma rota protegida", userId: req.userId });
});


app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/userRegister.html'));
});
//registro de usuario
app.post('/registrousuario', async (req, res) => {
  try {
      console.log("Request body:", req.body); // Log the request body for debugging

      const { username, email, password, telefone, endereco, passwordC } = req.body;

      if (!username || !email || !password || !passwordC) {
          console.log("Missing required fields");
          return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
          console.log("Email already registered:", email);
          return res.status(400).json({ message: "Este e-mail já está cadastrado." });
      }

      if (password !== passwordC) {
          console.log("Passwords do not match");
          return res.status(400).json({ message: "As senhas não coincidem." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new Users({
          nome: username, // Map username to nome in your schema
          email,
          senha: hashedPassword, // Map password to senha in your schema
          telefone,
          endereco
      });

      await user.save();
      console.log("User saved successfully:", user);
      res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
      console.error("Erro ao salvar o usuário:", error);
      res.status(500).json({
          message: "Erro ao cadastrar usuário",
          error: error.message
      });
  }
});

//registro de carros 
app.get('/registrocarros',verifyToken, (req, res)=> {
    
      res.sendFile(path.join(__dirname, 'public/carSell.html'));
    
});

app.post('/registrocarros', upload.single('imagem'), async (req, res) => {
    try {
       
        
    
        const { marca, modelo, ano, preco, cor, km, combustivel, descricao, categoria} = req.body;
        const imagem = req.file ? req.file.filename : null; 
          
        const cars = new Carros({
            marca,
            modelo,
            ano,
            preco,
            cor,
            km,
            combustivel,
            imagem, 
            descricao,
            categoria
        });
        
        await cars.save();
        res.status(201).json({ message: "Carro anunciado com sucesso!" });
    } catch (error) {
        console.error("Erro ao anunciar o carro:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ 
            message: "Erro ao anunciar carro", 
            error: error.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});