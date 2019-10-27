import React, { Component } from 'react'
import { ApolloProvider, Mutation,  Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

import { form } from 'zen-observable';

const StarButton = props => {
  const { node, query, first, last, before, after } = props
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  const starCount = totalCount === 1 ? `1 Star` : `${totalCount} Stars`
  const StarStatus = ({arStar}) => {
    return (
      <button
        onClick = {
          () => {
            arStar({
              variables: {input: {starrableId: node.id}}
            })
          }
        }
      >
      {starCount} | {viewerHasStarred ? 'Starred' : '-'}
      </button>
    )
  }
  return (
    <Mutation
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
      refetchQueries= {
        [
          {
            query: SEARCH_REPOSITORIES,
            variables: { query, first, last, before, after }
          }
        ]
      }
    >
      {
        arStar => <StarStatus arStar={arStar} />
      }
    </Mutation>
  )
}
const PER_PAGE=5

const DEFAULT_STATE = {
  "first": PER_PAGE,
  "after": null,
  "last": null,
  "before": null,
  "query": ""
}
class App extends Component {
  constructor(props){
    super(props)
    this.state = DEFAULT_STATE

    this.myRef = React.createRef()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {

    event.preventDefault()
    this.setState({
      query: this.myRef.current.value
    })
  }

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    })
  }
  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
    })
  }
  render() {
    const { query, first, last, before, after } = this.state
    console.log({query})

    return ( 
      <ApolloProvider client={client}>
        <div>Hello, GraphQL</div>
        <form onSubmit={this.handleSubmit}>
          <input ref={this.myRef} />
          <input type="submit" value="Submit" />
        </form>
        <Query
          query={ SEARCH_REPOSITORIES }
          variables={{ query, first, last, before, after }}
          >
          {
            ({ loading, error, data }) => {
              if (loading) return 'Loading...'
              if (error) return `Error! ${error.message}`
              console.log({data})
              
              const search = data.search
              const repositoryCount = search.repositoryCount
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
              const title = `Github Repo Search Result -  ${ repositoryCount} ${ repositoryUnit }`
              return (
                <React.Fragment>
                  <h2>{title}</h2>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node
                        return (
                        <li key={node.id}>
                          <a href={node.url} rel="noopener noreferrer" target="_blank">{node.name}</a>
                          &nbsp;
                          <StarButton node={node} {...{ query, first, last, before, after }}/>
                        </li>
                        )
                      })
                    }
                  </ul>
                  {
                      search.pageInfo.hasPreviousPage === true ? 
                        <button
                          onClick={this.goPrevious.bind(this, search)}
                        >
                        Previous
                        </button>
                      :
                      null  
                    }
                    {
                      search.pageInfo.hasNextPage === true ? 
                        <button
                          onClick={this.goNext.bind(this, search)}
                        >
                        Next
                        </button>
                      :
                      null  
                    }
                </React.Fragment>
              )
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App