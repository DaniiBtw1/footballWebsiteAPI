// Module responsibilities
// This file contains all HTTP Web Site handling functions.
//

import express from 'express';
import errosMapping from './application-to-http-erros.mjs';
//import * as services from './foccacia-services.mjs';  

const GROUPS = '/groups'
const GROUP = `${GROUPS}/:groupID`
const TEAMS = '/teams'

const RESOURCES = {
GROUPS : GROUPS,
GROUP : GROUP,
MENU : '/menu',
ADDGROUP : `${GROUPS}/new`,
DELETEGROUP : `${GROUP}/delete`,
EDIT : `${GROUP}/edit`,
TEAMDELETE : `${GROUP}/:teamName/delete`,
ADDTEAM : `${GROUP}/add`,
GET_REST_INFO : `${GROUP}/selectRestInfo`,
VERIFY_IF_CAN_ADD_TEAM : `${GROUP}/added`,

TEAMS : TEAMS,
TEAM_BY_TEAMNAME : `${TEAMS}/:teamName`,

USER_INFO : '/myUserInfo',
VALIDATE_USER_CHANGES : '/validateUserChanges'
}

export default function(services) {
    const router = express.Router()

    console.log("WEB-SITE")

    router.get('/menu', (req, rsp) =>{
        if(req.user == undefined){
            rsp.render('menu', { user: null })
        }
        else
            rsp.render('menu', { user: req.user.username })
    });

    router.get(RESOURCES.GROUPS, handlerWrapper(getGroups))

    router.get(RESOURCES.ADDGROUP, handlerWrapper(createGroupForm))
    router.post(RESOURCES.ADDGROUP, handlerWrapper(addGroup))

    router.get(RESOURCES.GROUP, handlerWrapper(getGroup))

    router.post(RESOURCES.DELETEGROUP, handlerWrapper(deleteGroup))

    router.get(RESOURCES.EDIT, handlerWrapper(updateForm))
    router.post(RESOURCES.EDIT, handlerWrapper(updateGroup))

    router.post(RESOURCES.TEAMDELETE, handlerWrapper(deleteTeamGroup))
    
    router.post(RESOURCES.ADDTEAM, handlerWrapper(insertedTeam))
    router.post(RESOURCES.GET_REST_INFO, handlerWrapper(insertedTeamTESTE)) //ALTERAR DEPOIS DO TESTE, era checkIfcanAdd
    router.post(RESOURCES.VERIFY_IF_CAN_ADD_TEAM,handlerWrapper(checkIfCanAdd))

    router.get(RESOURCES.TEAMS, handlerWrapper(searchFormTeams))

    router.get(RESOURCES.TEAM_BY_TEAMNAME, handlerWrapper(searchSpecificTeams))

    //relacionado com operações de user ja existente

    router.get(RESOURCES.USER_INFO, handlerWrapper(getUserInfo))
    router.post(RESOURCES.VALIDATE_USER_CHANGES , handlerWrapper(validateUserChanges))

    router.use('*', (req, res) => {
        res.status(404).render('notFound');
    });

    return router
// Definir rotas
//router.get(RESOURCES_WEB_SITE.GROUPS, handlerWrapper(getGroups));
//router.get(RESOURCES_WEB_SITE.GROUP, handlerWrapper(getGroup));
//router.post(RESOURCES_WEB_SITE.GROUP_DELETE, handlerWrapper(deleteGroup));

// Função utilitária para definir o token do usuário
/*function setUserToken(req) {
    req.user = {
        name: 'Bob o Construtor',
        email: 'bob@construtor.pt',
        token: 'c176eafd-25eb-45d3-a8cb-7218f3d63b3b'
    };
}*/

// Função utilitária para tratamento de erros
function handlerWrapper(handler) {
    return async function (req, rsp) {
        const token = getToken(req)
        if (!token) {
            
            rsp.cookie('authError', 'You must Login', { maxAge: 60000, httpOnly: true });
            return rsp.status(401).redirect('/site/login');
        }
        try {
            console.log("TOKEN", token)
            return await handler(req, rsp)
        } catch (error) {
            //const rspError = errorToHttp(error);
            //rsp.status(rspError.status).json({ error: rspError.message })
        }
    };
}

// Funções exportadas
 async function getGroups(req, resp) {
    //console.log("ENTREI no getgroups")
    //console.log("req", req)
    console.log("USER",req.user)
    const groups = await services.getGroups(req.user.token);
    resp.render('groups', { username: req.user.username, groups: groups });
}

 async function getGroup(req, resp) {
    
    const groupId = req.params.groupID
    
    const group = await services.getGroup(groupId, req.user.token);

    resp.render('group', {group, groupId});
}

 async function updateForm(req, resp) {

    const groupId = req.params.groupID
    const groupForm = await services.getGroup(groupId, req.user.token);
    resp.render('editGroupForm',{ groupForm, groupId })

}

 async function updateGroup(req, resp) {

    const groupId = req.params.groupID;
    const groupUpdater = {
        name: req.body.name,
        description: req.body.description
    }
    try {
        
        const group = await services.updateGroup(groupId, groupUpdater, req.user.token);
        
        const groupReturn = await services.getGroup(groupId,req.user.token )
        
        resp.redirect('/site/groups/' + groupId);
    } catch (error) {

        resp.status(500).send("Ocorreu um erro ao atualizar o grupo.");
    }
}


 async function addGroup(req, resp) {
    resp.status(201);
    const groupData = {
        name : req.body.name,
        description : req.body.description
    }
    try {   
    const group = await services.createGroup(groupData, req.user.token);
    if (group) {
        resp.redirect('/site/groups');
    } else {
        resp.render('createGroup', { error: 'Não foi possível criar o grupo' });
    }
    } catch (error) {
    
        resp.status(500).render('error', { error })
    }
}

 async function createGroupForm(req, resp) {
    resp.render('createGroupForm');
}


 async function deleteGroup(req, resp) {

    try {
    const result = await services.deleteGroup(req.params.groupID, req.user.token);

        resp.redirect('/site/groups');

        resp.status(404).render('notFound');

} catch (error) {
    resp.status(500).render('error', { error })
}
}

 async function deleteTeamGroup(req, resp) {

    const teamName = req.params.teamName
    const groupId = req.params.groupID
    const leagueData = {
        league: req.body.league , 
        season: req.body.season
    }
    
    const result = await services.deleteTeamGroup(groupId, teamName, leagueData, req.user.token);

    if (result) {
        resp.redirect('/site/groups/' + groupId );
    } else {
        resp.status(404).render('notFound');
    }
}

async function insertedTeamTESTE(req, resp) {
    console.log("entrou, boa ligação")
    const teamName = req.body.teamName
    
    const groupId = req.params.groupID
  
    
    services.getLeague(teamName)
    .then(teams => {
        console.log("teams", teams)
        resp.render('selectTeamsSearched', {teams, groupId})
    })
    .catch(error => resp.status(404).render('error', { error }))
    }
    


 async function insertedTeam(req, resp) {
    const groupId = req.params.groupID
    resp.render('insertTeam', {groupId})
}

 async function checkIfCanAdd(req, resp) {
    console.log("entrou no CHECKIFCANADD")
    console.log("NHA BODY", req.body)
    const groupId = req.params.groupID

    const teamName = req.body.team

    const body = {
       league : req.body.league,
       season : req.body.season
    }
    console.log("TEAM", teamName)
    console.log("LEAGUE", body.league)
    console.log("SEASON", body.season)
    try{
    const addTeam = await services.addTeamToGroup(groupId, teamName, body, req.user.token )
            if(addTeam.result = 'updated'){
            console.log("REDIRECIONAMENTO PARA GRUPO X")
            return resp.redirect('/site/groups/' + groupId );
        }
        else{
            console.log("entrou no else")
            resp.status(404).render('error', { error })
        }
    } 
    catch(error) {
            console.log("entrou no catch")
            resp.status(404).render('error', { error })
            return error}
    }

 async function searchFormTeams(req, resp){
    const allTeams = await services.getAllTeamsUsed(req.user.token)
    console.log("allTeams", allTeams)
    resp.render('teams', {allTeams})
}

 async function searchSpecificTeams(req, resp){

const teamName = req.params.teamName
console.log("teamName", teamName)

services.getLeague(teamName)
.then(teams => {
    console.log("teams", teams)
    resp.render('getTeamInfo', {teams})
})
.catch(error => resp.status(404).render('error', { error }))
}

function getToken(req) {
    if (!req.user) {
        return null;
    }
    return req.user.token;
}
//-----------------User Related-------------------

async function getUserInfo(req, resp) {
    
    const user = await services.getUser(req.user.token);
   

    resp.render('user', {user});
}

async function validateUserChanges(req, resp) {
    console.log("entrou no validate")
    console.log("reqbody", req.body.name)
    console.log("reqboduemail", req.body.password)
    console.log("beforachanges", req.body.beforeChanges)

    const validation = await services.validateUserChanges(req.body, req.user.token)

    if(validation != undefined){
        console.log("validou mesmo")

        const user = await services.changeUserInfo(req.body, req.user.token)

       return resp.render('menu', { user: req.body.username })
    }
    else{
        console.log("validou mm")
        return resp.render('menu', { error: 'Alterações invalidas' });// meter para aparecer o erro no topo da pagina
    }
}

}