/**
 * Starts HTTP server
 */

import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import express from 'express'
import cors from 'cors'


export const app = express()
const swaggerDocument = yaml.load('./apiDoc.yaml')

import ServerConfig from './foccacia-server-config.mjs'
app.use(cors())

app.use(express.urlencoded({ extended: true }));

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

ServerConfig(app)



const PORT = 3000
app.listen(PORT, serverStarted)

function serverStarted(error) {
    if(error) {
        return console.log(`Server not started because of the following error: ${error}`)
    }
    console.log(`Server listening on port ${PORT}`)
}


