const express = require("express");
const bankService = require("./bankService");
const app = express();

app.use(express.json());

app.post("/transfer", (req, res) => {
  try {
    const { senderId, receiverId, amount } = req.body;

    if (
      senderId === undefined ||
      receiverId === undefined ||
      amount === undefined
    ) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    if (
      typeof senderId !== "number" ||
      typeof receiverId !== "number" ||
      typeof amount !== "number"
    ) {
      return res.status(400).json({ error: "Tipos de dados inválidos" });
    }
    const result = bankService.transfer(senderId, receiverId, amount);
    res.status(200).json(result);
  } catch (error) {
    // Tratamento de erro genérico
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
