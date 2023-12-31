import { useState } from "react";
import type { 
    DatabasePost, 
    DatabaseUserPostsResponse,
    DatabaseUserPostResponse,
    DatabaseResponse,
    UserLikesPost,
}  from "../../types/FirebaseResponseTypes";
import { StringDecoder } from "string_decoder";

/**
 * useAddPost: Saves a post to the database for the user. Only a single post
 *             can be added to the database for a user per day. Every additional
 *             post will update the previous post for the day.
 * 
 * @param user_id User who is adding the post
 * @param created Timestamp from Dalle when the image was created
 * @param url Url image string
 * @returns Void. Like my cold dead heart...
 */
export function useAddPost(user_id: string, created: number, url: string):
    [boolean, boolean, () => Promise<void>] {

        const [success, setSuccess] = useState(false)
        const [loading, setLoading] = useState(false)

        async function addPost() {

            if(loading) {
                setSuccess(false)
                return;
            }

            if(user_id === undefined ||
                created === undefined ||
                url === undefined) {

                setSuccess(false)
                return;
            
            }

            setLoading(true)

            const dbResponse = await requestCreatePost(user_id, created, url)

            setSuccess(dbResponse.success)

            setLoading(false);
            
        }

        return [success, loading, addPost];
}

/**
 * useGetAllPostsForUser: Hook to retrieve all posts given a user ID.
 * 
 * @param user_id ID of the user
 * @returns https://www.youtube.com/watch?v=dQw4w9WgXcQ
 */
export function useGetAllPostIds(user_id: string):
    [string[], boolean, boolean, () => Promise<void>] {

    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [post_ids, setPostIds] = useState([] as string[])
    
    async function getAllPostsIds() {

        if(loading) {
            setSuccess(false);
            return;
        }

        if(user_id === undefined ||
           user_id === '') {

            setSuccess(false);
            return;
        }

        setLoading(true);
        setSuccess(false);
        setPostIds([] as string[])
        
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user_id,
            })
        }
    
        fetch(`/api/database/posts/getAllPostsFromUser`, request)
        .then(res => res.json())
        .then(resj => {

            const res = resj as DatabaseUserPostsResponse

            if(!res.success) {
                setSuccess(false)
                return;
            }

            res.posts.forEach((post) => {
                setPostIds(posts => [...post_ids, post.id])
            })
            
            setSuccess(true)
           
        })
        .catch(err => setSuccess(false))
        .finally(() => setLoading(false))
    }

    return [post_ids, success, loading, getAllPostsIds];
}

/**
 * useGetPostForUser: Gets a specific post for a user given a user's id and 
 *                    a post ID.
 * 
 * @param user_id ID of user
 * @param post_id ID of post. Follows the format <YEAR>_<MONTH>_<DAY>
 * @returns <INSERT MONKEY EMOJI HERE>
 */
export function useGetPostForUser(user_id: string, post_id: string):
    [DatabasePost, boolean, boolean, () => Promise<void>] {

    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [post, setPost] = useState({} as DatabasePost)
    
    async function getPost() {

        if(loading) {
            setSuccess(false);
            return;
        }

        if(user_id === undefined ||
           post_id === undefined ||
           user_id === '' ||
           post_id === '') {

            setSuccess(false);
            return;
        }

        setLoading(true);
        setSuccess(false);
        
        const resp = await requestPostFromUserById(user_id, post_id);

        setSuccess(resp.success)

        if(resp.success)
            setPost(resp.post)

        setLoading(false)

    }

    return [post, success, loading, getPost];
}

export function useLikeImage(user_id: string, post_id: string, owner_id: string):
    [boolean, boolean, () => Promise<void>] {

    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function likeImage() {

        if(loading || !user_id || !post_id) {
            setSuccess(false)
            return;
        }

        if(user_id === '' || post_id === '') {
            setSuccess(false)
            return;
        }

        setLoading(true);
        setSuccess(false);

        const dbResponse = await requestLikePost(user_id, post_id, owner_id);

        setSuccess(dbResponse.success)
        setLoading(false)

    }

    return [success, loading, likeImage];

}

export function useUnlikeImage(user_id: string, post_id: string, owner_id: string):
    [boolean, boolean, () => Promise<void>] {

    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function unlikeImage() {

        if(loading || !user_id || !post_id) {
            setSuccess(false)
            return;
        }

        if(user_id === '' || post_id === '') {
            setSuccess(false)
            return;
        }

        setLoading(true);
        setSuccess(false);

        
        const dbResponse = await requestUnlikePost(user_id, post_id, owner_id);

        setSuccess(dbResponse.success)
        setLoading(false)

    }

    return [success, loading, unlikeImage];

}

export function useUserLikesImage(user_id: string, post_id: string, owner_id: string):
    [boolean, boolean, () => Promise<void>] {

    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function unlikeImage() {

        if(loading || !user_id || !post_id) {
            setSuccess(false)
            return;
        }

        if(user_id === '' || post_id === '') {
            setSuccess(false)
            return;
        }

        setLoading(true);
        setSuccess(false);

        const dbResponse = await requestUnlikePost(user_id, post_id, owner_id);

        setSuccess(dbResponse.success)
        setLoading(false)

    }

    return [success, loading, unlikeImage];

}

export async function requestLikePost(
    user_id: string,
    post_id: string,
    owner_id: string):
    Promise<DatabaseResponse> {

    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            post_id: post_id,
            owner_id: owner_id
        })
    }

    try {

        const resp = await fetch('/api/database/posts/likePost', request);
        return await resp.json() as DatabaseResponse;

    } catch (err: any) {
        console.error(err)
        return {success: false, error: err}
    }
}

export async function  requestUnlikePost(
    user_id: string,
    post_id: string,
    owner_id: string):
    Promise<DatabaseResponse> {

    

    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            post_id: post_id,
            owner_id: owner_id
        })
    }

    try {

        const resp = await fetch('/api/database/posts/unlikePost', request);
        return await resp.json() as DatabaseResponse;

    } catch (err: any) {
        console.error(err)
        return {success: false, error: err}
    }
}

export async function requestIfUserLikesPost(
    user_id: string,
    post_id: string,
    owner_id: string):
    Promise<boolean> {

    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
            post_id: post_id,
            owner_id: owner_id
        })
    }

    try {

        const resp = await fetch('/api/database/posts/userLikesPost', request);
        const json = await resp.json() as UserLikesPost;

        return json.success;


    } catch (err: any) {
        console.error(err)
        return false
    }
}

export async function requestCreatePost(
    user_id: string, 
    created: number,
    url: string):
    Promise<DatabaseResponse> {

    const request = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: user_id,
            image: {
                created: created,
                url: url
            }
        })
    }

    try {
        const resp = await fetch(`/api/database/posts/createPost`, request)
        
        return await resp.json() as DatabaseResponse;
   
    } catch (err: any) {
        return {success: false} as DatabaseResponse
    }
            
}

export async function requestPostFromUserById(user_id: string, post_id: string): Promise<DatabaseUserPostResponse> {

    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: user_id,
            post_id: post_id,
        })
    }

    try {
        const resp = await fetch(`/api/database/posts/getPostFromUser`, request);
        return await resp.json() as DatabaseUserPostResponse;
    } catch (err: any) {
        return {success: false} as DatabaseUserPostResponse;
    }

}

export function constructCurrentDateId() {
    const date  = new Date();
    const year  = date.getFullYear();
    const month = date.getMonth() + 1;
    const day   = date.getDate() ;
    
    return year + "_" + month + "_" + day;
}

export default function DoNothing() {
    console.log("Nothing")
}