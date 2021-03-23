const express = require('express');
const path = require('path');
const port = 3000;
const app = express();

app.use(express.static(path.resolve(__dirname, 'dist')));

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'dist/index.html'));
});

app.listen(port);
