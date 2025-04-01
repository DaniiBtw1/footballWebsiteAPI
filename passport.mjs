import foccaciaServiceImport from './foccacia-services.mjs'

export default function (usersData) {
    const foccaciaService = foccaciaServiceImport()
    return {
        serializeUserDeserializeUser,
        loginForm,
        validateLogin,
        createUser,
        validateToCreateUser,
        logout
    }

    function serializeUserDeserializeUser(user, done) {
        done(null, user)
    }

    function loginForm(req, rsp) {
        const authError = req.cookies.authError;
        rsp.clearCookie('authError');
        rsp.render('login', { error: authError });
    }

    async function validateToCreateUser(req, resp) {
        const groupRepresentation = req.body
        return foccaciaService.createNewUser(groupRepresentation)
        .then(user => resp.redirect('/site/menu'))  
        .catch(error => {
            resp.render('createUser', { error: 'User with username and email already exists' })
    }) 
    }

    async function validateLogin(req, rsp) {
        const token = await validateUser(req.body.username, req.body.password)
        if (token != undefined) {
            const user = {
                username: req.body.username,
                token: token,
            }
            console.log("testar para ver", token)
            req.login(user, () => rsp.redirect('/site/menu'))
        }
        else {
            rsp.render('login', { error: 'Invalid username or password' })
        }
    }


    async function validateUser(username, password) {
        let users = await usersData.getAllUsers()
        for (let user of users) {
            console.log("aqui")
            if (user.name == username && user.password == password) {
                return user.token
            }
        }
        console.log("saiu")
    }

    async function createUser(req, resp){
        console.log("createUser opened")
        resp.render('createUser')
    }

    function logout(req, rsp) {
        req.logout((err) => {
            rsp.redirect('/site/menu') // meter o { user: null } e ver se funciona o logout
        })

    }

}