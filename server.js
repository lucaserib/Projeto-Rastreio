require("dotenv").config();
const { escapeXML } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");

app.use(
  session({
    secret: "your secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.CONEXAO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const RastreioSchema = new mongoose.Schema({
  codigoRastreio: String,
  inicioPrestacao: String,
  terminoPrestacao: String,
  dataRecolha: Date,
  dataPrevisao: Date,
  entregue: Date,
});

const Rastreio = mongoose.model("Rastreio", RastreioSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/home", (req, res) => {
  const error = req.session.error;
  req.session.error = null; // limpar a mensagem de erro
  res.render("home", { error });
});

app.get("/rastreio", (req, res) => {
  res.render("rastreio", { error: req.flash("error"), rastreio: null });
});

app.post("/admin2020/delete/:id", (req, res) => {
  Rastreio.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/admin2020"))
    .catch((err) => console.log(err));
});

app.get("/admin2020", (req, res) => {
  Rastreio.find()
    .then((rastreios) => res.render("admin2020", { rastreios }))
    .catch((err) => console.log(err));
});

app.post("/admin2020", (req, res) => {
  const rastreio = new Rastreio({
    inicioPrestacao: req.body.inicioPrestacao,
    terminoPrestacao: req.body.terminoPrestacao,
    codigoRastreio: req.body.codigoRastreio,
    dataRecolha: req.body.dataRecolha,
    dataPrevisao: req.body.dataPrevisao,
    entregue: req.body.entregue,
  });

  rastreio
    .save()
    .then(() => res.redirect("/admin2020"))
    .catch((err) => console.log(err));
});

app.post("/rastreio", async (req, res) => {
  const rastreio = await Rastreio.findOne({
    codigoRastreio: req.body.codigoRastreio,
  });

  if (!rastreio) {
    req.session.error = "Código de rastreio inválido";
    return res.redirect("/home");
  }

  res.render("rastreio", { rastreio });
});

// Rota para carregar o formulário de edição
app.get("/admin2020/edit/:id", async (req, res) => {
  try {
    const rastreio = await Rastreio.findById(req.params.id);
    if (!rastreio) {
      return res.status(404).send("Rastreio não encontrado");
    }
    res.render("editRastreio", { rastreio });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar o rastreio");
  }
});

// Rota para atualizar o valor do campo 'entregue'
app.post("/admin2020/update/:id", async (req, res) => {
  try {
    const { entregue } = req.body;
    await Rastreio.findByIdAndUpdate(req.params.id, {
      entregue: entregue || null,
    });
    res.redirect("/admin2020");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar o rastreio");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
