const { normalize, denormalize, schema } = require('./shopeelize.js')

const originalData = {
  'id': '123',
  'author': {
    'id': '1',
    'name': 'Paul'
  },
  'title': 'My awesome blog post',
  'comments': [
    {
      'id': '324',
      'commenter': {
        'id': '2',
        'name': 'Nicole'
      }
    }
  ]
}

const
  userOrginalData = {
    id: '1',
    name: 'Paul'
  },
  commentOrginalData = {
    id: '324',
    commenter: {
      id: '2',
      name: 'Nicole'
    }
  },
  articleOrginalData = {
    id: '123',
    author: userOrginalData,
    title: 'My awesome blog post',
    comments: [ commentOrginalData ]
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

const
  normalizedUser = normalize({ id: '1', name: 'Paul'}, user),
  normalizedComment = normalize({
    id: '324',
    commenter: {
      id: '2',
      name: 'Nicole'
    }
  }, comment),
  normalizedArticle = normalize(originalData, article)

test('user normalize', () => {
  expect(normalizedUser.entities.users).toEqual({
    '1': userOrginalData
  })
})

test('comment normalize', () => {
  expect(normalizedComment.entities.comments).toEqual({
    '324': {
      id: '324',
      commenter: '2'
    }
  })
})

test('article normalize', () => {
  expect(normalizedArticle.entities.articles).toEqual({
    '123': {
      id: '123',
      author: '1',
      title: articleOrginalData.title,
      comments: [ commentOrginalData.id ]
    }
  })
})

test('article with mutiple commenters normalize', () => {
  expect(normalize({
    id: '321',
    author: {
      id: '3',
      name: 'JinynagLi'
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
  }, article))
    .toEqual({
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
    })
})
