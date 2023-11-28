const express = require('express')
const path = require('path')
const app = express()
const port = 5000

const config = require('./src/config/config.json')
const { Sequelize, QueryTypes } = require("sequelize")
const sequelize = new Sequelize(config.development)


app.set ('view engine', 'hbs')
app.set ('views', path.join(__dirname, 'src/views'))


app.use(express.static(path.join(__dirname, 'src/assets')))
app.use(express.urlencoded({ extended : false}))

app.get('/', home)
app.get('/testimonial',testimonial)
app.get('/contact-me',contactMe)
app.get('/my-project-detail/:id',myProject)

app.get('/add-my-project',formMyProject)
app.post('/add-my-project',addMyProject)

app.post('/delete-project/:id',deleteProject)
app.get('/edit-project/:id',editProjectView)
app.post('/edit-project/:id',editProject)


app.listen(port, () => {
    console.log ("Server running on port 5000")
})

async function home (req, res) {
    try{
        const query = `SELECT * FROM projects`
        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })

        obj.forEach(item => {
            item.duration = waktu(item.start_date, item.end_date)
            item.techs = viewIcon(item.technologies)  
            item.description = cardDesc(item.description)
        })

        console.log(obj)
        res.render('index' , {content : obj})
    } catch(err) {
        console.log(err)
    }
}

function testimonial (req, res) {
    res.render('testimonial')
}

function contactMe (req, res) {
    res.render('contact-me')
}

async function myProject (req, res) {
    try{
        const { id } = req.params

        const query = `SELECT * FROM projects WHERE id=${id}`
        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })
       
        obj.forEach(item => {
            item.duration = waktu(item.start_date, item.end_date)
            item.techs = viewIconHbs(item.technologies)
            item.start_date = newDate(item.start_date)  
            item.end_date = newDate(item.end_date)  
        })  

        console.log(obj)
        res.render('my-project-detail' , {content : obj[0]})
    } catch(err) {
        console.log(err)
    }
}

function formMyProject (req, res) {
    res.render('add-my-project')
}

async function addMyProject (req, res) {
    try{
    
    let image = "jotaro.jpg"
    
    
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
    
    const query = `INSERT INTO projects (title, start_date, end_date, image, description, technologies, "createdAt", "updatedAt") VALUES ('${title}', '${start_date}','${end_date}', '${image}','${description}', ARRAY[${technologies}], NOW(), NOW())`
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

        const query = `SELECT * FROM projects WHERE id =${id}`
        let obj = await sequelize.query(query, { type: QueryTypes.SELECT })
        
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

        res.render('edit-my-project',{content : obj[0]})
    } catch(error){
        console.log(error)
    }
}

async function editProject (req, res) {
    try{
        const { id } = req.params

        let image = "kucing.jpg"
        
        
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
        technologies =  ARRAY[${technologies}], "updatedAt" = NOW() WHERE ID=${id}`
        
        await sequelize.query(query)
    
        res.redirect('/')
    
        } catch(error){
            console.log(error)
        }
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
            codeIcon += `<i class="fa-brands fa-node-js">&nbsp Node js</i>`
        } else if (icon[i] == "react-js") {
            codeIcon += `<i class="fa-brands fa-react">&nbsp React js</i>`
        } else if (icon[i] == "next-js") {
            codeIcon += `<i class="fa-brands fa-vuejs">&nbsp Next js</i>`
        } else if (icon[i] == "type-script") {
            codeIcon += `<i class="fa-brands fa-js">&nbsp Type Script</i>`  
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
        technologies.push(`'nex-js'`)
    }
    if (techs.script == "type-script") {
        technologies.push(`'type-script'`)
    }

    return technologies
}