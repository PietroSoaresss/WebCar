const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Users, Carros } = require('./models.js');

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

// JWT Secret Key - In production, use environment variables
const JWT_SECRET = 'your-secure-jwt-secret-key';

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://pietro:91672133@webcars.6la2sna.mongodb.net/?retryWrites=true&w=majority&appName=webCars')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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
  try {
    const { email, senha } = req.body;
    
    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }
    
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta." });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ 
      message: "Login bem-sucedido!",
      token,
      user: {
        email: user.email,
        nome: user.nome
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

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/userRegister.html'));
});

// User registration route
app.post('/registrousuario', async (req, res) => {
  try {
    const { username, email, password, telefone, endereco, passwordC } = req.body;

    // Validate required fields
    if (!username || !email || !password || !passwordC) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    // Check if passwords match
    if (password !== passwordC) {
      return res.status(400).json({ message: "As senhas não coincidem." });
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new Users({
      nome: username,
      email,
      senha: hashedPassword,
      telefone,
      endereco
    });

    await user.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: "Usuário cadastrado com sucesso!",
      token,
      user: {
        email: user.email,
        nome: user.nome
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar usuário", error: error.message });
  }
});

app.get('/registrocarros', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/carSell.html'));
});

app.post('/registrocarros', verifyToken, upload.single('imagem'), async (req, res) => {
  try {
    const { marca, modelo, ano, preco, cor, km, combustivel, descricao, categoria } = req.body;
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
    res.status(500).json({ message: "Erro ao anunciar carro", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});