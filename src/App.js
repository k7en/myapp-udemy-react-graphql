import React, { Component } from 'react'
import { ApolloProvider, Mutation,  Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'
import {Button, FormControl, TextField}  from '@material-ui/core';

// import { form } from 'zen-observable';

const StarButton = props => {
  const { node, query, first, last, before, after } = props
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  const starCount = totalCount === 1 ? `1 Star` : `${totalCount} Stars`
  const StarStatus = ({arStar}) => {
    return (
      <Button 
        onClick = {
          () => {
            arStar({
              variables: {input: {starrableId: node.id}}
            })
          }
        }
      >
      {starCount} | {viewerHasStarred ? 'Starred' : '-'}
      </Button>
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
  "query": "Deep learning"
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

        <div><h1>Hello,Github　GraphQLサーチ！</h1></div>
        <hr></hr>
        <FormControl>
          <TextField label="検索したいワード" margin="normal" value={query} onChange={this.handleChange} />
        </FormControl>
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
                        <Button variant="contained" color="primary"
                          onClick={this.goPrevious.bind(this, search)}
                        >
                        Previous
                        </Button>
                      :
                      null  
                    }
                    {
                      search.pageInfo.hasNextPage === true ? 
                        <Button variant="contained" color="primary"
                          onClick={this.goNext.bind(this, search)}
                        >
                        Next
                        </Button>
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