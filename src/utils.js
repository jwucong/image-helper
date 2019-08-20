export const getType = value => {
	return Object.prototype.toString.call(value).slice(8, -1);
};

export const canvasSupport = () => {
  const canvas = document.createElement('canvas')
  if(!canvas) {
    return false
  }
  if(typeof canvas.getContext !== 'function') {
    return false
  }
  if(typeof canvas.toBlob !== 'function') {
    return false
  }
  const ctx = canvas.getContext('2d')
  if(!ctx) {
    return false
  }
  if(typeof ctx.drawImage !== 'function') {
    return false
  }
  return true
}

export const getPower = unit => {
  const units = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];
  const size = units.length
  for (let i = 0; i < size; i++) {
    const pattern = '^' + units[i] + (i === 0 ? '(?:yte)' : 'b') + '?$'
    const reg = new RegExp(pattern, 'i')
    if (reg.test(unit)) {
      return i
    }
  }
  return -1
}

export const toBytes = size => {
  const base = 1000
  const reg = /^\s*\+?((?:\.\d+)|(?:\d+(?:\.\d+)?))\s*([a-z]*)\s*$/i;
  const p = reg.exec(size)
  if (!p) {
    return NaN
  }
  const value = parseFloat(p[1])
  const power = getPower(p[2] || 'B')
  if (Number.isNaN(value) || value < 0 || power < 0) {
    return NaN
  }
  return Math.ceil(value * Math.pow(base, power))
}

export const formatBytes = bytes => {
  if (Number.isNaN(parseInt(bytes)) || bytes < 0) {
    return NaN
  }
  const base = 1000
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB']
  const e = Math.floor(Math.log(bytes) / Math.log(base))
  const size = Math.ceil(bytes / Math.pow(base, e))
  return e < units.length ? size + units[e] : NaN
}

export const base64ToArrayBuffer = base64 => {
  const str = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
  const binary = atob(str);
  const size = binary.length;
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

export const arrayBufferToBlob = (buffer, type) => {
  return new Blob([buffer], {type})
}

export const blobToBase64 = (blob, callback) => {
  const reader = new FileReader()
  reader.onload = function () {
    callback(this.result)
  }
  reader.readAsDataURL(blob)
}

export const getOrientation = buffer => {
  // -2 not jpeg
  // -1 not defined
  const view = new DataView(buffer);
  if (view.getUint16(0, false) != 0xFFD8) {
    return -2
  }
  const size = view.byteLength
  let offset = 2;
  while (offset < size) {
    if (view.getUint16(offset + 2, false) <= 8) {
      return -1
    }
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker == 0xFFE1) {
      if (view.getUint32(offset += 2, false) != 0x45786966) {
        return -1;
      }
      const little = view.getUint16(offset += 6, false) == 0x4949;
      offset += view.getUint32(offset + 4, little);
      const tags = view.getUint16(offset, little);
      offset += 2;
      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
          return view.getUint16(offset + (i * 12) + 8, little)
        }
      }
    } else if ((marker & 0xFF00) != 0xFF00) {
      break;
    } else {
      offset += view.getUint16(offset, false);
    }
  }
  return -1;
}

export const fixOrientation = (canvas, ctx, orientation) => {
  const width = canvas.width
  const height = canvas.height
  if (orientation > 4) {
    canvas.width = height
    canvas.height = width
  }
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      ctx.transform(1, 0, 0, 1, 0, 0);
  }
}
