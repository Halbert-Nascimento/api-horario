"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Adiciona uma rota para a raiz
app.get("/", (req, res) => {
    res.status(200).json({ message: "API Grade Horário está funcionando!" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res
        .status(statusCode)
        .json({ message: err.message || "Internal Server Error" });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: Number(process.env.DB_PORT),
        });
        console.log("Conexão com o banco de dados bem-sucedida!");
        connection.end();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Erro ao conectar ao banco de dados:", error.message);
        }
        else {
            console.error("Erro ao conectar ao banco de dados:", error);
        }
        process.exit(1);
    }
}))();
exports.default = app;
