import {
  toBytes,
  base64ToArrayBuffer,
  blobToBase64,
  arrayBufferToBlob,
  getOrientation,
  fixOrientation,
} from "./utils";

const isPercent = value => /\%$/.test(value)

const getCompressorOptions = (options) => {
  const defaults = {
    width: '100%',     // auto or percentage or number
    height: 'auto',    // auto or percentage or number
    minWidth: '60%',
    minHeight: 'auto',
    quality: 75,
    minQuality: 60,
    error: '30kb',
    maxSize: '800kb',
    output: 'base64'
  }
  const pattern = /^\+?((?:\.\d+)|(?:\d+(?:\.\d+)?))\s*\%$/i
  const conf = Object.assign({}, defaults, options)
  const maxSize = toBytes(conf.maxSize) || null
  const error = toBytes(conf.error) || toBytes('30kb')
  let quality = parseFloat(conf.quality) || defaults.quality
  let mq = parseFloat(conf.minQuality) || defaults.minQuality
  let output = 'base64'
  quality = (quality < 0 ? 0 : (quality > 100 ? 100 : quality)) / 100
  mq = (mq < 0 ? 0 : (mq > 100 ? 100 : mq)) / 100
  if (typeof conf.output === 'string' && conf.output.trim() === 'blob') {
    output = 'blob'
  }
  const formatter = (val, defaultVal) => {
    let float = parseFloat(val)
    if (!float) {
      return 'auto'
    }
    if (pattern.test(val)) {
      return (float < 0 ? 0 : (float > 100 ? 100 : float)) + '%'
    }
    return float
  }
  let width = formatter(conf.width)
  let height = formatter(conf.height)
  let minWidth = formatter(conf.minWidth)
  let minHeight = formatter(conf.minHeight)
  return {
    quality,
    output,
    maxSize,
    error,
    minQuality: mq,
    width,
    height,
    minWidth,
    minHeight
  }
}

const qCompress = (callback, canvas, mime, maxSize, error, min = 0, max = 1) => {
  console.group('qCompress')
  const quality = min + (max - min) / 2
  const threshold = 0.01
  const delta = max - min
  console.log('canvas: ', canvas)
  console.log('mime: ', mime)
  // console.log('conf: ', conf)
  console.log('min: ', min)
  console.log('max: ', max)
  console.log('delta: ', delta)
  console.log('quality: ', quality)
  const handler = blob => {
    console.group('qCompress handler')
    console.log('blob: ', blob)
    blob && console.log('size: ', formatBytes(blob.size))
    console.groupEnd()
    if (Math.abs(maxSize - blob.size) <= error || delta <= threshold) {
      return callback(blob)
    }
    if (blob.size > maxSize) {
      qCompress(callback, canvas, mime, maxSize, error, min, quality)
    } else {
      qCompress(callback, canvas, mime, maxSize, error, quality, max)
    }
  }
  canvas.toBlob(handler, mime, quality)
  console.groupEnd()
}

const sCompress = (blob, cb, img, canvas, ctx, mime, conf, min, max) => {
  console.group('sCompress')
  const threshold = 0
  const delta = max - min
  const ratio = canvas.width / canvas.height
  const point = Math.floor(min + (max - min) / 2)
  if (ratio < 0) {
    canvas.height = point
    canvas.width = Math.floor(point * ratio)
  } else {
    canvas.width = point
    canvas.height = Math.floor(point / ratio)
  }
  // canvas.width = width
  // canvas.height = Math.floor(width / ratio)
  drawImage(canvas, img)
  console.log('img: ', img)
  console.log('canvas: ', canvas)
  console.log('min: ', min)
  console.log('max: ', max)
  console.log('delta: ', delta)
  console.log('canvas.width: ', canvas.width)
  console.log('canvas.height: ', canvas.height)
  const handler = blob => {
    console.group('sCompress handler')
    console.log('blob: ', blob)
    blob && console.log('size: ', formatBytes(blob.size))
    console.groupEnd()
    if (Math.abs(conf.maxSize - blob.size) <= conf.error || delta <= threshold) {
      return callback(blob)
    }
    if (blob.size > maxSize) {
      sCompress(callback, img, canvas, fileType, conf, min, point)
    } else {
      sCompress(callback, img, canvas, fileType, conf, point, max)
    }
  }
  canvas.toBlob(handler, fileType)
  console.groupEnd()
}

const qcToBlobHandler = (canvas, image, conf, output) => {
  const {maxSize, error, width, height} = conf
  const isFull = val => isPercent(val) && parseInt(val, 10) === 10
  return function handler(blob) {
    console.log('qc blob: ', blob)
    if (Math.abs(blob.size - maxSize) <= error) {
      return output(blob)
    }
    if (isFull(width) && isFull(height)) {
      return output(blob)
    }
    output(blob)
    // sCompress(output, this, canvas, fileType, maxSize, error, smin, width)
  }
}

export default function compressor(file, options, callback) {
  console.log('compressor: ', file, options, callback)
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  const mime = file.type
  const accept = /^image\/(jpe?g|png)$/i
  const exec = data => typeof callback === 'function' && callback(data)
  if (!Boolean(options) || !accept.test(mime)) {
    exec(file)
  }
  const conf = getCompressorOptions(options)
  const isPng = /^image\/png$/i.test(mime)
  const fileName = file.name
  const lastModified = file.lastModified
  console.log('compressor conf: ', conf)
  const output = blob => {
    blob.name = fileName
    blob.lastModified = lastModified
    if (conf.output === 'blob') {
      exec(blob)
    } else {
      blobToBase64(blob, exec)
    }
  }
  const reader = new FileReader()
  reader.onload = function () {
    const base64 = this.result
    const buffer = base64ToArrayBuffer(base64)
    const orientation = getOrientation(buffer)
    const image = new Image()
    image.onload = function () {
      const {width, height} = conf
      const w = this.naturalWidth
      const h = this.naturalHeight
      const r = w / h
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let cw, ch
      if (width === 'auto' && height === 'auto') {
        cw = w
        ch = h
      } else if (width === 'auto') {
        ch = Math.floor(isPercent(height) ? h * parseFloat(height) : height)
        cw = Math.floor(ch * r)
      } else if (height === 'auto') {
        cw = Math.floor(isPercent(width) ? w * parseFloat(width) : width)
        ch = Math.floor(cw / r)
      } else {
        cw = Math.floor(isPercent(width) ? w * parseFloat(width) : width)
        ch = Math.floor(isPercent(height) ? h * parseFloat(height) : height)
      }
      canvas.width = cw
      canvas.height = ch
      if (orientation > 0) {
        fixOrientation(canvas, ctx, orientation)
      }
      console.log('compressor canvas: ', canvas)
      console.log('compressor image: ', image)
      ctx.drawImage(image, 0, 0, cw, ch)
      if (!conf.maxSize) {
        canvas.toBlob(output, mime, conf.quality)
        return
      }
      if (file.size <= (conf.maxSize + conf.error)) {
        return output(arrayBufferToBlob(buffer))
      }
      const fn = qcToBlobHandler(canvas, this, conf, output)
      // console.log('compressor qcToBlobHandler: ', handler)
      qCompress(output, canvas, mime, conf.maxSize, conf.error, conf.minQuality, 1)
      // callback, canvas, mime, conf, min = 0, max = 1
    }
    image.src = base64
  }
  reader.readAsDataURL(file)
}
