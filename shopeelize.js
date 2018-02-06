class Entity {
  constructor (type, entityObj) {
    this.type = type
    this.entityObj = entityObj
    this.keys = entityObj ? Object.keys(entityObj) : []

    this.keys.forEach(key => {
      if (Array.isArray(entityObj[key])) {
        checkEntity(entityObj[key][0])
      } else {
        checkEntity(entityObj[key])
      }
    })
  }
}

const checkId = data => {
  if (data && data.id) return true
  throw new Error('Data without id !')
}

const checkEntity = (entity, throwError = true) => {
  if (entity instanceof Entity) return true
  if (throwError) {
    throw new Error('Unknown entity !')
  }

  return false
}

const schema = { Entity }

function _normalize (originalData, entity, entityStore = {}) {
  const keys = Object.keys(originalData),
    { entityObj, type } = entity,
    { id } = originalData

  entityStore[type] = entityStore[type] || {}
  entityStore[type][id] = {}

  const curEntity = entityStore[type][id]

  keys.forEach(key => {
    let entityItem = entityObj && entityObj[key]

    // common attribute
    if (!entityItem) {
      curEntity[key] = originalData[key]

    // entity array
    } else if (Array.isArray(entityItem)) {
      curEntity[key] =
        originalData[key]
          .map(item => _normalize(item, entityItem[0], entityStore))

    // common entity
    } else {
      curEntity[key] = _normalize(originalData[key], entityItem, entityStore)
    }
  })

  return originalData.id
}

function normalize (originalData, entity) {
  checkId(originalData)
  checkEntity(entity)

  const entities = {}

  return {
    result: _normalize(originalData, entity, entities),
    entities
  }
}

function denormalize () {
  console.log('denormalize')
}

module.exports = {
  schema,
  normalize,
  _normalize,
  denormalize
}
