require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// 4. Conecte-se ao banco de dados MongoDB usando o Mongoose.
mongoose.connect(process.env.CONEXAO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });




// 5. Defina o modelo de dados para o rastreamento.
const RastreioSchema = new mongoose.Schema({
  codigoRastreio: String,
  dataRecolha: Date,
  dataPrevisao: Date,
  entregue: Date,
});

const Rastreio = mongoose.model("Rastreio", RastreioSchema);


app.get('/', function(req, res) {
    res.render('home');
});

// 6. Crie rotas para /home, /admin2020 e /Rastreio.
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/rastreio", (req, res) => {
  res.render("rastreio");
});

app.post('/admin2020/delete/:id', (req, res) => {
    Rastreio.findByIdAndDelete(req.params.id)
      .then(() => res.redirect('/admin2020'))
      .catch(err => console.log(err));
  });


app.get('/admin2020', (req, res) => {
    Rastreio.find()
      .then(rastreios => res.render('admin2020', { rastreios }))
      .catch(err => console.log(err));
  });

  app.post('/admin2020', (req, res) => {
    const rastreio = new Rastreio({
      codigoRastreio: req.body.codigoRastreio,
      dataRecolha: req.body.dataRecolha,
      dataPrevisao: req.body.dataPrevisao,
      entregue: req.body.entregue  
    });
  
    rastreio.save()
      .then(() => res.redirect('/admin2020'))
      .catch(err => console.log(err));
  });

app.post("/rastreio", async (req, res) => {
  const rastreio = await Rastreio.findOne({
    codigoRastreio: req.body.codigoRastreio,
  });
  res.render("rastreio", { rastreio });
});

app.post("/rastreio", async (req, res) => {
    try {
      const rastreio = await Rastreio.findOne({
        codigoRastreio: req.body.codigoRastreio,
      });
  
      if (rastreio) {
        res.render("rastreio", { rastreio });
      } else {
        res.send('Nenhum rastreio encontrado com esse código');
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Ocorreu um erro ao buscar o rastreio');
    }
  });

app.listen(3000, () => console.log("Server running on port 3000"));
