const express = require('express')
const path = require('path')
const app = express()
const port = 5000


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



function home (req, res) {
    res.render('index')
}
function testimonial (req, res) {
    res.render('testimonial')
}
function contactMe (req, res) {
    res.render('contact-me')
}
function myProject (req, res) {
    const { id } = req.params
    const data = {
        id,
        title : "Mencari Banteng Merah Apps"
    }
    res.render('my-project-detail', {data})
}
function formMyProject (req, res) {
    res.render('add-my-project')
}
function addMyProject (req, res) {
    const { title, start, end, desc, node, react, next, script} = req.body
    console.log(title)
    console.log(start)
    console.log(end)
    console.log(desc)
    console.log(node)
    console.log(react)
    console.log(next)
    console.log(script)
}

app.listen(port, () => {
    console.log (`Server running on port ${port}`)
})