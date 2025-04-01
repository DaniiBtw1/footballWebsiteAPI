   import errors from './common/errors.mjs'


   //import { errors } from 'undici-types';
   import * as fapi from './fapi-teams-data.mjs'
   import foccaciaDataImport from './data/Elastic/foccacia-data-es.mjs'
   //import * as foccaciaData from './foccacia-data-mem.mjs'
   //import * as usersData from './data/memory/users-data-mem.mjs'

   import usersDataImport from './data/Elastic/users-data-elastic.mjs'
   import * as userDataAntigo from './data/memory/users-data-mem.mjs'



   export default function () {
    const foccaciaData = foccaciaDataImport();
    const usersData = usersDataImport();

    return {
        getGroups : changeUserTokenToUserIdArgument(getGroupsInternal),
        getGroup : changeUserTokenToUserIdArgument(getGroupInternal),
        updateGroup : changeUserTokenToUserIdArgument(updateGroupInternal),
        createGroup : changeUserTokenToUserIdArgument(createGroupInternal),
        deleteGroup : changeUserTokenToUserIdArgument(deleteGroupInternal),
        deleteTeamGroup : changeUserTokenToUserIdArgument(deleteTeamGroupInternal),
        getTeam : getTeamInternal,
        getLeague : getLeagueInternal,
        addTeamToGroup : changeUserTokenToUserIdArgument(addTeamToGroupInternal),
        createNewUser: createNewUser,
        getUser: changeUserTokenToUserIdArgument(getUserInternal),
        getAllTeamsUsed : changeUserTokenToUserIdArgument(getAllTeamsUsedInternal),
        validateUserChanges: changeUserTokenToUserIdArgument(validateUserChangesInternal),
        changeUserInfo: changeUserTokenToUserIdArgument(changeUserInfoInternal)
    }

   function changeUserTokenToUserIdArgument(internalFunction) {
    return async function(...args) {
        const userToken = args.pop();
        return usersData.convertTokenToId(userToken)
                .then(userId => {
                    args.push(userId);
                    return internalFunction.apply(this, args);
                })
                
    }
}


/*
export const getGroups  = changeUserTokenToUserIdArgument(getGroupsInternal)
export const getGroup = changeUserTokenToUserIdArgument(getGroupInternal)
export const updateGroup = changeUserTokenToUserIdArgument(updateGroupInternal)
export const createGroup = changeUserTokenToUserIdArgument(createGroupInternal)
export const deleteGroup = changeUserTokenToUserIdArgument(deleteGroupInternal)
//export const getTeams = changeUserTokenToUserIdArgument(getTeamsInternal)
export const deleteTeamGroup = changeUserTokenToUserIdArgument(deleteTeamGroupInternal)
//export const getTeam = changeUserTokenToUserIdArgument(getTeamInternal)
//export const getLeague = changeUserTokenToUserIdArgument(getLeagueInternal)
export const addTeamToGroup = changeUserTokenToUserIdArgument(addTeamToGroupInternal)
export const getAllTeamsUsed = changeUserTokenToUserIdArgument(getAllTeamsUsedInternal)
*/

 
    function getGroupsInternal(userId) {
       return foccaciaData.getGroups(userId)
   }

   /*
   export function getTeamsInternal(userId) {
    return foccaciaData.getTeams()
}
   */
    async function createNewUser(userData){

        const  check = await usersData.checkIfUserExists(userData)

        if(check == undefined){

          return Promise.reject(errors.INVALID_DATA(`Username or email already in use`));
        }
        
        const user = await usersData.addNewUser(userData)
        return user
        
   } 


    async function createGroupInternal(groupData, userId) { 
    
    if (!groupData.name || typeof groupData.name !== "string" || groupData.name.trim() === "") {
        return Promise.reject(
            errors.INVALID_DATA(`Group name must be a valid string.`)
        );
    }
    

    if (!groupData.description || typeof groupData.description !== "string" || groupData.description.trim() === "") {
        return Promise.reject(
            errors.INVALID_DATA(`Group description must be a valid string.`)
        );
    }
    
    const teste = await foccaciaData.createGroup(groupData, userId) 
    
    return teste
}


   
    function getGroupInternal(groupId, userId) {
     
       return foccaciaData.getGroup(groupId, userId)
           .then(group => {
           if(group){
               if(group.ownerId == userId){
                
                   return group
                }
               
               return Promise.reject(errors.NOT_AUTHORIZED(`User with id ${userId} does not own that group`));
            }
            return Promise.reject(errors.NOT_FOUND(`Group not found`));
           })    
   }

   
    function updateGroupInternal(groupId, groupUpdater, userId) {
    
       if (groupUpdater.description && groupUpdater.name) {
            return foccaciaData.getGroup(groupId, userId)
            .then(group => {
                if (group.ownerId == userId){
                         return foccaciaData.updateGroup(groupId, groupUpdater, userId)  
                         .then(group => group)
                         .catch(error => error)    
                    }
                   
                return Promise.reject(errors.NOT_AUTHORIZED(`User with id ${userId} does not own group with id ${groupId}`));
            })
            .catch(error => Promise.reject(errors.NOT_FOUND(`Group with Group Id ${groupId} doesn't exists`)));
        }else {
           return Promise.reject(errors.INVALID_DATA(`To update a Group, a name and description must be provided`))
       }
   }

   
    function deleteGroupInternal(groupId, userId) {
      
       return foccaciaData.getGroup(groupId,userId)
           .then(group => {
               if(group.ownerId == userId){
                   return foccaciaData.deleteGroup(groupId, userId)
                }
               return Promise.reject(errors.NOT_AUTHORIZED(`User with id ${userId} does not own group with id ${groupId}`));
           
           })
           .catch(error => Promise.reject(errors.NOT_FOUND(`Group with id ${groupId} not found`)))
   }

       
    function deleteTeamGroupInternal(groupId, teamName, body, userId) {
  
    return foccaciaData.getGroup(groupId, userId)
        .then(group => {
          if(group){
            if(group.ownerId == userId){
                
                return foccaciaData.deleteTeamGroup(groupId, body, teamName, userId)
                    .then(group => {
                        
                        return group})
                    .catch(message => {
              
                        return Promise.reject(errors.NOT_FOUND(`Teams ${teamName} doesnt already exists`))})
                
            }
            
            return Promise.reject(errors.NOT_AUTHORIZED(`User with id ${userId} does not own group with id ${groupId}`));
          }
          return Promise.reject(errors.NOT_FOUND(`Group not found`));
        })    
    
}
   
    function getTeamInternal(teamName){
       
       return fapi.getTeamByName(teamName)
        .then(team => team)
        .catch(error => error)

   }
   
    function getLeagueInternal(teamName) {
       
    return fapi.getTeamByName(teamName) 
        .then(teams => {
            if (teams.length == 0) {
                return Promise.reject(errors.INVALID_DATA(`Invalid Team Name ${teamName}`));
            }
            return Promise.all(
                teams.map(team =>
                    fapi.getLeagueByTeam(team.id)
                        .then(leagues => ({
                            team,
                            leagues
                        }))
                        .catch(error => {
                            return null;
                        })
                )
            );
        })
        .then(results => {
            const validResults = results.filter(result => result != null);
           
            return validResults;
        })
        .catch(error => {
            return Promise.reject(errors.NOT_FOUND('Invalida team name'))
        });
}
   

 function addTeamToGroupInternal(groupId, teamName, body, userId){ //could change the order to minimize requests to the external API
    return getLeagueInternal(teamName,userId) 
        .then(league => {
            
            const leagueSeason = league.find(l => 
                l.leagues.find(league => league.name == body.league && 
                league.seasons.find(season => season.year == body.season)
            ));
           
            if (leagueSeason != undefined){
               
                const leagueToSeeId = leagueSeason.leagues.find(league => league.name == body.league)
                

            const teamFinal = { // Could make an constructor
                name: leagueSeason.team.name,
                image: leagueSeason.team.image,
                teamId: leagueSeason.team.id,
                venue: leagueSeason.team.venue,
                league: body.league,
                leagueId: leagueToSeeId.Id,
                season: body.season
            }
            
            return foccaciaData.getGroup(groupId, userId)
            .then(group => {
              
                if(group){
            
                if(group.ownerId != userId){
                    return Promise.reject(errors.NOT_FOUND(`Group with name ${groupId} not found or you are not the owner of the Group`))
                }
                return foccaciaData.addTeamToGroup(groupId, teamFinal, userId)
                    .then(groups => {
                        return groups
                        
                            //return foccaciaData.addTeamToTeams(team)
                                // .then(team => groups)
                                //.catch(error => error)
                    })
                   
                    .catch(error => {
                        return Promise.reject(errors.INVALID_DATA(`Failed to add Team to group with id ${groupId}`))
                    
                }
            )}
                    return Promise.reject(errors.NOT_FOUND(`Group not found`));
                })
            .catch(error => {
                return Promise.reject(error)})
        }
        
        else {
            return Promise.reject(errors.INVALID_DATA(`league ${body.league} or season ${body.season} names are incorrect`))
        }
    })

    
    .catch(error => {

        if (error.message) {
            return Promise.reject(errors.INVALID_DATA(`Problem adding team ${teamName} to Group`));
        }
    
        return Promise.reject(errors.INVALID_DATA(`Invalid Team Name ${teamName}`))})
    }


     function getAllTeamsUsedInternal(userId){
        return foccaciaData.getGroups(userId)
            .then(groups => {
             
                const teams = []
                for(let i = 0; i < groups.length; i++){

                    for(let j = 0; j < groups[i].teams.length; j++){
                        teams.push(groups[i].teams[j])
                    }
            }
           
                return teams
            })
    }

    function getUserInternal(userId){
        console.log("entrou no getUserInternal")
        return usersData.getUserElastic(userId)
        .then(user => {
        console.log("user", user)
        if(user){
            const userTratado = {
                name: user._source.name,
                email: user._source.email,
                password: user._source.password
            }
            console.log("USERTRATADOOOO", userTratado)
             
                return userTratado
            
         }
         return Promise.reject(errors.NOT_FOUND(`Group not found`));// never happens
        })   

    }
    async function validateUserChangesInternal(body, userId){

        const userData = {
            name: body.name,
            email: body.email
        }

            const  check = await usersData.checkIfUserExists(userData)

            if(check == undefined){
    
              return undefined
            }
            
            return check

        }

    async function changeUserInfoInternal( body, userId){

        if (body.name && body.email && body.password) {

            const userData = {
                name: body.name,
                email: body.email,
                password: body.password,
            }

          const userToReturn = await usersData.changeUserInfo(userData, userId)

          return userToReturn


        }
        }
}