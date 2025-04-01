/**
 * Configures the express HTTP application (including routes and middlewares)
 */

import express from 'express'
import { fileURLToPath } from 'url';
import path from 'path';
import hbs from 'hbs'

//---------------------------------------
import passport from 'passport'
import expressSession from 'express-session'
import cookieParser from 'cookie-parser'


//import * as api from './foccacia-web-api.mjs' 
//import * as site from './foccacia-web-site.mjs'

//dependencias
import apiInit from './foccacia-web-api.mjs'
import groupsServicesInit from './foccacia-services.mjs'
import siteInit from './foccacia-web-site.mjs'
//import groupsDataInit from './data/memory/foccacia-data-mem.mjs'
import groupsDataInit from './data/Elastic/foccacia-data-es.mjs'
//import * as usersData from './data/memory/users-data-mem.mjs'
import usersDataInit from './data/Elastic/users-data-elastic.mjs'

//---------------------------------------
import passportServicesInit from './passport.mjs'




const usersData = usersDataInit()
const groupsData = groupsDataInit()

const groupsServices = groupsServicesInit(groupsData, usersData)
const apiRouter = apiInit(groupsServices)
const siteRouter = siteInit(groupsServices)

//---------------------------------------
const passportServices = passportServicesInit(usersData)

console.log("Server-config loaded")

export default function(app) {


const fileUrl = import.meta.url;
const __filename = fileURLToPath(fileUrl);
const __dirname = path.dirname(__filename);


const viewsPath = path.join(__dirname, 'views');
const partialsPath = path.join(viewsPath, 'partials');



app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

hbs.registerHelper('inc', function(value) {
    return value + 1;
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });

  hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
//---------------------------------------
app.use(cookieParser())

app.use(expressSession(
    {

      secret: "Benfica campeão 2022/2023?",
      resave: false,
      saveUninitialized: false
    }
    ))

app.use(passport.session())
app.use(passport.initialize())

passport.serializeUser(passportServices.serializeUserDeserializeUser)
passport.deserializeUser(passportServices.serializeUserDeserializeUser)


app.get('/site/login',passportServices.loginForm)

app.post('/site/validateLogin',passportServices.validateLogin)

app.get('/site/createUser', passportServices.createUser)

app.post('/site/validateToCreateUser', passportServices.validateToCreateUser)

app.post('/site/logout', passportServices.logout)




app.use(express.json())
app.use(countReq, showRequestData)
//app.use([RESOURCES.GROUPS, RESOURCES.GROUP_BY_ID, RESOURCES.TEAMGROUP] ,api.extractToken) 

// Web Api Application Routes
app.use('/api', apiRouter)

// Web Site Application Routes
app.use('/site', siteRouter)

//related to site


    /*// Web Application Resources URIs
    const RESOURCES = {
        // TEAMSTESTE: '/api/allTeams',
           GROUPS: '/api/groups',
           GROUP_BY_ID: '/api/groups/:groupId', 
           TEAMGROUP: `/api/groups/:groupId/:teamName`,
           TEAM_BY_NAME : '/api/teams', 
           LEAGUES_BY_TEAM : '/api/leagues',
           NEW_USER: '/api/user',
           NOTGETTEAM: '/api/notTeam'
       }
       */



    /*app.use(express.json())
    app.use(countReq, showRequestData)
    app.use([RESOURCES.GROUPS, RESOURCES.GROUP_BY_ID, RESOURCES.TEAMGROUP] ,api.extractToken) 
*/
    //pedidos site
   /* 
    app.get('/site/menu', (req, rsp) => rsp.render('menu'))

    app.get('/site/groups', site.getGroups)

    app.get('/site/groups/new', site.createGroupForm)
    app.post('/site/groups/new', site.addGroup)

    app.get('/site/groups/:groupID', site.getGroup)

    app.post('/site/groups/:groupID/delete', site.deleteGroup)

    app.get('/site/groups/:groupID/edit', site.updateForm)
    app.post('/site/groups/:groupID/edit', site.updateGroup)

    app.post('/site/groups/:groupID/:teamName/delete', site.deleteTeamGroup)
    
    app.post('/site/groups/:groupID/add', site.insertedTeam)
    app.post('/site/groups/:groupID/added', site.checkIfCanAdd)

    app.get('/site/teams', site.searchFormTeams)

    app.get('/site/teams/:teamName', site.searchSpecificTeams)
*/

    //pedidos api
/*
    // Generic to all Groups
    app.get(RESOURCES.GROUPS, api.getGroups) 
    app.post(RESOURCES.GROUPS, api.addGroup) 

    //Actions related with a specific Group
    app.get(RESOURCES.GROUP_BY_ID, api.getGroup) 
    app.put(RESOURCES.GROUP_BY_ID, api.updateGroup) 
    app.delete(RESOURCES.GROUP_BY_ID, api.deleteGroup)

    //Actions related with teams of a specific Group
    app.put(RESOURCES.TEAMGROUP, api.addTeamToGroup) 
    app.delete(RESOURCES.TEAMGROUP, api.deleteTeamGroup) 

    //Related with the External API
    app.get(RESOURCES.TEAM_BY_NAME, api.getTeam) 
    app.get(RESOURCES.LEAGUES_BY_TEAM, api.getLeague) 

    app.post(RESOURCES.NEW_USER, api.newUser) 

    app.post(RESOURCES.NOTGETTEAM, api.teamDetails)

    //app.get(RESOURCES.TEAMSTESTE, api.getTeams)
*/


    let count = 1
    function countReq(req, rsp, next) {
        console.log(`Number of requests: ${count++}`)
        next()
    }

    function showRequestData(req, rsp, next) {
        console.log(`Request method: ${req.method}`)
        console.log(`Request uri: ${req.originalUrl}`)
        next()
    }
}

