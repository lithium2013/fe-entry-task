const { normalize, denormalize, schema } = require('./shopeelize.js')

const dataSet = {
  userOriginalData: {
    id: '1',
    name: 'Paul'
  },
  commentOriginalData: {
    id: '324',
    commenter: {
      id: '2',
      name: 'Nicole'
    }
  },
  articleOriginalData: {
    id: '123',
    author: { id: '1', name: 'Paul' },
    title: 'My awesome blog post',
    comments: [{
      id: '324',
      commenter: {
        id: '2',
        name: 'Nicole'
      }
    }]
  },
  customizedOriginalData: {
    id: '321',
    author: {
      id: '3',
      name: 'JinyangLi'
    },
    title: 'Jest',
    comments: [
      {
        id: '325',
        commenter: {
          id: '3',
          name: 'JinyangLi'
        }
      },
      {
        id: '326',
        commenter: {
          id: '2',
          name: 'Nicole'
        }
      }
    ]
  },
  userNormalizedData: {
    result: '1',
    entities: {
      users: {
        '1': { id: '1', name: 'Paul' }
      }
    }
  },
  commentNormalizedData: {
    result: '324',
    entities: {
      comments: {
        '324': {
          id: '324',
          commenter: '2'
        }
      },
      users: {
        '2': {
          id: '2',
          name: 'Nicole'
        }
      }
    }
  },
  articleNormalizedData: {
    result: '123',
    entities: {
      articles: {
        '123': {
          id: '123',
          author: '1',
          title: 'My awesome blog post',
          comments: [ '324' ]
        }
      },
      users: {
        '1': { id: '1', name: 'Paul' },
        '2': { id: '2', name: 'Nicole' }
      },
      comments: {
        '324': { id: '324', 'commenter': '2' }
      }
    }
  },
  customizedNormalizedData: {
    result: '321',
    entities: {
      articles: {
        '321': {
          id: '321',
          author: '3',
          title: 'Jest',
          comments: ['325', '326']
        }
      },
      users: {
        '2': { id: '2', name: 'Nicole' },
        '3': { id: '3', name: 'JinyangLi' }
      },
      comments: {
        '325': { id: '325', commenter: '3' },
        '326': { id: '326', commenter: '2' }
      }
    }
  }
}

// Define a users schema
const user = new schema.Entity('users')

// Define your comments schema
const comment = new schema.Entity('comments', {
  commenter: user
})

// Define your article
const article = new schema.Entity('articles', {
  author: user,
  comments: [ comment ]
})

const types = ['user', 'comment', 'article', 'customized']
const schemas = [user, comment, article, article]

types.forEach((type, idx) => {
  let originalData = dataSet[`${type}OriginalData`]
  let normalizedData = dataSet[`${type}NormalizedData`]
  let entity = schemas[idx]
  let { result, entities } = normalizedData

  const org2Nor = normalize(originalData, entity)
  const nor2Org = denormalize(result, entity, entities)

  test(`${type} normalize`, () => {
    expect(org2Nor).toEqual(normalizedData)
  })

  test(`${type} denormalize`, () => {
    expect(nor2Org).toEqual(originalData)
  })
})
