import { database } from "../../../firebase/clientApp";
import { getDatabase, push, ref, set, get, child, onValue } from "firebase/database";
import type { NextApiRequest, NextApiResponse } from 'next';
import type { 
    DatabaseError, 
    DatabaseResponse,
    DatabaseImage,
    DatabaseImage2,
    DatabaseImageUpload
}  from "../../../types/FirebaseResponseTypes";

export default async function addPost (
    req: NextApiRequest,
    res: NextApiResponse<DatabaseResponse>
  ) {

    console.log("did i even ge tin")
     /* Only accept POST requests */
     if(req.method !== 'PUT') {
        res.status(405).json(
            generateDbResponse(
                false, 
                generateError(405, 'Invalid request method')
            )
        )
        
        return;
    }

    const data = req.body as DatabaseImageUpload;

    const db = database;

    //set(ref(db, 'posts/' + data.userId + '/' + data.creationDate), data)
    set(ref(db, 'posts/' + data.userId + '/' + data.creationDate), data)

    res.status(200).json(generateDbResponse(true, {} as DatabaseError));

}

/**
 * 
 * generateImageResponse: Generates an ImageResponse object from given inputs.
 * 
 * @param success Boolean to determine successful response
 * @param error A DatabaseError Object filled with error information
 * @returns ImageResponse
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