const debug = require('debug')("bin:modules:choir");
const fetch = require('node-fetch');

const users = require(`${__dirname}/users`);

function createANewChoir(userId, choirName, choirDescription = ""){

    if(!userId){
        return Promise.reject('A userId was not passed to the function');
    }

    if(!choirName){
        return Promise.reject('A name for the choir was not passed');
    }

    const details = {
        name : choirName,
        description : choirDescription,
        createdByUserId : userId,
        createdByName : "N/A",
        choirType : "public"
    };

    return fetch(`${process.env.CHOIRLESS_API_ENDPOINT}/choir?apikey=${process.env.CHOIRLESS_API_KEY}`, { 
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(details)
        })
        .then(res => {
            if(res.ok){
                return res.json();
            } else {
                throw res;
            }
        })
        .catch(err => {
            debug("createANewChoir Err:", err);
            throw err;
        })
    ;

}

function getAKnownChoir(choirId){

    if(!choirId){
        return Promise.reject('No choirId was passed to function');
    }

    return fetch(`${process.env.CHOIRLESS_API_ENDPOINT}/choir?apikey=${process.env.CHOIRLESS_API_KEY}&choirId=${choirId}`)
        .then(res => {
            if(res.ok){
                return res.json();
            } else {
                throw res;
            }
        })
        .then(choirData => {
            return choirData.choir
        })
        .catch(err => {
            debug('getAKnownChoir Err:', err);
            throw err;
        })
    ;

}

function getAnExistingSongInAChoir(choirId, songId){
    return Promise.resolve();
}

function addANewSongToAChoir(data){

    if(!data.choirId || !data.userId || !data.name){
        return Promise.reject(`Missing parameters for song creation.\nRequired: "choirid", "userId", "name"\nRecieved: ${data.choirId}, ${data.userId}, ${data.name}`);
    } else {

        return fetch(`${process.env.CHOIRLESS_API_ENDPOINT}/choir/song?apikey=${process.env.CHOIRLESS_API_KEY}`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(data)
            })
            .then(res => {
                if(res.ok){
                    return res.json();
                } else {
                    throw res;
                }
            })
            .then(response => {
                return response.songId;
            })
            .catch(err => {
                debug('addANewSongToAChoir err:', err);
                throw err;
            })
        ;

    }


}

function getAllOfTheSongsForAChoir(choirId){

    if(!choirId){
        
        return Promise.reject(`No choirId was passed to function`);
    
    } else {

        return fetch(`${process.env.CHOIRLESS_API_ENDPOINT}/choir/songs?apikey=${process.env.CHOIRLESS_API_KEY}&choirId=${choirId}`)
            .then(res => {
                if(res.ok){
                    return res.json();
                } else {
                    throw res;
                }
            })
            .then(response => {
                return response.songs;
            })
            .catch(err => {
                debug('getAllOfTheSongsForAChoir err:', err);
                throw err;
            })
        ;

    }

}

function getAllOfTheMembersOfAChoir(choirId, getMemberDetails = false){
    
    if(!choirId){
        
        return Promise.reject('No choirId was passed.');

    } else {

        return fetch(`${process.env.CHOIRLESS_API_ENDPOINT}/choir/members?apikey=${process.env.CHOIRLESS_API_KEY}&choirId=${choirId}`)
            .then(res => {
                if(res.ok){
                    return res.json();
                } else {
                    throw res;
                }
            })
            .then(response => {

                if(!getMemberDetails){
                    return response.members;
                } else {

                    const userDetails = [];

                    response.members.forEach(memberRecord => {
                        userDetails.push(users.get.byID(memberRecord.userId));
                    })

                    return Promise.all(userDetails)
                        .then(retrievedUserDetails => {

                            return retrievedUserDetails.map( (details, idx) => {
                                details = details.user;
                                debug(details);
                                debug(response.members[idx]);

                                response.members[idx].info = details;

                                debug(response.members[idx]);

                                return response.members[idx];

                            });

                            process.exit();

                        })
                        .catch(err => {
                            debug('getMemberDetails err:', err);
                            throw err;
                        })
                    ;

                }

            })
            .catch(err => {
                debug('getAllOfTheMembersForAChoir err:', err);
                throw err;
            })
        ;

    }

}

module.exports = {
    create : createANewChoir,
    get : getAKnownChoir,
    songs : {
        get : getAnExistingSongInAChoir,
        add : addANewSongToAChoir,
        getAll : getAllOfTheSongsForAChoir
    },
    members : {
        get : getAllOfTheMembersOfAChoir
    }
};
