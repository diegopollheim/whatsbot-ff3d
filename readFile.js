const fs = require('fs')
const path =require('path')
const pathImages = path.resolve(__dirname, 'src', 'assets')

fs.readdirSync(pathImages).forEach(file => {
    console.log(pathImages, file);
  });