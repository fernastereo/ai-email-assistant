const app = require('./src/app')
const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`🚀 AI Email Assistant API running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
})