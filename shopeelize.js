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

const resolveData = (originalData, entity, entityStore = {}) => {
  const keys = Object.keys(originalData)
  const { entityObj, type } = entity
  const { id } = originalData

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
          .map(item => resolveData(item, entityItem[0], entityStore))

    // common entity
    } else {
      curEntity[key] = resolveData(originalData[key], entityItem, entityStore)
    }
  })

  return originalData.id
}

const normalize = (originalData, entity) => {
  checkId(originalData)
  checkEntity(entity)

  const entities = {}

  return {
    result: resolveData(originalData, entity, entities),
    entities
  }
}

const denormalize = (id, entity, entities) => {
  checkEntity(entity)

  const originalData = {}
  const { entityObj } = entity

  let dataItem

  for (let key in entities) {
    if (entities[key][id]) {
      dataItem = entities[key][id]
      break
    }
  }

  for (let key in dataItem) {
    let val = dataItem[key]

    // common attribute
    if (!entityObj || !entityObj[key]) {
      originalData[key] = val

    // entity array
    } else if (Array.isArray(entityObj[key])) {
      originalData[key] = val.map(id => denormalize(id, entityObj[key][0], entities))

    // common entity
    } else {
      originalData[key] = denormalize(val, entityObj[key], entities)
    }
  }

  return originalData
}

module.exports = {
  schema,
  normalize,
  denormalize
}
