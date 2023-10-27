import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { prisma } from "./lib/db";
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
      type Mutation {
        createUser(
          firstName: String!
          lastName: String!
          email: String!
          password: String!
        ): Boolean
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello World!",
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              password,
              salt: "salt",
            },
          });
          return true;
        },
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
