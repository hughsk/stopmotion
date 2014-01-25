# stopmotion [![Flattr this!](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=hughskennedy&url=http://github.com/hughsk/stopmotion&title=stopmotion&description=hughsk/stopmotion%20on%20GitHub&language=en_GB&tags=flattr,github,javascript&category=software)[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Uses [ffmpeg](http://www.ffmpeg.org/) multiple image buffer frames into a
video file. Note that you'll need it
[installed](http://www.ffmpeg.org/download.html)
on your system to get this working.

## Usage ##

[![stopmotion](https://nodei.co/npm/stopmotion.png?mini=true)](https://nodei.co/npm/stopmotion)

### `video = require('stopmotion')([options])` ###

Creates a video instance, which accepts the following `options`:

* `width`: the final width of the video.
* `height`: the final height of the video.
* `format`: the output's container format, e.g. `avi`. Defaults to `webm`.
* `inCodec`: the input image codec, e.g. `png`. Defaults to `gif`.
* `outCodec`: the output video codec. Defaults to `libvpx`
* `crf`: the [constant rate factor](http://slhck.info/crf.html). The lower
  this is, the better the output quality. Defaults to 23.

All of the above are optional.

### `video.frame()` ###

Creates a writeable stream for you to pipe a single frame buffer to. Note that
it should match the video's `format` option. Frames will be ordered by when you
created their stream.

``` javascript
var video = require('stopmotion')()
var fs = require('fs')

fs.createReadStream('frame-001.gif')
  .pipe(video.frame())
```

### `video.ready()` ###

Once you've created all of your frames, use this method to encode the final
result and get it back as a readable stream.

``` javascript
var video = require('stopmotion')()
var fs = require('fs')

;['frame-001.gif'
, 'frame-002.gif'
, 'frame-003.gif'
, 'frame-004.gif'
, 'frame-005.gif'
, 'frame-006.gif'
].forEach(function(filename) {
  fs.createReadStream(filename)
    .pipe(video.frame())
})

video.ready().pipe(
  fs.createWriteStream('frames.webm')
)
```

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/stopmotion/blob/master/LICENSE.md) for details.
