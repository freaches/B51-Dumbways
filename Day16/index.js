const express = require('express')
const path = require('path')
const app = express()
const port = 5000

const config = require('./src/config/config.json')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const upload = require('./src/middlewares/uploadFile')


const { Sequelize, QueryTypes } = require("sequelize")
const sequelize = new Sequelize(config.development)


app.set ('view engine', 'hbs')
app.set ('views', path.join(__dirname, 'src/views'))


app.use(express.static(path.join(__dirname, 'src/assets')))
app.use(express.static(path.join(__dirname, 'src/uploads')))
app.use(express.urlencoded({ extended : false}))

app.use(flash())

app.use(session({
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: 'kingking'
  })
)

app.get('/', home)
app.get('/testimonial',testimonial)
app.get('/contact-me',contactMe)
app.get('/my-project-detail/:id',projectDetail)

app.get('/add-my-project',formMyProject)
app.post('/add-my-project',upload.single('image'),addMyProject)

app.post('/delete-project/:id',deleteProject)
app.get('/edit-project/:id',editProjectView)
app.post('/edit-project/:id',upload.single('image'),editProject)

app.get('/register', formRegister)
app.post('/register', addUser)
app.get('/login', formLogin)
app.post('/login', userLogin)
app.get('/logout',userLogout)

app.use((req, res, next) => { 
    res.status(404).send( 
        "<h1>Page not found on the server</h1>") 
}) 


app.listen(port, () => {
    console.log ("Server running on port 5000")
})

async function home (req, res) {
    try{
        const query = `SELECT projects.id, title, description, start_date, end_date, technologies, image, users.name AS author FROM projects LEFT JOIN users ON projects.author = users.id ORDER BY projects.id DESC`;

        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })

        obj.forEach(item => {
            item.duration = waktu(item.start_date, item.end_date)
            item.techs = viewIcon(item.technologies)  
            item.description = cardDesc(item.description)
            item.isLogin = req.session.isLogin
        })

        console.log(obj)

        res.render('index' , {content : obj,
            isLogin: req.session.isLogin,
            user: req.session.user})
    } catch(err) {
        console.log(err)
    }
}

function testimonial (req, res) {
    res.render('testimonial', {isLogin: req.session.isLogin,
        user: req.session.user})
}

function contactMe (req, res) {
    res.render('contact-me', {isLogin: req.session.isLogin,
        user: req.session.user})
}

async function projectDetail (req, res) {
    try{
        const { id } = req.params
        
        const query = `SELECT projects.id, title, description, image, start_date, end_date, technologies, users.name AS author FROM projects LEFT JOIN users ON projects.author = users.id WHERE projects.id =${id}`

        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })
       
        obj.forEach(item => {
            item.duration = waktu(item.start_date, item.end_date)
            item.techs = viewIconHbs(item.technologies)
            item.start_date = newDate(item.start_date)  
            item.end_date = newDate(item.end_date)  
        })  

        console.log(obj)
        res.render('my-project-detail' , {content : obj[0],
            isLogin: req.session.isLogin,
            user: req.session.user})
    } catch(err) {
        console.log(err)
    }
}

function formMyProject (req, res) {
    const isLogin = req.session.isLogin

    if(!isLogin){
        req.flash('danger', "Anda tidak mempunyai akses ini!")
        return res.redirect('/')
    }

    res.render('add-my-project',{isLogin,
        user: req.session.user})
}

async function addMyProject (req, res) {
    try{
    
    let { title, start_date, end_date, description, node, react, next, script} = req.body
    
    const idUser = req.session.idUser
    const image = req.file.filename

    console.log(title)
    console.log(start_date)
    console.log(end_date)
    console.log(description)
    console.log(node)
    console.log(react)
    console.log(next)
    console.log(script)
    console.log(image)

    let techs = {node,react,next,script}
    let technologies = techArray(techs)
    console.log(technologies)
    
    const query = `INSERT INTO projects (title, start_date, end_date, image, description, technologies, author, "createdAt", "updatedAt") VALUES ('${title}', '${start_date}','${end_date}', '${image}','${description}', ARRAY[${technologies}], ${idUser}, NOW(), NOW())`
    
    await sequelize.query(query)

    res.redirect('/')
    } catch(error){
        console.log(error)
    }

}

