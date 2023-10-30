import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import express from "express";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/user";
async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  dotenv.config();
  //   middleware
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(await createApolloGraphqlServer(), {
      context: async ({ req }) => {
        const token = req.headers["authorization"];
        try {
          const user = UserService.decodeJWT(token as string);
          return { user };
        } catch (error) {
          return null;
        }
      },
    })
  );
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

init();
