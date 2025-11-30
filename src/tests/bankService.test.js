const bankService = require("../bankService");

describe("BankService - Testes Unitários", () => {
  // Antes de cada teste, resetar o estado dos usuários
  beforeEach(() => {
    const users = require("../bankService").__getUsersForTesting();
    if (users) {
      users[0].balance = 1000;
      users[1].balance = 500;
    }
  });

  describe("Cenário Positivo (Caminho Feliz)", () => {
    test("Deve realizar transferência válida com saldo suficiente", () => {
      // Arrange (Preparar)
      const senderId = 1;
      const receiverId = 2;
      const amount = 300;

      // Act (Agir)
      const result = bankService.transfer(senderId, receiverId, amount);

      // Assert (Verificar)
      expect(result.success).toBe(true);
      expect(result.message).toBe("Transferência realizada");
      expect(result.newSenderBalance).toBe(700);
      expect(bankService.getBalance(receiverId)).toBe(800);
    });

    test("Deve permitir transferir todo o saldo disponível", () => {
      const senderId = 2;
      const receiverId = 1;
      const amount = 500;

      const result = bankService.transfer(senderId, receiverId, amount);

      expect(result.success).toBe(true);
      expect(result.newSenderBalance).toBe(0);
      expect(bankService.getBalance(receiverId)).toBe(1500);
    });
  });

  describe("Cenário Negativo (Saldo Insuficiente)", () => {
    test("Deve rejeitar transferência quando saldo é insuficiente", () => {
      const senderId = 2;
      const receiverId = 1;
      const amount = 600;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Saldo insuficiente");
    });

    test("Deve manter saldos inalterados quando transferência falha por saldo", () => {
      const senderId = 2;
      const receiverId = 1;
      const initialSenderBalance = bankService.getBalance(senderId);
      const initialReceiverBalance = bankService.getBalance(receiverId);

      try {
        bankService.transfer(senderId, receiverId, 1000);
      } catch (error) {
        //mantem inalterados com saldo inicial
        expect(bankService.getBalance(senderId)).toBe(initialSenderBalance);
        expect(bankService.getBalance(receiverId)).toBe(initialReceiverBalance);
        expect(error.message).toBe("Saldo insuficiente");
      }
    });
  });

  describe("Teste de Limite (Boundary) - Valores Inválidos", () => {
    test("Deve rejeitar transferência com valor zero", () => {
      const senderId = 1;
      const receiverId = 2;
      const amount = 0;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Valor inválido");
    });

    test("Deve rejeitar transferência com valor negativo", () => {
      const senderId = 1;
      const receiverId = 2;
      const amount = -50;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Valor inválido");
    });

    test("Deve manter saldos inalterados quando transferência falha por valor inválido", () => {
      const senderId = 1;
      const receiverId = 2;
      const initialSenderBalance = bankService.getBalance(senderId);
      const initialReceiverBalance = bankService.getBalance(receiverId);

      try {
        bankService.transfer(senderId, receiverId, -100);
      } catch (error) {
        expect(bankService.getBalance(senderId)).toBe(initialSenderBalance);
        expect(bankService.getBalance(receiverId)).toBe(initialReceiverBalance);
        expect(error.message).toBe("Valor inválido");
      }
    });
  });

  describe("Teste de Entrada (Input) - Usuários Inexistentes", () => {
    test("Deve rejeitar quando remetente não existe", () => {
      const senderId = 999;
      const receiverId = 2;
      const amount = 100;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Usuário não encontrado");
    });

    test("Deve rejeitar quando destinatário não existe", () => {
      const senderId = 1;
      const receiverId = 999;
      const amount = 100;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Usuário não encontrado");
    });

    test("Deve rejeitar quando ambos os usuários não existem", () => {
      const senderId = 888;
      const receiverId = 999;
      const amount = 100;

      expect(() => {
        bankService.transfer(senderId, receiverId, amount);
      }).toThrow("Usuário não encontrado");
    });

    test("Deve manter saldos de outros usuários quando transferência falha", () => {
      const validUserId = 1;
      const initialBalance = bankService.getBalance(validUserId);

      try {
        bankService.transfer(999, 1, 100);
      } catch (error) {
        expect(bankService.getBalance(validUserId)).toBe(initialBalance);
        expect(error.message).toBe("Usuário não encontrado");
      }
    });
  });

  describe("Teste de getBalance", () => {
    test("Deve retornar o saldo correto para usuário existente", () => {
      const balance = bankService.getBalance(1);
      expect(balance).toBe(1000);
    });

    test("Deve retornar null para usuário inexistente", () => {
      const balance = bankService.getBalance(999);
      expect(balance).toBeNull();
    });
  });
});
