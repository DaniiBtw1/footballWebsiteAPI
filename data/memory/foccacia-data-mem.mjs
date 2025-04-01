/**
 * Implements all groups data access, stored in memory 
 */

import errors from '../../common/errors.mjs'

let idGroupNextGroup = 0

function Group(name, description, ownerId, teams =[]) {  
    this.id = ++idGroupNextGroup
    this.name = name
    this.description = description
    this.updateCount = 0
    this.ownerId = ownerId
    this.teams = teams 
}



export const GROUPS = [ 
    new Group("Liga Portuguesa", "Grupos dos melhores times de Portugal", 1, []),

    new Group("Liga Espanhola", "Grupos dos melhores times da Espanha", 1, []),
];

export function getGroups(userId) { 
    return Promise.resolve(GROUPS.filter(g => g.ownerId == userId))
}

/*
export function getTeams() { 
    return Promise.resolve(TEAMS.filter(g => g))
}
*/

export function createGroup(GroupData, userId) { 
        const newGroup= new Group(GroupData.name, GroupData.description, userId, [])
        GROUPS.push(newGroup)
        return Promise.resolve(newGroup)
}

export function getGroup(groupId, userId) { 
    
    const group = GROUPS.find(g => g.id == groupId);
  
    if(group) {
        return Promise.resolve(group)
    }
    
    return Promise.reject(errors.NOT_FOUND(`Group with id ${groupId} not found.`))
}

export function deleteGroup(groupId, userId) {
    const idxToRemove = GROUPS.findIndex(g => g.id == groupId)
        GROUPS.splice(idxToRemove, 1)
        return Promise.resolve()
    
}

export function deleteTeamGroup(groupId, body, teamName) {
    const group = GROUPS.find(g => g.id == groupId)
    if(group) {
        const index = group.teams.findIndex(team => team.name == teamName && team.league == body.league && team.season == body.season)
        if(index != -1){
            group.teams.splice(index, 1);
        
        return Promise.resolve(group)
        }
      return Promise.reject(errors.INVALID_DATA(`Team with name ${teamName} does not already exists`))
    }
    return Promise.reject(errors.NOT_FOUND(`Group with name ${groupId} not found`))
}


export function updateGroup(groupId, groupUpdater) { 
    const group = GROUPS.find(g => g.id == groupId)
        group.name = groupUpdater.name
        group.description = groupUpdater.description
        group.updateCount++
        return Promise.resolve(group)
}

export function addTeamToGroup(team, groupId){ 
    const group = GROUPS.find(g => g.id == groupId)
    const verifyTeam = group.teams.find(t => t.name == team.name && t.league == team.league && t.season == team.season)
    if(verifyTeam == undefined){
       
        group.teams.push(team)
        return Promise.resolve(group)
 }  
 return Promise.reject(errors.INVALID_DATA(`Team with name ${team.name} already exists`))
}

/*
export function addTeamToTeams(team){ // isso nao tem que passar nenhuma mensagem porque nao tem nada haver com o cliente
    const verifyTeam = TEAMS.find(g => g.name == team.name)
    if(verifyTeam == undefined){
        const newTeam = new Teams(team.name, team.venue)
        TEAMS.push(newTeam)
        return Promise.resolve(newTeam)
    }
   // return Promise.reject(errors.INVALID_DATA(`Team with team name ${team.name} already exists`)) n tem que retornar uma mensagem
}
*/




