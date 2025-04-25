const express = require('express');
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');
const Carro = require('./models.js');
const Users = require('./models.js');
const bcrypt = require('bcrypt');


const uri = 'mongodb+srv://pietro:91672133@webcars.6la2sna.mongodb.net/?retryWrites=true&w=majority&appName=webCars'

mongoose.connect(uri, {
    useNewUrlParser: true, // Corrigido o nome da opção
    useUnifiedTopology: true // Essa opção ainda é válida, mas já é padrão
})
.then(() => console.log("MongoDB connected"))
.catch(error => console.error("MongoDB connection error:", error));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));

})

// Route to serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route to handle login form submission
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log(req.body);
    
    try {
        const user = await Users.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Usuário não encontrado." });
        }
        
        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Senha incorreta." });
        }
        
        res.status(200).json({ message: "Login bem-sucedido!" });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro ao fazer login", error: error.message });
    }
});







app.post('/registrousuario', async (req, res) => {
    try {
       
        
        // Correct variable names to match the form data
        const { username, email, password, telefone, endereco, passwordC} = req.body;
        
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Este e-mail já está cadastrado." });
        }
        
if(password !== passwordC) {
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
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar o usuário:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ 
            message: "Erro ao cadastrar usuário", 
            error: error.message 
        });
    }
});

app.listen(port, ()=>{

    console.log("server runnig")
})