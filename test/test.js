var exploder = require('gif-explode')
var stopmotion = require('../')
var fs = require('fs')

var video = stopmotion({
    width: 320
  , outFormat: 'webm'
  , inFormat: 'gif'
  , codec: 'libvpx'
  , crf: 22
})

try {
  fs.unlinkSync(__dirname + '/output.webm')
} catch(e){}

fs.createReadStream(__dirname + '/test.gif')
  .once('close', function() {
    video.ready()
      .pipe(fs.createWriteStream(__dirname + '/output.webm'))
      .once('close', function() {
        console.log('Should have converted test/test.gif to test/output.webm')
      })
  })
  .pipe(exploder(function(gifFrame) {
    gifFrame.pipe(video.frame())
  }))
