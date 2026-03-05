var express = require('express')
var router = express.Router()

let { dataRoles, dataUsers } = require('../utils/data')
let { GenPrefixedId, getItemById } = require('../utils/idHandler')

router.get('/', function (req, res) {
    let result = dataRoles.filter(function (e) {
        return !e.isDeleted
    })
    res.send(result)
})

router.get('/:id', function (req, res) {
    let id = req.params.id
    let role = getItemById(id, dataRoles)
    if (!role) {
        res.status(404).send({ message: 'ID NOT FOUND' })
        return
    }
    res.send(role)
})

router.get('/:id/users', function (req, res) {
    let id = req.params.id
    let role = getItemById(id, dataRoles)
    if (!role) {
        res.status(404).send({ message: 'ID NOT FOUND' })
        return
    }

    let users = dataUsers.filter(function (u) {
        return !u.isDeleted && u.role && u.role.id == id
    })
    res.send(users)
})

router.post('/', function (req, res) {
    if (!req.body || !req.body.name) {
        res.status(400).send({ message: 'NAME IS REQUIRED' })
        return
    }

    let now = new Date(Date.now())
    let newRole = {
        id: GenPrefixedId(dataRoles, 'r'),
        name: req.body.name,
        description: req.body.description,
        creationAt: now,
        updatedAt: now
    }
    dataRoles.push(newRole)
    res.send(newRole)
})

router.put('/:id', function (req, res) {
    let id = req.params.id
    let role = getItemById(id, dataRoles)
    if (!role) {
        res.status(404).send({ message: 'ID NOT FOUND' })
        return
    }

    let keys = Object.keys(req.body || {})
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(role, key)) {
            role[key] = req.body[key]
        }
    }
    role.updatedAt = new Date(Date.now())

    dataUsers.forEach(function (u) {
        if (u.isDeleted) return
        if (!u.role || u.role.id != id) return
        u.role = {
            id: role.id,
            name: role.name,
            description: role.description
        }
        u.updatedAt = new Date(Date.now())
    })

    res.send(role)
})

router.delete('/:id', function (req, res) {
    let id = req.params.id
    let role = getItemById(id, dataRoles)
    if (!role) {
        res.status(404).send({ message: 'ID NOT FOUND' })
        return
    }

    role.isDeleted = true
    role.updatedAt = new Date(Date.now())
    res.send(role)
})

module.exports = router

