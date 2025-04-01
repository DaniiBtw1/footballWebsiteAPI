import fetch from 'node-fetch';
const apiKey = '1cf38f333e7de40a81c4207777d16c45'
export async function getTeamByName(teamName) {
    
    let teams = []
   // try {
        const response = await fetch(`https://v3.football.api-sports.io/teams?name=${teamName}`, {
            method: "GET",
            headers: {
                //"x-rapidapi-host": "v3.football.api-sports.io",
                "x-rapidapi-key": apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!data.response || data.response.length == 0) {
            throw new Error(`Team "${teamName}" not found`);
        }   

        for (let i = 0; i < data.response.length; i++) {
            const team = data.response[i];

            const teamInter = {
                id : team.team.id,
                name : team.team.name,
                image : team.team.logo,
                venue : team.venue.name
            }

            teams.push(teamInter)
        }

        return teams;
    /*} catch (err) {
        return Promise.reject(err); 
    }*/
}

export async function getTeamDetailsByName(teamName) {
    
    let teams = []
   // try {
        const response = await fetch(`https://v3.football.api-sports.io/teams?name=${teamName}`, {
            method: "GET",
            headers: {
                //"x-rapidapi-host": "v3.football.api-sports.io",
                "x-rapidapi-key": apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!data.response || data.response.length == 0) {
            throw new Error(`Team "${teamName}" not found`);
        }   

        for (let i = 0; i < data.response.length; i++) {
            const team = data.response[i];

            const teamInter = {
                id : team.team.id,
                name : team.team.name,
                venue : team.venue.name,
                logo : team.team.logo
            }

            teams.push(teamInter)
        }

        return teams;
    /*} catch (err) {
        return Promise.reject(err); 
    }*/
}

export async function getLeagueByTeam(teamId) { 

    let arrayLeagues = [];
    
    try {
        const response = await fetch(`https://v3.football.api-sports.io/leagues?team=${teamId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!data.response || data.response.length === 0) {
            throw new Error(`Leagues for Team "${teamId}" not found`);
        }   

        for (let i = 0; i < data.response.length; i++) {
            const league = data.response[i];
            const leagueSeason = league.seasons
            const season = []

            for(let j = 0; j < leagueSeason.length; j++ ){
                const seasonSpecific = league.seasons[j] 
                const s = {
                    year : seasonSpecific.year,
                }
                season.push(s)
            }

            const leaguesInfo = {  
                name: league.league.name,
                Id:league.league.id,
                seasons: season                   
                    
            };

            if (!league.seasons || league.seasons.length === 0) {
                throw new Error(`No current season found for league of team "${teamId}"`);
            }

            arrayLeagues.push(leaguesInfo);
        }

        return arrayLeagues;

    } catch (err) {
        console.error(err.message || "Erro no pedido");
        return { Id: teamId, League: "Error fetching league" }; 
    }
}
