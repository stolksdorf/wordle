const isDev = process.argv.some(v=>v=='--dev');

const CreateHTML = (pageBundler, htmlPath='./index.html')=>{
	const run = ()=>{
		require('fs').writeFileSync(htmlPath, pageBundler(), 'utf8');
		console.log('Updated html', htmlPath);
	};
	pageBundler.onUpdate(run);
	run();
};
if(isDev) require('live-server').start();

/* ---- */

const Pages = require('../client');

CreateHTML(Pages.main);