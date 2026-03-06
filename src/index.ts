import express from 'express'
import { ApolloServer } from '@apollo/server'
import { buildSchema } from 'type-graphql'
import { expressMiddleware } from '@as-integrations/express5'
import { AuthResolver } from './resolvers/auth.resolver'


async function bootstrap() {
  const app = express()

  const schema = await buildSchema({
    resolvers: [AuthResolver],
    validate: false,
    emitSchemaFile: './schema.graphql',
  })

  const server = new ApolloServer({ schema })
  await server.start()

  app.use('/graphql', express.json(), expressMiddleware(server))
  app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000/graphql')
  })
}

bootstrap()