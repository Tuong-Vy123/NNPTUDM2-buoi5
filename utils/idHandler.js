module.exports = {
    GenID: function (data) {
        let ids = data.map(function (e) {
            return Number.parseInt(e.id)
        })
        return Math.max(...ids) + 1
    },
    GenPrefixedId: function (data, prefix) {
        let ids = data
            .map(function (e) {
                if (typeof e.id !== 'string') return Number.NaN
                if (!e.id.startsWith(prefix)) return Number.NaN
                return Number.parseInt(e.id.slice(prefix.length), 10)
            })
            .filter(function (n) {
                return Number.isFinite(n)
            })

        if (!ids.length) return `${prefix}1`
        return `${prefix}${Math.max(...ids) + 1}`
    },
    getItemById: function (id, data) {
        let result = data.filter(
            function (e) {
                return e.id == id && !e.isDeleted
            }
        )
        if (result.length) {
            return result[0]
        }
        return false
    }
}
