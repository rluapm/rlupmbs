import express from 'express'
import session from 'express-session'
import api from './api'
import cry from 'crypto'
import helmet from 'helmet'
import cookies from 'cookie-parser'
import {JsonDB, FindCallback} from 'node-json-db'
import { Config, JsonDBConfig } from 'node-json-db/dist/lib/JsonDBConfig'

const app = express()
const pdb = new JsonDB(new Config('db',true,false))

new api.ApiInit(pdb)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({secret: 'lupm is the best package manager',
name:'uniqueSessionID',
saveUninitialized:false,
resave:false}))
app.use(helmet())
app.use(cookies())

setInterval(() =>{
    pdb.reload()
},1800000)

app.use('/api',api.r)

app.get('/',(req,res)=>{
    return res.send('hi')
})

app.get('/.well-known/brave-rewards-verification.txt',(req,res)=>{
    return res.send("This is a Brave Rewards publisher verification file.\nDomain: lupm.xyz\nToken: d79ed16cd69db0ad673be795c104f697230a35cce944fdb291be016231cdf67c")
})

app.listen(process.env.PORT || 80,()=> {
console.log('listening on port 8081')
})
