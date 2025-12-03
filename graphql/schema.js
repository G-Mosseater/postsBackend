import { buildSchema } from "graphql";

export const schema = buildSchema(/* GraphQL */ `
  type Posts {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String
    posts: [Posts]
  }
  type AuthData {
    token: String!
    userId: String!
  }
  type PostData {
    posts: [Posts!]
    totalPosts: Int!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }
  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }
  type RootQuery {
    login(email: String!, password: String!): AuthData
    posts(page: Int): PostData!
    post(id: ID!): Posts!
    user: User!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Posts!
    updatePost(id: ID!, postInput: PostInputData): Posts!
    deletePost(id: ID!): Boolean
    updateStatus(status: String!): User
  }
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
