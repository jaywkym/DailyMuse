export type DatabaseError = {
    code: number,
    message: string,
    param: string,
    type: string 
}

export type DatabaseResponse = {
  success: boolean,
  error  : DatabaseError,
}

export type DatabaseUserResponse = {
  success: boolean,
  user   : DatabaseUser,
  error  : DatabaseError
}

export type DatabaseUsersResponse = {
  success: boolean,
  users   : DatabaseUser[],
  error  : DatabaseError
}

export type DatabaseUser = {
  id: string,
  name: string,
  email: string,
  image: string,
  googleId: string,
}

export type DatabaseImage = {
  id: string,
  userId: string,
  creationDate: number,
  userPrompt: string,
  givenPrompt: string,
  likes: number,
}

export type DatabaseFriendsResponse = {
  success: boolean,
  friends: DatabaseFriends,
  error: DatabaseError
}

export type DatabaseFriends = {
  id: string,
  followers: string[],
  following: string[]
}

export type DatabasePost = {
  id: string,
  user_id: string,
  userPrompt: string,
  givenPrompt: string,
  likes: string[],
  comments: CommentsResponse,
  image: {
    created: number,
    url: string,
  }
}

export type DatabaseUserPostsResponse = {
  success: boolean,
  posts : DatabasePost[],
  error: DatabaseError
}

export type DatabaseUserPostResponse = {
  success: boolean,
  post : DatabasePost,
  error: DatabaseError
}

export type PostExistence = {
  success: boolean,
  exist : boolean,
  error: DatabaseError
}

export type UserLikesPost = {
  success: boolean,
  likesPost: boolean,
  error: DatabaseError
}

export type LikesResponse = {
  likes: string [],
}

export type CommentsResponse = {
  comments: DatabaseComment[],
}

export type DatabaseComment = {
  time: string,
  user_id: string,
  username: string,
  comment: string,
}