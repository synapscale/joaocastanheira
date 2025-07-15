// jest.setup.js
require('@testing-library/jest-dom');

// Setup environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000/ws'

// ZERO MOCKS - usar sistemas reais apenas
console.log('🚫 Jest setup: NO MOCKS - usando sistemas reais apenas')
