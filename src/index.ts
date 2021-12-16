import express from 'express'
import session from 'express-session'
import api from './api'
import cry from 'crypto'
import helmet from 'helmet'

const app = express()
const store = new session.MemoryStore()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({secret: 'lupm is the best package manager',
name:'uniqueSessionID',
saveUninitialized:false,
resave:false,
store}))
app.use(helmet())

app.use('/api',api)

app.get('/',(req,res)=>{
    return res.send('hi')
})

app.listen(8081,()=> {
console.log('listening on port 8081')
})