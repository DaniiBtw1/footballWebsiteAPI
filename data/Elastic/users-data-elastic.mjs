import { get, post, del } from './fetch-wrapper.mjs'; 
import errors from '../../common/errors.mjs';
import uriManager from './uri-manager.mjs';


export default function (uri_manager = 'users') {
const URI_MANAGER = uriManager(uri_manager)

    return {
        convertTokenToId,
        checkIfUserExists,
        getNumberUsers,
        addNewUser,
        getAllUsers,
        getUserElastic,
        changeUserInfo,
    }

function User(id, name, email, token, password) {  

    this.id = id
    this.name = name
    this.email = email
    this.token = token
    this.password = password
}

async function getAllUsers() {
    console.log("CHEGOU AQUI")
    const uri = URI_MANAGER.getAll();
    const response = await get(uri)
    return mapUserData(response);
}

async function getUserElastic(userId){
    console.log("CHEGOU ao getUser do elastic")
    return get(URI_MANAGER.get(userId))
    .then(user =>{
        console.log("user retornado do elastic", user)
        return user;
    })
}

function mapUserData(response) {
    console.log("entrou no mapUserData")
    if (!response.hits.hits) {
        console.log("errror hit.hit")
        throw new Error('Dados de usuários não encontrados na resposta');
    }
    console.log("passou no mapUserData")

    const res = response.hits.hits.map(hit => ({
        id: hit._source.id,
        name: hit._source.name,
        email: hit._source.email,
        token: hit._source.userToken,
        password: hit._source.password,
    }));
    console.log("res", res)
    return res;
}

async function convertTokenToId(token) { 
    
    let uri =  URI_MANAGER.getAll()
    const users = await get(uri)
    
    const allUsers = users.hits.hits.map(createUserFromElastic)
    console.log("allUsers teste", allUsers)
    
    const user = allUsers.find(u => u.token == token)
    console.log("users teste", user)
    
    if(user){
        console.log("encontrou um user")
    return user.id
    }
    return Promise.reject(errors.NOT_FOUND(`User with token ${userToken} not found`));

}

async function checkIfUserExists(userData){
    console.log("entrou aqui")
    let uri=  URI_MANAGER.getAll()
    const users = await get(uri)

    const allUsers = users.hits.hits.map(createUserFromElastic)
    console.log("ALLUSERS", allUsers)



    if(allUsers.find(u => u.name == userData.name &&  u.email == userData.email)){
        
    return undefined
    }
   
    return userData.name

}


async function getNumberUsers(){
    let uri = URI_MANAGER.getNumberUsers()
    return await get(uri).then(response => response.count)
}

async function addNewUser(userData){
   
    let uri = URI_MANAGER.create()
    const id = await getNumberUsers()
    let token = crypto.randomUUID()
    const user = {
        id: id + 1,
        name: userData.name,
        email: userData.email,
        userToken: token,
        password: userData.password
    }
    await post(uri,user)

    return user
}

async function changeUserInfo(userData, userId){
    console.log("entrou no changeUserInfo")
    const user = await getUserElastic(userId) 
    console.log("JFNPQOIFBAUFBAPFBAWFIAWB",user)
    const updatedUser = {
            id: user._source.id,
            name: userData.name,
            email: userData.email,
            userToken: user._source.userToken, 
            password: userData.password
    }
    console.log("updatedUser", updatedUser)
    
    return post(URI_MANAGER.update(userId), updatedUser)
}

function createUserFromElastic(d) {
    return new User(
        d._id, 
        d._source.name, 
        d._source.email, 
        d._source.userToken, 
        d._source.password,
    )
}

}
