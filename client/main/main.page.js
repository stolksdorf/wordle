const {x, cx, comp, css} = require('../../libs');

const Party = require('./party.js');

global.head.title = `<title>Wordle - Bahbeeeeeee</title>`;

require('../../libs/reset.css');
require('../../libs/zenburn.css');

global.css.Main = css`
	body{
		background-color: white;
		color: black;
		font-family: Arial;
	}

	.Main{
		position: relative;

		aside{
			text-align: right;
			position: absolute;
			right: 0px;
			top : 0px;

			button{
				display: block;
			}

			textarea{
				background-color: white;
			}

			.generator{
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
				}

				a{
					color: blue;
					font-size:0.8em;
				}
			}

			textarea.results{
				resize: none;
				text-align: right;
				border: none;

				height:14em;
			}
		}


		.content{
			text-align: center;

			h3{
				font-size: 2em;
				margin-bottom: 1em;
			}
		}

		.row{

			.letter{
				font-size : 3em;

				border         : 1px solid grey;
				display        : inline-block;
				vertical-align : top;
				text-align     : center;
				width          : 2em;
				height         : 2em;
				line-height    : 2em;
				text-transform : uppercase;
				font-weight    : 600;

				margin-right: -1px;
				margin-bottom: -1px;

				&.y{
					background-color: var(--green);
					color: white;
				}
				&.c{
					background-color: var(--yellow);
					color: white;
				}
				&.n{
					background-color: var(--grey);
					color: white;
				}
			}
		}
	}
`;

const times = (n,fn)=>{let res=[];for(let i=0;i<n;i++){res.push(fn(i))};return res;};

const FiveWordList = require('./5_word_list.js');

const getWordOfDay = ()=>{
	const now = (new Date());
	const idx = (now.getYear() + now.getMonth()*100 + now.getDay()) % FiveWordList.length;
	return FiveWordList[idx];
};


const Row = (len, word, status=[], _class='')=>{
	return x`<div class=${`row ${_class}`}>
		${times(len, (idx)=>{
			return x`<div class=${cx('letter', status[idx])}>
				${word[idx]||''}
			</div>`;
		})}
	</div>`
};

const getTargetFromURL = ()=>{
	const res = window.location.search.slice(1);
	if(!res) return {};

	const [target, hint] = atob(res).split('|');
	return {target, hint: hint||''};
};



const Generator = comp(function(){
	const [word, setWord] = this.useState('');
	const [hint, setHint] = this.useState('');

	let code = btoa(word + (hint ? '|' + hint : ''));
	let url = '';
	if(typeof window !== 'undefined'){
		url = window.location.origin + '?' + code;
	}
	return x`<div class='generator'>
		<label>Word</label>
		<input type='text' oninput=${(evt)=>setWord(evt.target.value)} value=${word}></input>
		<label>Title</label>
		<textarea oninput=${(evt)=>setHint(evt.target.value)} value=${hint}></textarea>
		<a href=${url}>${url}</a>
	</div>`


});

const getEmojiResult = (guesses)=>{
	const mapping = {y : '🟩',c : '🟨',n : '⬜'};
	return guesses.map(([word, status])=>{
		return status.split('').map(code=>mapping[code]).join('');
	}).join('\n');
};


const Main = comp(function(){
	const [target, setTarget] = this.useState('');
	const [hint, setHint] = this.useState('');

	const [guesses, setGuesses] = this.useState([]);
	const [current, setCurrent] = this.useState('');
	const [foobar, setFoobar] = this.useState();


	const [showGenerator, setShowGenerator] = this.useState(false);
	const [showResults, setShowResults] = this.useState(false);
	const [hasWon, setHasWon] = this.useState(false);


	this.useEffect(()=>{
		const {target, hint} = getTargetFromURL();
		if(target){
			setTarget(target.toLowerCase());
			setHint(hint);
		}else{
			setTarget(getWordOfDay().toLowerCase());
			setHint('Just your daily wordle');
		}
	}, []);


	const addGuess = (word)=>{
		const res = times(target.length, (idx)=>{
			if(target[idx] == word[idx]) return 'y';
			if(target.indexOf(word[idx]) !== -1) return 'c';
			return 'n';
		}).join('');

		setGuesses(guesses.concat([[word, res]]));
		setCurrent('');

		if(res.split('').every(x=>x=='y')){
			win();
		}
	};

	const handleKey = (evt)=>{
		if(evt.ctrlKey) return;
		if(hasWon) return;

		if(evt.key == 'Enter' && current.length == target.length){
			addGuess(current);
		}else if(evt.key == 'Backspace'){
			setCurrent(current.slice(0, -1));
		}else if(evt.key.length === 1 && current.length < target.length){
			setCurrent(current + evt.key.toLowerCase());
		}
	};

	const win = ()=>{
		Party.confetti(document.querySelector('.row.current'))
		setShowResults(true);
		setHasWon(true);
	}

	if(typeof document !== 'undefined') document.onkeydown = handleKey;

	return x`<div class='Main'>
		<div class='content'>
			${hint && x`<h3 class='hint'>${hint}</h3>`}
			${guesses.map(([word, status])=>Row(target.length, word, status))}
			${Row(target.length, current, [], 'current')}
			${times(target.length - guesses.length, ()=>Row(target.length, ''))}
		</div>

		<aside>
			<button onclick=${()=>setShowGenerator(!showGenerator)}>Make your Own</button>
			${showGenerator && Generator()}

			<button onclick=${()=>setShowResults(!showResults)}>${showResults ? 'Hide' : 'Show'} Results</button>
			${showResults && x`<textarea class='results'>${getEmojiResult(guesses)}</textarea>`}
		</aside>
	</div>`;
});

module.exports = Main;