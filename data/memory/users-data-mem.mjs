/**
 * Implements all Books data access, stored in memory 
 */

import errors from '../../common/errors.mjs'


let idNextUser = 0

function User(name, email, token = crypto.randomUUID()) {
    this.id = "HiZCDpQB7MKFTle4RlP7"
    this.name = name
    this.email = email
    this.userToken = token 
}

const USERS = [
    new User("User1", "User1@isel.pt", "cc"),
    new User("User2", "User2@isel.pt", "4d75a57d-eb8a-40f8-966f-a2591dd618b6"),
] 


export function convertTokenToId(userToken) {
    console.log("printar users data local", USERS)
    const user = USERS.find(u => u.userToken == userToken)
    if(!user) {
        return Promise.reject(errors.NOT_FOUND(`User with token ${userToken} not found`));
    } 
    return Promise.resolve(user.id)

}

export function checkIfUserExists(userData) {
    const user = USERS.find(u => u.name == userData.name || u.email == userData.email)
    if(!user) {
        return false
    } 
    return true
}

export function addNewUser(userData){
    const user = new User (userData.name, userData.email)
    USERS.push(user)
    return Promise.resolve(user)
}