async function deleteProject (req, res){
    try{
        const { id } = req.params

        await sequelize.query(`DELETE FROM projects WHERE id = ${id}`)

        res.redirect('/')
    } catch(error){
        console.log(error)
    }
}

async function editProjectView (req, res) {
    try{
        const { id } = req.params

        const isLogin = req.session.isLogin

        if(!isLogin){
            req.flash('danger', "Anda tidak mempunyai akses ini!")
            return res.redirect('/')
        }

        const query = `SELECT projects.id, title, description, image, start_date, end_date, technologies, users.name AS author FROM projects LEFT JOIN users ON projects.author = users.id WHERE projects.id =${id}`

        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })

        if(!obj.length) {
            req.flash('danger', "Data Not Found!!")
            return res.redirect('/')
        }
        
        obj.forEach( item  =>{
            let array = item.technologies

            item.node = false
            item.react = false
            item.next = false
            item.script = false

            for (let i=0 ; i < array.length; i++){
                if (array[i] == "node-js") {
                    item.node=true
                } else if (array[i] == "react-js") {
                    item.react=true
                } else if (array[i] == "next-js") {
                    item.next=true
                } else if (array[i] == "type-script") {
                    item.script=true
                }
            }
        })
        console.log(obj)

        res.render('edit-my-project',{content : obj[0], 
            isLogin: req.session.isLogin,
            user: req.session.user})
    } catch(error){
        console.log(error)
    }
}

async function editProject (req, res) {
    try{
        const { id } = req.params

        let image = ""
        
       if (req.file) {
            image = req.file.filename
        } else if(!image){
            const query = `SELECT projects.id, title, description, image, start_date, end_date, technologies, users.name AS author FROM projects LEFT JOIN users ON projects.author = users.id WHERE projects.id =${id}`
            let obj = await sequelize.query(query, { type: QueryTypes.SELECT })
            image = obj[0].image
        }
        
        
        let { title, start_date, end_date, description, node, react, next, script} = req.body
        console.log(title)
        console.log(start_date)
        console.log(end_date)
        console.log(description)
        console.log(node)
        console.log(react)
        console.log(next)
        console.log(script)
        console.log(image)

        let techs = {node,react,next,script}
        let technologies = techArray(techs)
        console.log(technologies)
        
        const query = `UPDATE projects 
        SET title = '${title}', start_date = '${start_date}', end_date = '${end_date}', image = '${image}', description = '${description}', 
        technologies =  ARRAY[${technologies}], "createdAt" = NOW(), "updatedAt" = NOW() WHERE ID=${id}`
        
        await sequelize.query(query)
    
        res.redirect('/')
    
        } catch(error){
            console.log(error)
        }
}

function formRegister(req, res) {

    const isLogin = req.session.isLogin

    if(isLogin){
        req.flash('danger', "Anda sudah masuk ke akun anda!")
        return res.redirect('/')
    }

    res.render('register', {isLogin: req.session.isLogin,
        user: req.session.user})
}

async function addUser(req, res) {
    try {
    const { name, email, password } = req.body

    if(req.body.name == "" || req.body.email == "" || req.body.password == ""){
        req.flash('danger', 'Data Kosong! Tolong isikan data ada pada form Register!')
        return res.redirect('/register')
    }

    const queryEmail = `SELECT * FROM users WHERE email = '${email}'`
    let objEmail = await sequelize.query(queryEmail, { type: QueryTypes.SELECT })

    if(objEmail.length){
        req.flash('danger', "Email sudah terpakai! Masukan email yang lain")
        return res.redirect('/register')
    }


    // await bcrypt.hash(password, 10, (err, hashPassword) => {
    //     const query = `INSERT INTO users (name, email, password, "createdAt", "updatedAt") VALUES ('${name}', '${email}', '${hashPassword}', NOW(), NOW())`    
    //     sequelize.query(query)})
    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            console.error("Password failed to be encrypted!")
            req.flash('danger', 'Register failed : password failed to be encrypted!')
            return res.redirect('/register')
        }

        console.log("Hash result :", hash)
        const query = `INSERT INTO users (name, email, password, "createdAt", "updatedAt") VALUES ('${name}', '${email}', '${hash}', NOW(), NOW())`    

        await sequelize.query(query, { type: QueryTypes.INSERT })

        const queryLogin = `SELECT * FROM users WHERE email = '${email}'`
        let obj = await sequelize.query(queryLogin, { type: QueryTypes.SELECT })
        console.log(obj)
        req.session.isLogin = true,
        req.session.user = obj[0].name
        req.session.idUser = obj[0].id
    
        req.flash('success', 'Register Berhasil! Selamat Datang!')
        res.redirect('/')
    })
    } catch (err) {
      throw err
    }
  }
  
