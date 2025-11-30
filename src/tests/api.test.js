const request = require("supertest");
const app = require("../api");
const bankService = require("../bankService");

describe("API - Testes de Integração", () => {
  // Antes de cada teste, resetar o estado
  beforeEach(() => {
    const users = require("../bankService").__getUsersForTesting();
    if (users) {
      users[0].balance = 1000;
      users[1].balance = 500;
    }
  });

  describe("POST /transfer - Cenário Positivo (Caminho Feliz)", () => {
    test("Deve retornar HTTP 200 para transferência válida", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 2,
        amount: 300,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Transferência realizada");
      expect(response.body.newSenderBalance).toBe(700);
    });

    test("Deve alterar os saldos corretamente após transferência", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 2,
        amount: 200,
      };

      await request(app).post("/transfer").send(transferData);

      expect(bankService.getBalance(1)).toBe(800);
      expect(bankService.getBalance(2)).toBe(700);
    });
  });

  describe("POST /transfer - Validação de Entrada (HTTP 400)", () => {
    test("Deve retornar HTTP 400 quando faltar campo senderId", async () => {
      const invalidData = {
        receiverId: 2,
        amount: 100,
      };

      const response = await request(app)
        .post("/transfer")
        .send(invalidData)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.error).toBe("Dados incompletos");
    });

    test("Deve retornar HTTP 400 quando faltar campo receiverId", async () => {
      const invalidData = {
        senderId: 1,
        amount: 100,
      };

      const response = await request(app)
        .post("/transfer")
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe("Dados incompletos");
    });

    test("Deve retornar HTTP 400 quando faltar campo amount", async () => {
      const invalidData = {
        senderId: 1,
        receiverId: 2,
      };

      const response = await request(app)
        .post("/transfer")
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe("Dados incompletos");
    });

    test("Deve retornar HTTP 400 quando enviar JSON vazio", async () => {
      const response = await request(app)
        .post("/transfer")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Dados incompletos");
    });
  });

  describe("POST /transfer - Erros de Lógica de Negócio (HTTP 500)", () => {
    test("Deve retornar HTTP 500 quando remetente não existe", async () => {
      const transferData = {
        senderId: 999,
        receiverId: 2,
        amount: 100,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(500);

      expect(response.body.error).toBe("Usuário não encontrado");
    });

    test("Deve retornar HTTP 500 quando destinatário não existe", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 999,
        amount: 100,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(500);

      expect(response.body.error).toBe("Usuário não encontrado");
    });

    test("Deve retornar HTTP 500 para saldo insuficiente", async () => {
      const transferData = {
        senderId: 2,
        receiverId: 1,
        amount: 600,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(500);

      expect(response.body.error).toContain("Saldo insuficiente");
    });

    test("Deve retornar HTTP 500 para valor zero", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 2,
        amount: 0,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(500);

      expect(response.body.error).toContain("Valor inválido");
    });

    test("Deve retornar HTTP 500 para valor negativo", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 2,
        amount: -50,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(500);

      expect(response.body.error).toContain("Valor inválido");
    });
  });

  describe("POST /transfer - Integridade dos Dados", () => {
    test("Não deve alterar saldos quando transferência falha", async () => {
      const initialBalanceAlice = bankService.getBalance(1);
      const initialBalanceBob = bankService.getBalance(2);

      await request(app).post("/transfer").send({
        senderId: 999,
        receiverId: 2,
        amount: 100,
      });

      expect(bankService.getBalance(1)).toBe(initialBalanceAlice);
      expect(bankService.getBalance(2)).toBe(initialBalanceBob);
    });
  });

  describe("POST /transfer - Casos Extremos", () => {
    test("Deve rejeitar quando senderId é string ao invés de número", async () => {
      const transferData = {
        senderId: "um",
        receiverId: 2,
        amount: 100,
      };

      const response = await request(app)
        .post("/transfer")
        .send(transferData)
        .expect(400);

      expect(response.body.error).toBe("Tipos de dados inválidos");
    });

    test("Deve rejeitar quando amount é string ao invés de número", async () => {
      const transferData = {
        senderId: 1,
        receiverId: 2,
        amount: "100",
      };

      const response = await request(app).post("/transfer").send(transferData);

      expect([400, 500]).toContain(response.status);
    });
  });
});
