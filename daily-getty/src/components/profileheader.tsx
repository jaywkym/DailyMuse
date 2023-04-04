import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { DatabaseFriends, DatabaseUser } from '@/types/FirebaseResponseTypes';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { Avatar, Chip, Stack } from '@mui/material';
import { Container } from '@mui/system';
import { requestFriendsForUser, useFollowUser, useFollowers, useFollowing, useUnfollowUser } from '@/pages/database/profile';
import { Button, Modal, Grid, List } from '@mui/material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ProfileHeader = ({ user, session }) => {

    const session_user: DatabaseUser = session ? session.user as DatabaseUser : {} as DatabaseUser;

    const [followers, setFollowers] = useState([] as string[]);
    const [following, setFollowing] = useState([] as string[]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    const [sFollowing, sFollowingLoading, sGetFollowing] = useFollowing(user.id)
    const [followSuccess, followLoading, followUser] = useFollowUser(session_user.id, user.id)
    const [unfollowSuccess, unfollowLoading, unfollowUser] = useUnfollowUser(session_user.id, user.id);
    const [isFollowing, setIsFriend] = useState(false)

   // sGetFollowing();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const selfAccount = session_user.id === user.id
    const userNeedsUpdate = user.id === undefined;

    useEffect(() => {

        if(userNeedsUpdate)
            return;

        async function pullFriends() {

            setLoadingFriends(true);

            const dbFriends = await requestFriendsForUser(user.id)
            
            if(!dbFriends.success)
                return;

            setFollowers(dbFriends.friends.followers);
            setFollowing(dbFriends.friends.following)
            setLoadingFriends(false)

        }

        pullFriends()
        .catch(console.error)

    }, [userNeedsUpdate, followLoading, unfollowLoading])


    // console.log({
    //     user_id: user.id,
    //     userNeedsUpdate: userNeedsUpdate,
    //     friendsLoading: loadingFriends,
    //     followers: followers,
    //     following: following
    // })

    useEffect(() => {

        async function checkFriendship() {

            let foundFriend = false;
            // setLoadingFriends(true);

            const dbFriends = await requestFriendsForUser(user.id)
            
            console.log("session id is")
            console.log( session_user.id )
            
            if(dbFriends)
            if(dbFriends.friends)
            if(dbFriends.friends.followers)

            dbFriends.friends.followers.forEach(friend => {    
                if (friend == session_user.id ||
                    friend == user.id) {
                    foundFriend = true
                } 
            });
            console.log("im inside the use effect:")
            console.log(foundFriend);
            setIsFriend(foundFriend)

        }

        // if (!sFollowing)
        //     return;

        //console.log(sFollowing);
        // sFollowing.forEach(friend => {

        //     if (friend == session_user.id ||
        //         friend == user.id) {
        //         foundFriend = true
        //         return;
        //     }

        // })

        checkFriendship()
        .catch(console.error)

    }, [following, followers, sFollowing, isFollowing])

    return (
        <Container 
            sx={{
                backgroundColor: 'common.blueScheme.foreground', 
                margin: 0, 
                padding: 5,
                boxShadow: '5px 5px 5px 3px'
            }}
            
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                <Box sx={{ m: 0 }}>
                    <Typography 
                        sx={{fontSize: {xs: 25, sm: 40, md: 50, lg: 60}}}
                        color={'common.blueScheme.notWhite'}
                        paddingBottom={3}
                    >
                        Hey, {user.name}!
                    </Typography>
                </Box>
                <Box sx={{ marginBottom: 5 }}>
                    <Avatar
                        alt="placeholder"
                        src={user.image}
                        sx={{ width: 128, height: 128 }}
                    />
                </Box>
                <Stack direction="row" spacing={1}>
                    {!loadingFriends && <Chip label={`Following ${following ? following.length : 0}`} sx={{backgroundColor: 'common.blueScheme.background', color: 'common.blueScheme.notWhite', border: '1px solid #222'}}/>}
                    {!loadingFriends && <Chip label={`Followers ${followers ? followers.length : 0}`} sx={{backgroundColor: 'common.blueScheme.background', color: 'common.blueScheme.notWhite', border: '1px solid #222'}}/>}
                    {!selfAccount && <Chip label={isFollowing ? 'unfollow' : 'follow'} variant="outlined" sx={{backgroundColor: 'common.blueScheme.background', color: 'common.blueScheme.notWhite', border: '1px solid #222'}} onClick={() => {
                        if (!isFollowing)
                            followUser()
                        else
                            unfollowUser()
    
                             // TODO - Remove as following

                                // .then(sGetFollowing)
                                // .then(getFollowers)
                    }} />}
                </Stack>
                {/*
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <List>
                            {sFollowing.map((friend) => (
                                <li key={friend}>
                                    <Grid container alignItems="center">
                                        <Grid item sx={{ display: 'flex', width: 44 }}>
                                            <img src={user.image} width={'50%'} />
                                        </Grid>
                                        <Grid item sx={{ width: 'calc(100% - 44px)' }}>
                                            <Box
                                                key={user.id}
                                                component="span"
                                                sx={{ fontWeight: 'bold', color: 'black' }}
                                            >
                                                <p>{user.name}</p>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </li>))}
                        </List>
                    </Box>
                            </Modal> */}
                            
            </Box> 
        </Container>
    );
};

export default ProfileHeader;


// {!loading &&
//     <Button onClick={handleOpen}>
//         <Chip label={`Following ${friends ? friends.length : 0}`} />
//     </Button>}
// {!isFriend && <Chip label="Follow" variant="outlined" onClick={() => {
//     addFriend()
//         .then(getFriends)