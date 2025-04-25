const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const carSchema = new mongoose.Schema({
    nome: String,
    marca: String,
    ano: Number,
    modelo: String,
    combustivel: String,
    cor: String,
    km: Number,
    preco: String,
    descricao: String,
    imagem: String,
       
})

const Carro = mongoose.model('Carro', carSchema);

const UsersSchema = new mongoose.Schema({

    nome: String,
    email: String,
    telefone: String,
    senha: String,
    endereco: String,

})

const Users = mongoose.model('Users', UsersSchema);  

module.exports = Carro;
module.exports = Users;