require("dotenv").config();

//Validaciones crítica
if (!process.env.PORT) {
    throw new Error("El puerto no esta definido");
}

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL,
};

//Carga variables del .env
// Bloquea el sergidos si falta configuración
