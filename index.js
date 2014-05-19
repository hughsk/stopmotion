var tmp = require('quick-tmp')('stopmotion')
var spawn = require('child_process').spawn
var streamify = require('streamify')
var fs = require('graceful-fs')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports = StopMotion

function StopMotion(options) {
  if (!(this instanceof StopMotion)) return new StopMotion(options)

  options = options || {}

  this.output = streamify()

  this.width = (+options.width|0) || -1
  this.height = (+options.height|0) || -1
  this.format = String(options.format || 'webm')
  this.inCodec = String(options.inCodec || 'gif')
  this.outCodec = String(options.outCodec || 'libvpx')
  this.crf = String(options.crf || '23')

  this._dirname = tmp()
  this._pending = 0
  this._frames = 0
  this._started = false
  this._prepared = false
  this._writing = false
  this._prefix = path.join(
      this._dirname
    , 'stop-motion.'
  )

  mkdirp.sync(this._dirname)
}

StopMotion.prototype.frame = function() {
  var self = this
  var filename = path.resolve(
    self._prefix + pad(self._frames++, 8)
  )

  self._started = true
  self._pending += 1

  return fs
    .createWriteStream(filename)
    .once('close', function() {
      self.check(self._pending -= 1)
    })
}

StopMotion.prototype.ready = function() {
  this.check(this._prepared = true)
  return this.output
}

StopMotion.prototype.check = function() {
  if (
     this._writing  ||
    !this._prepared ||
    !this._started  ||
     this._pending
  ) return

  this.check = function(){}
  var stderr = ''
  var self = this

  var ps = spawn('ffmpeg', [
    // input
      '-f',      'image2'
    , '-vcodec', this.inCodec
    , '-i',      this._prefix + '%08d'

    // output
    , '-f',      this.format
    , '-vf',     'scale='+this.width+':'+this.height
    , '-vcodec', this.outCodec
    , '-crf',    this.crf
    , '-' // output to stdout
  ])

  this.output.resolve(ps.stdout)

  ps.once('exit', function(code) {
    if (code === 0) return

    self.output.emit('error', new Error(
      'Invalid status code: ' + code + '\n' + stderr
    ))
  })

  ps.stderr.on('data', function(data) {
    stderr += data
  })
}

function pad(n, digits) {
  n = String(n)
  while (n.length < digits) n = '0' + n
  return n
}
