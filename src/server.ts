import * as dotenv from "dotenv";
dotenv.config();

import app from "./routes/app";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
