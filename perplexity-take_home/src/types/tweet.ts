export interface Tweet {
    id: string
    text: string
    author: {
      name: string
      username: string
    }
    created_at: string
  }
  
  export interface Source {
    url: string
    tweet: Tweet
  }