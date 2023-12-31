// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { 
    DalleError, 
    DalleResponse,
    ImageResponse,
    PromptResponse,
}  from "../../../../../types/DalleResponseTypes";
import type { 
   DatabasePost,
   DatabaseUserResponse,
   DatabaseUser
}  from "../../../../../types/FirebaseResponseTypes";


const DALLE_API_KEY = process.env.DALLE_API_KEY
const url = 'https://api.openai.com/v1/chat/completions'

/**
 * 
 * request_image_handler: A request handler for the endpoint /api/dalle/generate)image.
 *                        Attempts to generate an AI image of the given prompt. Returns
 *                        ImageResponse object on success with retrieved image with the
 *                        image attribute filled. On error returns Image Response object
 *                        with the error field filled.
 * 
 * @param req Request from client
 * @param res Response to client
 * @returns 
 */
export default async function request_image_handler(
  req: NextApiRequest,
  res: NextApiResponse<PromptResponse>
) {

        /* Only accept POST requests */
        if(req.method !== 'POST') {
            res.status(405).json(
                {success: false, prompts: []}
            )
            
            return;
        }

    const response = await requestToGPTAPI();
    if(!response.success) {
        res.status(200).json({error: true} as any as PromptResponse)
        return;
    } 

    const unifiedPrompts = response.choices[0].message.content

    const prompts = parseGPTContent(unifiedPrompts)

    res.status(200).json({success: true, prompts: prompts})
    
}

function parseGPTContent(unifiedContent: string) {

    const regex = /\d. .+/g;

    const prompts = []
    
    unifiedContent.match(regex).forEach(prompt => prompts.push(prompt.substring(3)))
   
    return prompts;
}

/**
 * 
 * reqeustDalleImages: Attempts to request AI images from DALLE given a user
 *                     prompt. Returns a DalleResponse object that contains
 *                     either an array of base 64 encoded images or an error.
 * 
 * @param prompt User text to be generated into an image
 * @param amount Amount of images to request from DALLE
 * @returns DalleResponse representing a successful or error response from DALLE
 */
async function requestToGPTAPI() {

    /* Generate dalle post request information */
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DALLE_API_KEY}`
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages' : [{'role': 'user', 'content': 'Generate me 5 random questions that I would ask someone. Each prompt can be answered in a few words. Each prompt consists of only a single question. Each prompt is different than each of the other prompts. Each prompts does not targeted any demographics or genders.'}]
        })
    }

    try {

        /* Fetch images from DALLE api */
        const resp = await fetch(url, request);
        const json = await resp.json()

        /* TODO - Handle error for successful request but invalid parameters (Invalid api key, invalid request...) */
        if(json.error) {
            json.error.success = false
            return json.error
        }

        json.success = true
        return json as DalleResponse

    /* Return error if an error occured fetching the DALLE api */
    } catch (err: any) {
        console.error(err)
        return generateError(1, 'unknown error');
    }
}

/**
 * 
 * generateImageResponse: Generates an ImageResponse object from given inputs.
 * 
 * @param success Boolean to determine successful response
 * @param amount Amount of images generated
 * @param image A DalleResponse Object filled with image information
 * @param error A DalleError Object filled with error information
 * @returns ImageResponse
 */
function generateImageResponse(success: boolean, 
                               amount : number, 
                               image = {} as DalleResponse, 
                               error = {} as DalleError): ImageResponse {
    return {
        success: success,
        amount: amount,
        image: image,
        error: error
    }
}

/**
 * 
 * generateError: Generates a DalleError object from the given parameters.
 * 
 * @param code Error status code
 * @param message Error status text
 * @param param Optional - Parameters given that led to error
 * @param type Optionsl - Type of error that occured
 * @returns DalleError 
 */
function generateError(code: number, message: string, param = '', type = ''): DalleError {
    return {
        code: code,
        message: message,
        param: param,
        type: type 
    }
}

  /**
 * addPostAPI: Takes in an incomplete user object and fills the rest of the
 *            information missing.
 * 
 * @param user An incomplete user object
 * @returns A complete user object with all parameters filled
 */
async function addPostApi(info: DatabasePost) {
    const request = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(info)
    }
    return new Promise((resolve, reject) => {
        fetch(`${process.env.NEXTAUTH_URL}api/database/posts/createPost`, request)
        .then(res => res.json())
        .then((resj) => {
            const res = resj as DatabaseUserResponse;
            resolve(res.success)
            
        })
        .catch(err => {
            console.error("ERR: Fetching in addPostApi")
            resolve(false)
        })
    })
}

  /**
 * pull_user: Takes in an incomplete user object and fills the rest of the
 *            information missing.
 * 
 * @param user An incomplete user object
 * @returns A complete user object with all parameters filled
 */
  async function pull_user(user: DatabaseUser): Promise<DatabaseUser> {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    }

    return new Promise((resolve, reject) => {
        fetch(`${process.env.NEXTAUTH_URL}api/database/profile/getUserAccount`, request)
        .then(res => res.json())
        .then((resj) => {
            const res = resj as DatabaseUserResponse;
            if(res.success)
                resolve(res.user)
            resolve(res.user)
            
        })
        .catch(err => {
            console.error("ERR: In pull_user fetching")
            reject(err);
        })
    })
} 

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  }