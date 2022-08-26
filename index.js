const express = require('express')
const app = express()
const port = 8000

app.set('view engine', 'hbs')
app.use('/assets', express.static(__dirname + '/assets'))
app.use(express.urlencoded({extended: false}))
const db = require('./connection/db')

let isLogin = true;
let isTrue = true;


app.get('/', (req, res) => { 
  
  db.connect((err, client, done) => {
    if(err) throw err

    client.query('SELECT * FROM tb_projects ORDER BY id DESC', (err, result) => {
      if(err) throw err

      // console.table(result.rows);
      let dataResult = result.rows

      let dataMapping = dataResult.map((res) => {
        return {
          ...res,
          duration: getTime(res.start_date, res.end_date),
        }
      })

      res.render('index', {dataResult : dataMapping, isTrue})
    })
  })

})

// Contact
app.get('/contact', (req, res) => {
  res.render('contact')
})

// Project
app.get('/project', (req, res) => {
  res.render('project')
})


app.post('/project', (req, res) => {
  let {
   inputName: name,
   inputStartDate: sDate,
   inputEndDate: eDate,
   inputDesc: desc,
   bootStrap : bootstrap,
   reactJs : react,
   laravel : laravel,
   nodeJs : node
  } = req.body

  db.connect((err, client, done) => {
    if(err) throw err

    let queryData = `INSERT INTO public.tb_projects(name, start_date, end_date, description, technologies)
      VALUES ('${name}', '${sDate}', '${eDate}', '${desc}', '{"${node}", "${laravel}", "${react}", "${bootstrap}"}');`

    client.query(queryData, (err, result) => {
      if(err) throw err
      res.redirect('/')
    })
  })

})

// Delete
app.get('/delete-project/:id', (req, res) => {
  let id = req.params.id

  db.connect((err, client, done) => {
    if(err) throw err

    let queryData = `DELETE FROM public.tb_projects WHERE id=${id};`
    client.query(queryData, (err, result) => {
      if(err) throw err
      res.redirect('/')
    })
  })
})


// Edit 
app.get('/edit-project/:id', (req, res) => {
  let id = req.params.id

  db.connect((err, client, done) => {
    if(err) throw err

    let queryData = `SELECT * FROM tb_projects WHERE id=${id}`
    client.query(queryData, (err, result) => {
      if(err) throw err

      let resultRows = result.rows

      let dataRows = {
        name: resultRows[0].name,
        desc: resultRows[0].description,
        sDate: getStart(resultRows[0].start_date),
        eDate: getEnd(resultRows[0].end_date)
      }
      res.render('edit-project', {dataRows, id})
    })
  })

})

app.post('/edit-project/:id', (req, res) => {
  let id = req.params.id
  let {
    inputName: name,
    inputStartDate: sDate,
    inputEndDate: eDate,
    inputDesc: desc,
    bootStrap : bootstrap,
    reactJs : react,
    laravel : laravel,
    nodeJs : node
   } = req.body

  db.connect((err, client, done) => {
    if(err) throw err



    let queryData = `UPDATE public.tb_projects
    SET name='${name}', start_date='${sDate}', end_date='${eDate}', description='${desc}', technologies='{"${node}", "${laravel}", "${react}", "${bootstrap}"}'
  WHERE id=${id};`

    client.query(queryData, (err, result) => {
      if(err) throw err

      res.redirect('/')
    })
  })
})


// Detail
app.get('/detail/:id', (req, res) => { 
  let id = req.params.id

  db.connect((err, client, done) => {
    if(err) throw err

    let queryScript = `SELECT * FROM public.tb_projects WHERE id=${id}` 

    client.query(queryScript, (err, result) => {
      if(err) throw err

      let dataRows = result.rows
      let dataProject = dataRows.map((res) => {
        return{
          ...res,
          duration:getTime(res.start_date, res.end_date) ,
          startDate: getStart(res.start_date),
          endDate: getEnd(res.end_date),
          technoNode: res.technologies[0],
          technoLaravel: res.technologies[1],
          technoReact: res.technologies[2],
          technoBoots: res.technologies[3]
        }
      })
      res.render('detail', {dataRows : dataProject[0]})
    })
  })
})


// Function GetTime
const getTime = (start,end) => {

  let date1 = new Date(start)
  let date2 = new Date(end)
  let time = Math.abs(date2 - date1)
  let days = Math.floor(time / (1000 * 60 * 60 * 24))

  return `${days} hari`
  
}

function getStart(start) {
  let d = new Date(start),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

if (month.length < 2) 
  month = '0' + month;
if (day.length < 2) 
  day = '0' + day;

return [year, month, day].join('-');
} 

function getEnd(end) {
  let d = new Date(end),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

if (month.length < 2) 
  month = '0' + month;
if (day.length < 2) 
  day = '0' + day;

return [year, month, day].join('-');
} 


app.listen(port, () => {
  console.log(`Server Running on Port ${port}`)
})
