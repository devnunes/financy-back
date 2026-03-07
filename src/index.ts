import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import fastifyApollo from '@as-integrations/fastify'
import fastify from 'fastify'
import { buildSchema } from 'type-graphql'
import { buildContext, type GraphQLContext } from './graphql/context'
import { resolvers } from './resolvers'

const app = fastify()

const schema = await buildSchema({
  resolvers,
  validate: false,
  emitSchemaFile: './schema.graphql',
})

const server = new ApolloServer<GraphQLContext>({
  schema,
  introspection: true,
})
await server.start()

app.register(fastifyApollo(server), {
  path: '/graphql',
  context: buildContext,
})
app.listen({ port: 4000 }, () => {
  console.log('Server is running on http://localhost:4000/graphql')
})
