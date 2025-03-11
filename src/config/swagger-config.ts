import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { Express } from "express";




// Load Swagger file
const swaggerDocument = YAML.load(path.join(__dirname, "../doc/swagger-doc.yaml.yaml"));


const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger docs available at http://localhost:8000/api-docs");
};

export default setupSwagger;