const {x, cx, comp, css} = require('../../libs');

global.css.Generator = css`
	.Generator{
		text-align: left;
		width: 250px;
		//border: 1px solid red;
		margin-bottom: 1em;

		input{
			background-color: white;
			width: 100%;
			border-color: black;
			color: black;
		}

		label{
			//font-weight:800;
			font-size: 0.75em;
			//text-transform:uppercase;
			display: block;
		}

		textarea{
			width: 100%;
			resize: none;
			color: black;
			background-color: white;
		}

		a{
			color: blue;
			font-size:0.8em;
		}
	}
`;

const Generator = comp(function(){
	const [word, setWord] = this.useState('');
	const [hint, setHint] = this.useState('');

	let code = btoa(word + (hint ? '|' + hint : ''));
	let url = '';
	if(typeof window !== 'undefined'){
		url = window.location.origin + window.location.pathname + '?' + code;
	}
	return x`<div class='Generator'>
		<label>Word</label>
		<input type='text' oninput=${(evt)=>setWord(evt.target.value)} value=${word}></input>
		<label>Title</label>
		<textarea oninput=${(evt)=>setHint(evt.target.value)} value=${hint}></textarea>
		<a href=${url}>${url}</a>
	</div>`
});

module.exports = Generator;