function formLogin(req, res) {
    const isLogin = req.session.isLogin

    if(isLogin){
        req.flash('danger', "Anda sudah masuk ke akun anda!")
        return res.redirect('/')
    }

    res.render('login', {isLogin: req.session.isLogin,
        user: req.session.user})
}

async function userLogin(req, res) {
    try {
      const { email, password } = req.body
      const query = `SELECT * FROM users WHERE email = '${email}'`
      let obj = await sequelize.query(query, { type: QueryTypes.SELECT })
  
      if(!obj.length) {
        req.flash('danger', "user has not been registered")
        return res.redirect('/login')
      }
  
      await bcrypt.compare(password, obj[0].password, (err, result) => {
        if(!result) {
          req.flash('danger', 'password wrong')
          return res.redirect('/login')
        } else {
          req.session.isLogin = true,
          req.session.user = obj[0].name
          req.session.idUser = obj[0].id
          req.flash('success', ' login success')
          return res.redirect('/')
        }
      })
  
    } catch (err) {
      throw err
    }
}

function userLogout (req,res) {
    req.session.isLogin = false
    req.session.name = ""
    req.flash('success', 'Anda telah logout dari akun anda')
    res.redirect('/');
}

function waktu (awal,akhir){

        let dataStart = new Date (awal)
        let dataEnd = new Date (akhir)
        let oneDay = 1000 * 3600 * 24

        let selisih = dataEnd.getTime() - dataStart.getTime()
        let totaldays = selisih/oneDay
        months  = Math.floor (totaldays/30)
        days = totaldays % 30
        if (months > 0) {
            return months + " Bulan"
        } else if ( days > 0)
        {
            return days + " Hari"
        }
}

function viewIcon (icon) {

    let codeIcon = ""

    for (i=0; i<icon.length; i++){
        if (icon[i] == "node-js") {
            codeIcon += `<i class="fa-brands fa-node-js"></i>`
        } else if (icon[i] == "react-js") {
            codeIcon += `<i class="fa-brands fa-react"></i>`
        } else if (icon[i] == "next-js") {
            codeIcon += `<i class="fa-brands fa-vuejs"></i>`
        } else if (icon[i] == "type-script") {
            codeIcon += `<i class="fa-brands fa-js"></i>`  
        }
    }

    return codeIcon
}

function viewIconHbs (icon) {

    let codeIcon = ""

    for (i=0; i<icon.length; i++){
        if (icon[i] == "node-js") {
            codeIcon += `<i class="fa-brands fa-node-js mb-3 w-50">&nbsp Node js</i>`
        } else if (icon[i] == "react-js") {
            codeIcon += `<i class="fa-brands fa-react mb-3 w-50">&nbsp React js</i>`
        } else if (icon[i] == "next-js") {
            codeIcon += `<i class="fa-brands fa-vuejs mb-3 w-50">&nbsp Next js</i>`
        } else if (icon[i] == "type-script") {
            codeIcon += `<i class="fa-brands fa-js mb-3 w-50">&nbsp Type Script</i>`  
        }
    }

    return codeIcon
}

function newDate (date){
    const months = ["Jan","Feb","Mar","Apr","May","June","July","Augu","Sept","Oct","Nov","Dec"];

    const d = new Date (date)

    let day = d.getDate()
    let month = months[d.getMonth()]
    let year = d.getFullYear()

    return `${day} ${month} ${year}`
}

function cardDesc(text){
    return text.slice(0, 30) + (text.length > 30 ? "..." : "");
}

function techArray(techs){
    let technologies = []

    if (techs.node == "node-js") {
        technologies.push(`'node-js'`)
    }
    if (techs.react == "react-js") {
        technologies.push(`'react-js'`)
    }
    if (techs.next == "next-js") {
        technologies.push(`'next-js'`)
    }
    if (techs.script == "type-script") {
        technologies.push(`'type-script'`)
    }

    return technologies
}