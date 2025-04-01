/*
// File responsibilities
// 1 - Include the API modules that configure the server, and provide them its dependencies
// 2 - Launch the server and wait for requests
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import express from 'express'
import cors from 'cors'

//import path from 'path';
//import { fileURLToPath } from 'url';

import foccaciaDataInit from '.data/memory/foccacia-data_mem.mjs'
const gamesData = foccaciaDataInit()

import usersDataInit from '.data/memory/users-data_mem.mjs'
const usersData = usersDataInit()

import servicesInit from './foccacia-services.mjs'
const services = servicesInit(gamesData, usersData)

import gamesApiInit from './foccacia-web-api.mjs'
const gamesApi = gamesApiInit(services)

//import foccaciaWebSiteInit from './foccacia-web-site.mjs'
//const foccaciaWebSite = foccaciaWebSiteInit(services)






export const app = express()
//const swaggerDocument = yaml.load('./apiDoc.yaml')

import ServerConfig from './foccacia-server-config.mjs'
app.use(cors())
//app.use(express.json()) tenho de meter??

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

// //view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');
// //require('hbs').registerPartials(__dirname + '/views/partials');


//app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api', gamesApi) //ver se aqui é api ou foccacia-web-api
app.use('/', gamesWebSite)


ServerConfig(app)



const PORT = 3000
app.listen(PORT, serverStarted)

function serverStarted(error) {
    if(error) {
        return console.log(`Server not started because of the following error: ${error}`)
    }
    console.log(`Server listening on port ${PORT}`)
}

*/
