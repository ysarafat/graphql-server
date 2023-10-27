import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  //   middleware
  app.use(express.json());

  // create GraphQL schema
  const gqlServer = new ApolloServer({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello World!",
      },
    },
  });

  // start the gql server
  await gqlServer.start();
  app.use("/graphql", expressMiddleware(gqlServer));
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

init();
