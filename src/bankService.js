// Simulação de Banco de Dados em Memória
const users = [
  { id: 1, name: "Alice", balance: 1000 },
  { id: 2, name: "Bob", balance: 500 },
];

const bankService = {
  getBalance: (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.balance : null;
  },

  transfer: (senderId, receiverId, amount) => {
    const sender = users.find((u) => u.id === senderId);
    const receiver = users.find((u) => u.id === receiverId);

    // Validacao de usuario
    if (!sender || !receiver) {
      throw new Error("Usuário não encontrado");
    }

    // Validacao de valor válido/inválido
    if (amount <= 0) {
      throw new Error("Valor inválido");
    }

    // Validacao de saldo suficiente
    if (sender.balance < amount) {
      throw new Error("Saldo insuficiente");
    }

    sender.balance -= amount;
    receiver.balance += amount;

    return {
      success: true,
      newSenderBalance: sender.balance,
      message: "Transferência realizada",
    };
  },
  __getUsersForTesting: () => {
    return users;
  },
};

module.exports = bankService;
