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
app.post('/edit-project',editProject)

let days =""
let months = ""

const project = [{
    title : "Mukbangs gomang",
    images : "/image/makanan.jpg",
    start : "2023-11-13",
    end : "2024-01-13",
    duration : "2 Bulan",
    desc : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    techs :
        `<i class="fa-brands fa-node-js"></i>    
        <i class="fa-brands fa-react"></i>
        <i class="fa-brands fa-vuejs"></i>
        <i class="fa-brands fa-js"></i>`
    ,
    node : true,
    react : true,
    next : true,
    script : true

}]



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

function myProject (req, res) {
    const { id } = req.params

    const dataFilter = project[parseInt(id)]
    dataFilter.id = parseInt(id)
    dataFilter.technologies = viewIconHbs(dataFilter)
    dataFilter.start_date = newDate(dataFilter.start)
    dataFilter.end_date = newDate(dataFilter.end)
    console.log("dataFilter", dataFilter)

    res.render('my-project-detail', {data : dataFilter})
}

function formMyProject (req, res) {
    res.render('add-my-project')
}

function addMyProject (req, res) {

    let { title, start, end, desc, node, react, next, script} = req.body
    console.log(title)
    console.log(start)
    console.log(end)
    console.log(desc)
    console.log(node)
    console.log(react)
    console.log(next)
    console.log(script)

    let checkbox = {node,react,next,script}

    if (typeof node === 'undefined'){
        node = false
    }

    if (typeof react === 'undefined'){
        react = false
    }

    if (typeof next === 'undefined'){
        next = false
    }

    if (typeof script === 'undefined'){
        script = false
    }

    const data =  {
        title,
        desc,
        start,
        end,
        node,
        react,
        next,
        script,
        duration : waktu(start,end),
        techs : viewIcon(checkbox)
        // images
    }

    project.unshift(data)

    res.redirect('/')
}

function deleteProject (req, res){
    const { id } = req.params
    console.log(id);
  
    project.splice(id, 1)
    res.redirect('/')
}

function editProjectView (req, res) {
    const { id } = req.params

    const dataFilter = project[parseInt(id)]
    dataFilter.id = parseInt(id)
    console.log("dataFilter", dataFilter)
    res.render('edit-my-project', {content: dataFilter})
}

function editProject (req, res) {

    let {id, title, start, end, desc, node, react, next, script} = req.body
    console.log(title)
    console.log(start)
    console.log(end)
    console.log(desc)
    console.log(node)
    console.log(react)
    console.log(next)
    console.log(script)
    
    if (typeof node === 'undefined'){
        node = false
    }

    if (typeof react === 'undefined'){
        react = false
    }

    if (typeof next === 'undefined'){
        next = false
    }

    if (typeof script === 'undefined'){
        script = false
    }

    let checkbox = {node,react,next,script}

    const data =  {
        title,
        desc,
        start,
        end,
        node,
        react,
        next,
        script,
        duration : waktu(start,end),
        techs : viewIcon(checkbox)
    }

    project[parseInt(id)] = data

    res.redirect('/')
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
        if (icon[i] == "Node Js") {
            codeIcon += `<i class="fa-brands fa-node-js"></i>`
        } else if (icon[i] == "React Js") {
            codeIcon += `<i class="fa-brands fa-react"></i>`
        } else if (icon[i] == "Next Js") {
            codeIcon += `<i class="fa-brands fa-vuejs"></i>`
        } else if (icon[i] == "Type Script") {
            codeIcon += `<i class="fa-brands fa-js"></i>`  
        }
    }

    return codeIcon
}

function viewIconHbs (icon) {

    let codeIcon = ""

    for (i=0; i<icon.length; i++){
        if (icon[i] == "Node Js") {
            codeIcon += `<i class="fa-brands fa-node-js">&nbsp Node js</i>`
        } else if (icon[i] == "React Js") {
            codeIcon += `<i class="fa-brands fa-react">&nbsp React js</i>`
        } else if (icon[i] == "Next Js") {
            codeIcon += `<i class="fa-brands fa-vuejs">>&nbsp Next js</i>`
        } else if (icon[i] == "Type Script") {
            codeIcon += `<i class="fa-brands fa-js">&nbsp Type Script js</i>`  
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