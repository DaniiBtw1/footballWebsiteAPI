//curl -X PUT http://localhost:9200/tasks

// Create a task
//curl -X POST --data '{ "title" : "Task1" , "description" : "task 1 elastic", "userId": "iduser" }' -H "Content-Type: application/json" http://localhost:9200/tasks/_doc

//import {MAX_LIMIT} from '../../services/services-constants.mjs'
import {get, post, del, put} from './fetch-wrapper.mjs'
import uriManager from './uri-manager.mjs'

import errors from '../../common/errors.mjs'


export default function (uri_manager = 'groups') {
const URI_PREFIX = 'http://localhost:9200/'
const URI_MANAGER = uriManager(uri_manager)
    return {
        getGroups,
        getGroup,
        updateGroup,
        deleteGroup,
        createGroup,
        deleteTeamGroup,
        addTeamToGroup,

    }


    function Group(id, name, description, ownerId, teams =[]) {  
    this.id = id
    this.name = name
    this.description = description
    this.updateCount = 0
    this.ownerId = ownerId
    this.teams = teams 
    }

        async function deleteTeamGroup(groupId, teamInfo, teamName, userId){//change the validations to the services file
        const group = await getGroup(groupId, userId)
        
        if (group.ownerId == userId) {
            const updatedTeams = group.teams.filter(team => {
                return team.name != teamName && team.league != teamInfo.league && team.season != teamInfo.season  //meter as outras coisas
            })       
            console.log("updatedTeams", updatedTeams)
            console.log("group.teams", group.teams)
            if(group.teams.length == updatedTeams.length ){
                console.log("ENTROUUUU")
                return Promise.reject();
            }
            group.teams = updatedTeams

            const groupRepresentation = {
                name : group.name,
                description : group.description 
            }

            const response = await updateGroup(groupId, groupRepresentation, userId, group.teams)
        
            if (response.result == 'updated') {
                return response
            }
            return Promise.reject(errors.INVALID_DATA(`Failed to update group with id ${groupId}`))

    }

    return Promise.reject(errors.INVALID_DATA(`Failed to update group with id ${groupId}`))
    }

     async function addTeamToGroup(groupId, teamFinal, userId){

        const group = await getGroup(groupId, userId)
        console.log("justChecking", group.teams.findIndex(t => t.teamId == teamFinal.teamId && t.leagueId == teamFinal.leagueId && t.season == teamFinal.season))
        if(group.teams.findIndex(t => t.teamId == teamFinal.teamId && t.leagueId == teamFinal.leagueId && t.season == teamFinal.season) != -1){
            console.log(" NAO PASSOU OU SEJA SEI MATEMATICA BASICA ")
            return Promise.reject(errors.INVALID_DATA(`Failed to add Team to group with id ${groupId}`))
        }
            console.log("PASSOU NAO SEI COMO ")
        if (group.ownerId == userId) {  //NAO PRECISO DE VALIDAR ISTO

            group.teams.push(teamFinal) 
            
            const groupRepresentation = {
                name : group.name,
                description : group.description 
            }
            const updatedGroup = await updateGroup(groupId, groupRepresentation, userId, group.teams)
            
            return updatedGroup
            }
            return Promise.reject(errors.INVALID_DATA(`Failed to add Team to group with id ${groupId}`))
        }



     async function getGroups(userId, q, skip, limit) {//meter esses outros parametros nos outros files
        console.log("entrou no es")
        const query = {
            query: {
                match: {
                    "ownerId": userId
                }
            }
        }
        return post(URI_MANAGER.getAll(), query)
        .then(body => {
            
            const grupos = body.hits.hits.map(createGroupFromElastic)
            console.log("grupos espectaveis", grupos)
            return grupos
        }) 
        .then(filterGroups)
        
        
        function filterGroups(groups) {

            
            const predicate = q ? g => g.name.includes(q) : g => true
            const filteredGroups = groups.filter(predicate)
            
            // const end = limit != 5/*MAX_LIMIT*/ ? (skip + limit) : filteredGroups.length
            
            return filteredGroups/*.slice(skip, end)*/
        }
    }

     async function getGroup(groupId, userId) {
        return get(URI_MANAGER.get(groupId))
            .then(verifyGroup)

        function verifyGroup(group) {
            const grupo = group.found && group._source.ownerId == userId ? createGroupFromElastic(group) : undefined
            return grupo
        }
    }


    /*  async function createGroup(groupRepresentation, userId) {
        
        groupRepresentation.ownerId = userId
        return post(URI_MANAGER.create(), groupRepresentation)
            .then(body => { groupRepresentation.id = body._id; return groupRepresentation })
    }*/
        
     async function createGroup(groupRepresentation, userId) {
        
        groupRepresentation.ownerId = userId;
        return post(URI_MANAGER.create(), groupRepresentation)
            .then(body => {
                groupRepresentation.id = body._id;
                return groupRepresentation;
            })
            .catch(error => {
                console.error("Error creating group: ", error);  
                throw error;
            });
    }
                

     async function updateGroup(groupId, groupRepresentation, userId, teamFinal) {
        const group = await getGroup(groupId, userId) 
        let teamInfo
        if(!teamFinal) teamInfo = group.teams 
        else teamInfo =teamFinal 
        const updatedObjectGroup = { //melhorar depois
            id : group.id,
            name : groupRepresentation.name,
            description : groupRepresentation.description,
            updateCount : ++group.updateCount,
            ownerId : group.ownerId,
            teams : teamInfo
        }
        
        return post(URI_MANAGER.update(groupId), updatedObjectGroup)
    }
        
        
     async function deleteGroup(id) {
        return del(URI_MANAGER.delete(id))
            .then(body => body._id)
    }


            function createGroupFromElastic(d) {
    return new Group(
            d._id, 
            d._source.name, 
            d._source.description, 
            d._source.ownerId, 
            d._source.teams || [] // Se não houver equipes, garante que seja uma lista vazia.
        )
    }


}
