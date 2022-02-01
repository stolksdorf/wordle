const isDev = process.argv.some(v=>v=='--dev');
const pack = require('./pico-pack.js');
const xo = require('./xo.js');
const fs = require('fs');


const Base64 = {
	MIMETypes : {
		'.ico'   : 'image/x-icon',
		'.png'   : 'image/png',
		'.jpg'   : 'image/jpeg',
		'.jpeg'  : 'image/jpeg',
		'.wav'   : 'audio/wav',
		'.mp3'   : 'audio/mpeg',
		'.svg'   : 'image/svg+xml',
		'.gif'   : 'image/gif',
		// '.ttf'   : 'application/x-font-ttf',
		// '.otf'   : 'application/x-font-opentype',
		// '.woff'  : 'application/font-woff',
		// '.woff2' : 'application/font-woff2',
	},
	transform : (code, filepath, global)=>{
		const id = filepath.replace(process.cwd(), '').slice(1).replace(/[^a-zA-Z0-9]/g, '_');
		if(!global.assets[id]){
			const base64 = Buffer.from(require('fs').readFileSync(filepath)).toString('base64');
			const type = Base64.MIMETypes[require('path').extname(filepath)] || 'text/plain';
			global.assets[id] = `data:${type};base64,${base64}`;
		}
		return `module.exports={b64:global.assets.${id}, var:'var(--${id})'}`;
	},
	bundle : (result)=>{
		return `<style>:root{
			${Object.entries(result.global.assets).map(([id, data])=>`\t--${id}:url('${data}');`).join('\n')}
			}</style>
		<script>
			window.assets={};
			const styleVars = getComputedStyle(document.querySelector(":root"));
			${Object.keys(result.global.assets)
				.map((id)=>`window.assets.${id}=styleVars.getPropertyValue('--${id}').slice(5,-2);`)
				.join('\n')}
		</script>`;
	}
};

const Fonts = {
	transform : (code, filepath, global)=>{
		const id = filepath.replace(process.cwd(), '').slice(1).replace(/[^a-zA-Z0-9]/g, '_');
		global.fonts = global.fonts || {};

		const base64 = Buffer.from(require('fs').readFileSync(filepath)).toString('base64');
		const name = require('path').basename(filepath, '.ttf');

		global.fonts[id] = `@font-face{
	font-family: '${name}';
	src: url('data:application/x-font-ttf;base64,${base64}') format('truetype');
}`;

		return `module.exports='${name}';`;
	},
	bundle : (result)=>{
		return `<style>${Object.values(result.global.fonts).join('\n')}</style>`
	}
}

const CSS = {
	transform : (code, filepath, global)=>{
		const id = filepath.replace(process.cwd(), '').slice(1).replace(/[^a-zA-Z0-9]/g, '_');
		global.css[id] = code;
		return `module.exports='';`;
	},
	bundle : (result)=>{
		return `<script>window.css={};</script><style>${Object.values(result.global.css).join('\n')}</style>`;
	}
};


const bundle = (pagePath, opts={})=>{
	let result, watch, updateListener;
	if(isDev){
		console.log('-- In Watch Mode --');
		watch = (res)=>{
			result=res;
			if(updateListener) updateListener();
		}
	}

	result = pack(pagePath, {
		callOffset : 1,
		watch,
		global : { head : {}, css : {}, assets : {}, fonts: {}},
		transforms:{
			'.ttf' : Fonts.transform,
			'.css' : CSS.transform,
			'*'    : Base64.transform,
		},
		...opts
	});
	const bundler = (...args)=>{
		return `<!DOCTYPE html><html>
<head>
	<script>window.head={};</script>${Object.values(result.global.head).join('\n')}
	${Base64.bundle(result)}
	${Fonts.bundle(result)}
	${CSS.bundle(result)}
</head>
<body>${xo.render(result.export(...args))}</body>
<script>${result.bundle}</script>
<script>xo.render(window.main(${args.map(x=>JSON.stringify(x)).join(', ')}), document.body.children[0]);</script>
</html>`;
	};
	bundler.onUpdate = (func)=>updateListener=func;
	return bundler;
};


module.exports = bundle;
