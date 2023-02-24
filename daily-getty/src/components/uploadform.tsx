import * as React from 'react';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, RadioGroup, TextField, Radio, Button, CircularProgress } from '@mui/material';
import { Container } from '@mui/system';
import Image from 'next/image';
import useImage from '@/pages/dalle/images';


const MuseForm = () => {

    const [value, setValue] = React.useState(''); //VALUE OF RADIO GROUP
    const [loading, setLoading] = React.useState(false); //Loading ARTWORK
    const [success, setSuccess] = React.useState(false); //SUCCESS IN GENERATING ARTWORK
    const timer = React.useRef<number>();

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };

    const buttonSx = {
        ...(success && {
            bgcolor: green[500],
            '&:hover': {
                bgcolor: green[700],
            },
        }),
    };

    /*
    const handleButtonClick = () => {
        if (!loading) {
            setSuccess(false);
            setLoading(true);
            timer.current = window.setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 2000);
        }
    };
    */

    const [prompt, setPrompt] = React.useState('');
    const [b64_image, error, loading1, generateImage] = useImage(prompt, "1");
    console.log(b64_image);

    return (
        <Box>
            <Box sx={{ m: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                <Container>
                    <Image alt="image" height={500} width={500} src={b64_image}></Image>
                </Container>
                <Container fixed>
                    <FormControl>
                        <FormLabel id="prompt" color='info'>Prompt of the Day</FormLabel>
                        <TextField id="prompt-answer" label="Answer the prompt!" variant="filled" placeholder="Enter Prompt" multiline rows={4} fullWidth required onChange={(e) => { setPrompt(e.target.value) }} />
                        <FormHelperText id="prompt-helper" color='info'>Limit your answer to 100 words or less.</FormHelperText>
                    </FormControl>
                </Container>
            </Box>
            <Box sx={{ m: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                <Container fixed>
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
                </Container>
            </Box>
            <Box sx={{ m: 5 }}>
                <Container fixed>
                    <Button variant="contained" color="success" onClick={generateImage}>
                        Generate Muse
                    </Button>
                    {loading && (
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
            </Box>
        </Box>
    );
};

export default MuseForm;
