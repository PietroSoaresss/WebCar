const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  telefone: { type: String },
  endereco: { type: String }
});

// Car schema
const carSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  ano: { type: Number, required: true },
  preco: { type: Number, required: true },
  cor: { type: String },
  km: { type: Number },
  combustivel: { type: String },
  imagem: { type: String },
  descricao: { type: String },
  categoria: { type: String, required: true },
});

// Export models
const Users = mongoose.model('Users', userSchema);
const Carros = mongoose.model('Carros', carSchema);

module.exports = { Users, Carros };
