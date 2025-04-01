/**
 * This file contains all HTTP API handling functions.
 */

//import * as foccaciaService from './foccacia-services.mjs'
import errosMapping from './application-to-http-erros.mjs'
import errors from './common/errors.mjs'
import { isGuid } from 'is-guid'
import express from 'express'


    // Web Application Resources URIs
const RESOURCES = {
    // TEAMSTESTE: '/api/allTeams',
        GROUPS: '/groups',
        GROUP_BY_ID: '/groups/:groupId', 
        TEAMGROUP: `/groups/:groupId/:teamName`,
        TEAM_BY_NAME : '/teams', 
        LEAGUES_BY_TEAM : '/leagues',
        NEW_USER: '/user',
        NOTGETTEAM: '/notTeam'
    }

export default function(foccaciaService) {
    if(!foccaciaService) {
        throw "Invalid service provided"
    }
    console.log("WEB-APIIII")

    const router = express.Router()
    router.use([RESOURCES.GROUPS, RESOURCES.GROUP_BY_ID, RESOURCES.TEAMGROUP, RESOURCES.TEAM_BY_NAME, RESOURCES.LEAGUES_BY_TEAM, RESOURCES.NOTGETTEAM], extractToken)


    router.get(RESOURCES.GROUPS, createHandler(InternalgetGroups))
    router.get(RESOURCES.GROUP_BY_ID, createHandler(InternalgetGroup))
    router.post(RESOURCES.GROUPS, createHandler(InternaladdGroup))
    router.put(RESOURCES.GROUP_BY_ID, createHandler(InternalupdateGroup))
    router.delete(RESOURCES.GROUP_BY_ID, createHandler(InternaldeleteGroup))
    router.put(RESOURCES.TEAMGROUP,createHandler(InternaladdTeamToGroup))
    router.delete(RESOURCES.TEAMGROUP, createHandler(InternaldeleteTeamGroup))
    router.get(RESOURCES.TEAM_BY_NAME, createHandler(ExternalgetTeam)) 
    router.get(RESOURCES.LEAGUES_BY_TEAM, createHandler(ExternalgetLeague)) 
    router.post(RESOURCES.NEW_USER, createHandler(InternalNewUser)) 
    router.post(RESOURCES.NOTGETTEAM, createHandler(ExternalTeamDetails))

    router.use('*', (req, res) => {
        res.status(404).render('notFound');
    });

    return router




 function InternalgetGroups(req, rsp) {
    return foccaciaService.getGroups(req.token)
        .then(groups => rsp.json(groups))
}

 function InternaladdGroup(req, rsp) {
    const groupRepresentation = req.body;
   
   return foccaciaService.createGroup(groupRepresentation, req.token)
        .then(group => rsp.status(201).send({
            description: `Group created`,
            uri: `/api/groups/${group.id}` 
        }))
        
}

 function InternalNewUser(req, rsp) {
    const groupRepresentation = req.body;
    console.log("WEB-API NEW USER")
    console.log("PASSWORD", req.body.password)
   return foccaciaService.createNewUser(groupRepresentation)
        .then(user => rsp.status(201).send({
            Text:"User registered with sucess",
            User: user 
        }))        
}



 async function InternalgetGroup(req, rsp) { 
    const groupId = req.params.groupId
    return foccaciaService.getGroup(groupId, req.token)
        .then(group => rsp.json(group))
      
}


 function InternalupdateGroup(req, rsp) {
    const groupRepresentation = req.body
    const groupId = req.params.groupId
    
   return foccaciaService.updateGroup(groupId, groupRepresentation, req.token)
        .then(group => rsp.json({group}))
    
}


 function InternaldeleteGroup(req, rsp) {
    const groupId = req.params.groupId
    return foccaciaService.deleteGroup(groupId, req.token)
        .then(() => rsp.json({ message: `Group with id ${groupId} was deleted with success`}))
        
}

 function InternaldeleteTeamGroup(req, rsp) {
    const groupId = req.params.groupId
    const teamName = req.params.teamName
    const body = req.body
    return foccaciaService.deleteTeamGroup(groupId, teamName, body, req.token)
        .then(() => rsp.json({ message: `Team with name ${teamName} removed from group with id ${groupId}`}))
        
}

 function InternaladdTeamToGroup(req, rsp) {
    const groupId  = req.params.groupId
    const teamName = req.params.teamName
    const body = req.body
    console.log("Web-api")
    return foccaciaService.addTeamToGroup(groupId, teamName, body, req.token)
        .then(() => rsp.json({ message: `Team with name ${teamName} added to group with id ${groupId}`})) 
    
}

function ExternalgetTeam(req, rsp){
    
    const teamName = req.query.name;
   return foccaciaService.getTeam(teamName)
    .then(team => {
        const { id, ...teamWithoutId } = team;
        rsp.json(teamWithoutId);
    })
     
}
 function ExternalTeamDetails(req, rsp){
    
    const teamName = req.body.name;
   return foccaciaService.getLeague(teamName)
    .then(team => {
        const { id, ...teamWithoutId } = team;
        rsp.json(teamWithoutId);
    })
     
}

 function ExternalgetLeague(req, rsp){
    const teamName = req.query.teamName;
    return foccaciaService.getLeague(teamName)
        .then (league => rsp.json(league))
   
}

///////// Auxiliary functions

function createHandler(specificFunction) {
    return function (req, rsp, next) {
        try {
           
            const promiseResult = Promise.resolve(specificFunction(req, rsp));
           
            promiseResult.catch(error => sendError(rsp, error));
      
        } catch (error) {   
          
            sendError(rsp, error);
        }
    };
}


function sendError(rsp, appError) {
    const httpError = errosMapping(appError)
    rsp.status(httpError.status).json(httpError.body)
}

 function extractToken(req, rsp, next) {  
    const authHeader = req.get("Authorization")
    if (authHeader) {
        const authHeaderParts = authHeader.split(" ")
        if (authHeaderParts.length == 2 && authHeaderParts[0] == "Basic" && isGuid(authHeaderParts[1])) {
            const token = authHeaderParts[1]
            if (token) {
                req.token = token
                return next()
            }
        }
    }

    sendError(rsp, errors.INVALID_DATA(`Token is required to use this API`))

}

}