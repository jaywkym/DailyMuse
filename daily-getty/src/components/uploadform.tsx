import * as React from 'react';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import { useState, useEffect, useMemo } from 'react';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, RadioGroup, TextField, Radio, Button, CircularProgress, ImageList } from '@mui/material';
import { Container } from '@mui/system';
import { Modal, Typography } from '@mui/material';
import Image from 'next/image';
import useImage from '@/pages/dalle/images';
import useAddPost from '@/pages/database/createPostFront';
import Loading from './loading';
import { useSession } from 'next-auth/react'
import type {
    DatabasePost,
} from "../../types/FirebaseResponseTypes";


const MuseForm = () => {

    const ref1 = React.createRef();
    const ref2 = React.createRef();
    const ref3 = React.createRef();

    const [value, setValue] = React.useState(''); //VALUE OF RADIO GROUP
    const [generate, setGenerate] = React.useState(false); //SUCCESS IN GENERATING ARTWORK

    const [test1, settest1] = useState('')
    const [test2, settest2] = useState('')
    const [prompt, setPrompt] = React.useState('');

    const timer = React.useRef<number>();

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);


    //ART STYLE FORM
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };

    //MODAL STATES
    const handleButtonClick = () => {
        setGenerate(true);
    };

    const handleClose = () => {
        setGenerate(false);
    };

    useMemo(() => {
        console.log("CCLICKED")
    }, [test1, test2])

    //DallE API CALL
    const [b64_image1, b64_image2, b64_image3, created1, created2, created3, error, loadingImage, generateImage] = useImage(prompt, "3"); //INCORPORATE ERROR HANDLING
    const { data: session, status } = useSession()
    let user_id = status === 'authenticated' ? (session.user as any).id : "";
    let createdStatic;
    const [b64, setB64] = React.useState('');
    const [created, setCreated] = React.useState();
    const [generatePost] = useAddPost(b64, user_id, prompt, created);
    console.log(loadingImage);
    console.log(error)


    //IMAGE SELECTION
    const imageClick = (event) => {
        let splitB64 = event.target.src.split(',')[1];
        setB64(splitB64);

        createdStatic = event.target.id;
        setCreated(createdStatic);

        const uploadInfo: DatabasePost = {
            id: null,
            user_id: user_id,
            userPrompt: prompt,
            givenPrompt: null,
            likes: 0,
            image: {
                created: createdStatic as Number,
                b64: splitB64 as String
            } as any
        }

        const request = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadInfo)
        }

        fetch('/api/database/posts/createPost', request)
            .then(res => res.json())
            .then(resj => {
                console.log("good!")
            })

    };

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        pt: 2,
        px: 4,
        pb: 3,
    };

    //QUESTION PROMPT GENERATE
    const allPrompts = ["Where do you see yourself in 5 years?",
        "What brings you happiness?",
        "Favorite memory?",
        "Most recently memorable dream?",
        "Perfect Day?",
        "Mood today?",
        "Something you’re looking forward to ?",
        "Dream vacation ?",
        "Spirit Animal ?",
        "What's your worst nightmare?",
        "You're childhood home looks like...",
        "The last dream you remember looked like...",
        "How you remember your 5 year old self looks like...",
        "Your ideal pet...there are no limits here...",
        "What are you going to look like in 30 - 50 years ?",
        "What do you think the future looks like ?",
        "Your favorite time period ? Paint a picture with your words...",
        "Your favorite super hero is...",
        "Something that makes you sad...]"];
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    const question = allPrompts[randomIndex];
    console.log(question);

    return (
        <Container fixed>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                <Box sx={{ m: 5 }}>
                    <Typography variant="h3">Prompt of the Day</Typography>
                </Box>
                <Box>
                    <Typography variant="h6">{question}</Typography>
                </Box>
            </Box>
            <Box sx={{ m: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignContent: 'space-between', alignItems: 'space-between', p: 5 }}>
                <FormControl>
                    <FormLabel id="prompt" color='info'>Prompt of the Day</FormLabel>
                    <TextField id="prompt-answer" label="Answer the prompt!" variant="filled" placeholder="Enter Prompt" multiline rows={4} fullWidth required onChange={(e) => { setPrompt(e.target.value) }} />
                    <FormHelperText id="prompt-helper" color='info'>Limit your answer to 100 words or less.</FormHelperText>
                </FormControl>
                <FormControl>
                    <FormLabel id="art-style">Choose an art style</FormLabel>
                    <RadioGroup
                        aria-labelledby="art-style-radio"
                        name="art-style-radio"
                        value={value}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="realism" control={<Radio />} label="Realism" />
                        <FormControlLabel value="animated" control={<Radio />} label="Animated" />
                        <FormControlLabel value="pop art" control={<Radio />} label="Pop Art" />
                        <FormControlLabel value="abstract" control={<Radio />} label="Abstract" />
                        <FormControlLabel value="retro" control={<Radio />} label="Retro" />
                    </RadioGroup>
                </FormControl>
            </Box>

            <Box sx={{ m: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                {loadingImage ?
                    <Loading>
                        <Image id="1" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <Image id={created1} alt="image" height={500} width={500} src={b64_image1} onClick={imageClick}></Image>
                }
                {loadingImage ?
                    <Loading>
                        <Image id="2" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <Image id={created2} alt="image" height={500} width={500} src={b64_image2} onClick={imageClick}></Image>
                }
                {loadingImage ?
                    <Loading>
                        <Image id="3" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <div>
                        <Image id={created3} alt="image" height={500} width={500} src={b64_image3} onClick={imageClick}></Image>
                    </div>
                }
            </Box>

            <Box sx={{ m: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                <Button variant="contained" color="success" onClick={generateImage}>
                    Generate Muse
                </Button>
            </Box>

            {/*IMAGE GENERATED MODAL 
                    */}
            <Modal
                open={generate}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Your Muse of the Day
                    </Typography>
                    <Container>
                        {/* 
                        <Box sx={{ m: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>
                {loadingImage ?
                    <Loading>
                        <Image id="1" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <Image id={created1} alt="image" height={500} width={500} src={b64_image1} onClick={imageClick}></Image>
                }
                {loadingImage ?
                    <Loading>
                        <Image id="2" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <Image id={created2} alt="image" height={500} width={500} src={b64_image2} onClick={imageClick}></Image>
                }
                {loadingImage ?
                    <Loading>
                        <Image id="3" alt="image" height={500} width={500} src='/placeholder.png'></Image>
                    </Loading>
                    :
                    <div>
                        <Image id={created3} alt="image" height={500} width={500} src={b64_image3} onClick={imageClick}></Image>
                    </div>
                }
            </Box>
            */}
                    </Container>
                </Box>
            </Modal>
            {loadingImage && (
                <CircularProgress
                    size={68}
                    sx={{
                        color: green[500],
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        zIndex: 1,
                    }}
                />
            )}
        </Container>
    );
};

export default MuseForm;
