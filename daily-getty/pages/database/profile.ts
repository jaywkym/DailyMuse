import { useState } from "react";
import type { 
    DatabaseFriendsResponse,
    DatabaseResponse,
    DatabaseUser,
    DatabaseUserResponse
}  from "../../types/FirebaseResponseTypes";

/**
 * useFriends: Hook to retreive all the friends of a user given an ID.
 * 
 * @param user_id ID of user to retrieve all friends    
 * @returns Nothing... Why does everyone always expect me to return something.
 */
export function useFollowing(user_id: string):
    [string[], boolean, () => Promise<void>]{
    
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);

    async function pullFollowing() {

        if(loading)
            return;

        if(user_id === undefined)
            return;

        setLoading(true);

        const dbFriendsResponse = await requestFollowingForUser(user_id);

       setLoading(false);
    }

    return [following, loading, pullFollowing]
}

/**
 * useFriends: Hook to retreive all the friends of a user given an ID.
 * 
 * @param user_id ID of user to retrieve all friends    
 * @returns Nothing... Why does everyone always expect me to return something.
 */
export function useFollowers(user_id: string):
    [string[], boolean, () => Promise<void>]{
    
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(false);

    async function pullFollowers() {

        if(loading)
            return;

        if(user_id === undefined)
            return;

        setLoading(true);

        const dbFriendsResponse = await requestFriendsForUser(user_id);

        if(dbFriendsResponse.success) {
            if(dbFriendsResponse.friends)
                if(dbFriendsResponse.friends.followers)
                    setFollowers(dbFriendsResponse.friends.followers)
            else {
                setFollowers([]);
            }
        } else {
            setFollowers([])
        }

       setLoading(false);
    }

    return [followers, loading, pullFollowers]
}

/**
 * useAddFriend: Hook to add friend to user's friends list.
 * 
 * @param user_id User which friend will be added to
 * @param friend_id ID of friend to add to user's friends list
 * @returns Still nothing LOL
 */
export function useFollowUser(user_id: string, friend_id: string):
    [boolean, boolean, () => Promise<void>] {

        const [success, setSuccess] = useState(false);
        const [loading, setLoading] = useState(false);

        async function followUser() {
            if(loading)
                return;

            setLoading(true);
            setSuccess(false);

            const dbResponse = await requestFollowUser(user_id, friend_id);

            setSuccess(dbResponse.success)

            setLoading(false)
            
        }

    return [success, loading, followUser];
}

export function useUnfollowUser(user_id: string, friend_id: string):
    [boolean, boolean, () => Promise<void>] {

        const [success, setSuccess] = useState(false);
        const [loading, setLoading] = useState(false);

        async function unfollowUser() {

            if(loading)
                return;

            setLoading(true);
            setSuccess(false);

            const dbResponse = await requestUnfollowUser(user_id, friend_id);

            setSuccess(dbResponse.success)

            setLoading(false)
            
        }

    return [success, loading, unfollowUser];
}

export async function requestUnfollowUser(user_id: string, friend_id: string): Promise<DatabaseResponse> {

    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user_id,
            friend_id: friend_id
        })
    }
    
    try {
        const resp = await fetch(`/api/database/profile/unfollowUser`, request)
        return await resp.json() as DatabaseResponse;
    } catch (err: any) {
        return {success: false} as DatabaseResponse;
    }

}

export async function requestFollowingForUser(user_id: string): Promise<String[]> {
    const friends = await requestFriendsForUser(user_id) as DatabaseFriendsResponse

    if(!friends.success)
        return [];

    if(!friends.friends)
        return [];

    return friends.friends.following;
    
}

export async function requestFriendsForUser(user_id: string): Promise<DatabaseFriendsResponse> {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user_id,
        })
    }

    try {
        const resp = await fetch(`/api/database/profile/getFriends`, request)
        const json = await resp.json() as DatabaseFriendsResponse
        if(!json.friends.followers)
            json.friends.followers = [];
        
        if(!json.friends.following)
            json.friends.following = [];

        return json;
    } catch (err: any) {
        return {success: false} as DatabaseFriendsResponse
    }

}

export async function requestFollowUser(user_id: string, friend_id: string): Promise<DatabaseResponse> {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user_id,
            friend_id: friend_id
        })
    }

    try {
        const resp = await fetch(`/api/database/profile/followUser`, request);
        return await resp.json() as DatabaseResponse;
    } catch (err: any) {
        return {success: false} as DatabaseResponse;
    }

}

/**
 * pull_user: Takes in an incomplete user object and fills the rest of the
 *            information missing.
 * 
 * @param user An incomplete user object
 * @returns A complete user object with all parameters filled
 */
export async function pull_user(user: DatabaseUser): Promise<DatabaseUser> {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    }

    try {
        const resp = await fetch(`/api/database/profile/getUserAccount`, request)
        const json = await resp.json() as DatabaseUserResponse;
        if(json.error)
            return json.user;

        return {} as DatabaseUser;
    } catch (err: any) {

        console.error("ERR in pull_user")
        console.error(err)

        return {} as DatabaseUser
    }

}

export default function DoNothing() {
    console.log("Nothing")
}