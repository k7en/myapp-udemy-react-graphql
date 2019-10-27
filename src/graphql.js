import gql from 'graphql-tag'

export const ME = gql`
  query me {
    user(login: "k7en") {
      name
      avatarUrl
    }
  }
`