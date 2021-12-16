import express from 'express'
import {JsonDB, FindCallback} from 'node-json-db'
import cry from 'crypto'

let pdb:JsonDB
const r = express.Router()

class ApiInit {
    constructor(db: JsonDB){
        pdb = db
    }
}

interface PackageRecv {
    name: string;
    version: string;
    source: string;
    tags?: string[];
    readme?: string;
}

r.get('/packages/:id', async (req, res) => {
    let pckid = req.params.id
    let pck = await pdb.getData(`/packages/${pckid}/info`)
    if (!pck) return res.status(404).send('Unable to find package')

    return res.send(pck)
})

r.get('/packages/:id/source', async (req, res) =>{
    let pckid = req.params.id
    let pck = await pdb.getData(`/packages/${pckid}/source`)
    if (!pck) return res.status(404).send('Unable to find package')

    return res.send(pck)
})

r.post('/packages', async (req, res) => {
    // @ts-ignore
    let cookies = req.cookies
    if (!(cookies.auth)) return res.status(403).send({code:403, message:'Not logged in.'})
    let user

    user = pdb.getData(`/users/${cookies.auth}`).username

    if (!user) return res.status(403).send({code:403, message:'You are not signed up or logged in.'})

    let body = req.body
    if (body.package) {
        let pck = body.package
        if (!(pck.version) || !(pck.name) || !(pck.source)) return res.status(406).send({ code: 406,message:'Cannot find the required fields.' })
        pdb.push(`/packages/${pdb.getData('/pcknum')+1}/info`,{
            id: pdb.getData('/pcknum')+1,
            name: pck.name,
            version: pck.version,
            tags: pck.tags ? pck.tags : undefined,
            readme: pck.readme ? pck.readme : undefined,
            author:user
        })
        pdb.push(`/packages/${pdb.getData('/pcknum')+1}/source`,pck.source)
    }

    res.send(pdb.getData(`/packages/${pdb.getData('/pcknum')+1}`))
    pdb.push(`/pcknum`,pdb.getData('/pcknum')+1)
    return true
})

r.post('/users/signup', (req, res) => {
    if (!(req.body.password) || !(req.body.username)) return res.status(406).send({code:406,message:'Cannot find the required fields.'})
    let passhash = cry.createHash('sha256').update(req.body.password).digest('hex')
    let authhash = cry.createHash('sha256').update(req.body.password+req.body.username).digest('hex')
    pdb.push(`/users/${authhash}`, {password:passhash, username:req.body.username})
    // @ts-ignore
    req.session.auth = authhash
    return res.send({success: true, message:'Successfully signed in!',session:req.session})
})

r.post('/users/login', (req, res) => {
    if (!(req.body.password) || !(req.body.username)) return res.status(406).send({code:406,message:'Cannot find the required fields.'})
    let authhash = cry.createHash('sha256').update(req.body.password+req.body.username).digest('hex')
    let user
    try{
        user = pdb.getData(`/users/${authhash}`)
    } catch (err){
        return res.status(401).send({code:401,message:'Invalid user credentials'})
    }
    //@ts-ignore
    req.session.auth = authhash
    return res.send({success: true, message:'Successfully logged in!',session:req.session})
})

export default {r, ApiInit}