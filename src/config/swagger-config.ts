import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { Express } from "express";




// Load Swagger file
const swaggerDocument = YAML.load(path.join(__dirname, "../doc/swagger-doc.yaml"));


const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger docs available at https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/");
};

export default setupSwagger;