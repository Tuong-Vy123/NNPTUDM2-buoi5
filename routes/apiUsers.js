var express = require('express')
var router = express.Router()

let { dataUsers, dataRoles } = require('../utils/data')
let { getItemById } = require('../utils/idHandler')

function findUser(username) {
    let result = dataUsers.filter(function (u) {
        return u.username == username && !u.isDeleted
    })
    return result.length ? result[0] : false
}

function resolveRoleFromBody(body) {
    let roleId = body && (body.roleId || (body.role && body.role.id))
    if (!roleId) return false
    return getItemById(roleId, dataRoles)
}

router.get('/', function (req, res) {
    let result = dataUsers.filter(function (e) {
        return !e.isDeleted
    })
    res.send(result)
})

router.get('/:username', function (req, res) {
    let user = findUser(req.params.username)
    if (!user) {
        res.status(404).send({ message: 'USERNAME NOT FOUND' })
        return
    }
    res.send(user)
})

router.post('/', function (req, res) {
    if (!req.body || !req.body.username) {
        res.status(400).send({ message: 'USERNAME IS REQUIRED' })
        return
    }
    let existed = dataUsers.some(function (u) {
        return u.username == req.body.username
    })
    if (existed) {
        res.status(400).send({ message: 'USERNAME ALREADY EXISTS' })
        return
    }

    let role = resolveRoleFromBody(req.body)
    if (!role) {
        res.status(404).send({ message: 'ROLE NOT FOUND' })
        return
    }

    let now = new Date(Date.now())
    let newUser = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        status: typeof req.body.status === 'boolean' ? req.body.status : true,
        loginCount: Number.isFinite(Number(req.body.loginCount)) ? Number(req.body.loginCount) : 0,
        role: {
            id: role.id,
            name: role.name,
            description: role.description
        },
        creationAt: now,
        updatedAt: now
    }

    dataUsers.push(newUser)
    res.send(newUser)
})

router.put('/:username', function (req, res) {
    let user = findUser(req.params.username)
    if (!user) {
        res.status(404).send({ message: 'USERNAME NOT FOUND' })
        return
    }

    let role = resolveRoleFromBody(req.body)
    if (req.body && (req.body.roleId || (req.body.role && req.body.role.id))) {
        if (!role) {
            res.status(404).send({ message: 'ROLE NOT FOUND' })
            return
        }
        user.role = {
            id: role.id,
            name: role.name,
            description: role.description
        }
    }

    let keys = Object.keys(req.body || {})
    for (const key of keys) {
        if (key === 'roleId' || key === 'role') continue
        if (Object.prototype.hasOwnProperty.call(user, key)) {
            user[key] = req.body[key]
        }
    }
    user.updatedAt = new Date(Date.now())
    res.send(user)
})

router.delete('/:username', function (req, res) {
    let user = findUser(req.params.username)
    if (!user) {
        res.status(404).send({ message: 'USERNAME NOT FOUND' })
        return
    }
    user.isDeleted = true
    user.updatedAt = new Date(Date.now())
    res.send(user)
})

module.exports = router

