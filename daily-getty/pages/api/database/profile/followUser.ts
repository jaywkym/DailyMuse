import { database } from "../../../../firebase/clientApp";
import { ref, onValue, set } from "firebase/database";
import type { NextApiRequest, NextApiResponse } from 'next';
import type { 
    DatabaseError, 
    DatabaseResponse,
    DatabaseFriends
}  from "../../../../types/FirebaseResponseTypes";

export default async function followUser (
    req: NextApiRequest,
    res: NextApiResponse<DatabaseResponse>
  ) {

    /* Only accept POST requests */
    if(req.method !== 'POST') {
        res.status(405).json(
            generateDbResponse(
                false, 
                generateError(405, 'Invalid request method')
            )
        )
        
        return;
    }

    const user_id = req.body.id;
    const friend_id = req.body.friend_id

    let friends_obj: DatabaseFriends = await getFollowingForUserById(user_id)

    if(!friends_obj)
        friends_obj = {
            id: user_id,
            followers: [],
            following: []
        } as DatabaseFriends

    if(!friends_obj.followers)
        friends_obj.followers = []

    if(!friends_obj.following)
        friends_obj.following = []

    if(friends_obj.following.includes(friend_id)) {
        res.status(200).json(
            generateDbResponse(
                false,
                generateError(-100, "Already following user")
            )
        )
        return;
    }

    friends_obj.following.push(friend_id)

    let new_friends_obj: DatabaseFriends = await getFollowingForUserById(friend_id);
    if(!new_friends_obj)
        new_friends_obj = {
            id: friend_id,
            followers: [],
            following: []
        } as DatabaseFriends

    if(!new_friends_obj.followers)
        new_friends_obj.followers = []

    if(!new_friends_obj.following)
        new_friends_obj.following = []

    if(new_friends_obj.followers.includes(user_id)) {
        res.status(200).json(
            generateDbResponse(
                false,
                generateError(-100, "Already following user")
            )
        )
        return;
    }

    new_friends_obj.followers.push(user_id)

    const db = database;

    set(ref(db, `friends/${user_id}`), friends_obj)
    set(ref(db, `friends/${friend_id}`), new_friends_obj)

    res.status(200).json(
        generateDbResponse(
            true,
            {} as DatabaseError
        )
    )
   
  
}

async function getFollowingForUserById(id: string): Promise<DatabaseFriends> {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id
        })
    }
    
    try {
        const resp = await fetch(`${process.env.NEXTAUTH_URL}api/database/profile/getFriends`, request)
        const friends_obj = await resp.json();
        return friends_obj.friends;
    } catch (err: any) {
        console.error(err)

        return {id: id, following: [], followers: []}
    }


}


function asyncOnValue(ref): Promise<DatabaseFriends> {

    return new Promise((resolve) => {
        onValue(ref, (snapshot) => {
            const data = snapshot.val();
            resolve(data as DatabaseFriends)
        })
    })
}

  /**
 * 
 * generateDbResponse: Generates an DatabaseResponse object from given inputs.
 * 
 * @param success Boolean to determine successful response
 * @param user A DatabaseUser object filled with user information
 * @param error A DatabaseError Object filled with error information
 * @returns DatabaseResponse
 */
function generateDbResponse(
    success: boolean, 
    error: DatabaseError): DatabaseResponse {
   
    return {
        success: success,
        error: error
    }
}

/* 
* generateError: Generates a DatabaseError object from the given parameters.
* 
* @param code Error status code
* @param message Error status text
* @param param Optional - Parameters given that led to error
* @param type Optionsl - Type of error that occured
* @returns DatabaseError 
*/
function generateError(code: number, message: string, param = '', type = ''): DatabaseError {
    return {
        code: code,
        message: message,
        param: param,
        type: type 
    }
}

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  }