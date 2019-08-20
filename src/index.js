import compressor from './image';
import {
	formatBytes,
	base64ToArrayBuffer,
	getOrientation,
	fixOrientation
} from './utils';

window.onload = function() {
	const fileInput = document.getElementById('f');
	const box = document.querySelector('.box');
	fileInput.addEventListener(
		'change',
		function() {
			const file = this.files[0];
			console.log(file);
			console.log('file size: ', formatBytes(file.size));
			box.innerHTML = '';
			// const reader = new FileReader()
			// reader.onload = function () {
			//   const base64 = this.result
			//   const imgData = base64.split(',')[1]
			//   console.log(imgData.length)
			//   console.log('imgData size: ', formatBytes(imgData.length))
			//   const buffer = base64ToArrayBuffer(base64)
			//   const orientation = getOrientation(buffer)
			//   console.log(orientation)
			//   console.log(orientation)
			//   const pic = new Image()
			//   // pic.onload = function () {
			//   //   // box.appendChild(pic)
			//   //   // const canvas = document.createElement('canvas')
			//   //   // const ctx = canvas.getContext('2d')
			//   //   // canvas.width = pic.naturalWidth
			//   //   // canvas.height = pic.naturalHeight
			//   //   // canvas.style.width = '100%'
			//   //   // canvas.style.height = 'auto'
			//   //   // canvas.style.marginTop = 10 + 'px'
			//   //   // if(orientation > 0) {
			//   //   //   fixOrientation(canvas, orientation)
			//   //   // }
			//   //   // ctx.drawImage(pic, 0, 0, pic.naturalWidth, pic.naturalHeight)
			//   //   // box.appendChild(canvas)
			//   //   // canvas.toBlob()
			//   // }
			//   pic.src = base64
			//   box.appendChild(pic)
			// }
			// reader.readAsDataURL(file)
			compressor(file, {}, function(base64) {
				console.log('compressor call');
				const img = new Image();
				img.clssName = 'haha';
				img.src = base64;
				box.appendChild(img);
			});
		},
		false
	);
};
