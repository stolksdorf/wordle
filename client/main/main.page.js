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
		padding-bottom: 2em;

		aside{
			text-align: right;
			position: absolute;
			right: 0px;
			top : 0px;

			button{
				display: block;
			}
		}

		.Keyboard{
			margin-top: 1em;
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


const Keyboard = require('./keyboard.js');
const Generator = require('./generator.js');
const Share = require('./share.js');



const Main = comp(function(){
	const [target, setTarget] = this.useState('');
	const [hint, setHint] = this.useState('');

	const [guesses, setGuesses] = this.useState([]);
	const [current, setCurrent] = this.useState('');

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
		addKeyPress(evt.key);
	};

	const addKeyPress = (key)=>{
		if(hasWon) return;
		if(key == 'Enter' && current.length == target.length){
			addGuess(current);
		}else if(key == 'Backspace'){
			setCurrent(current.slice(0, -1));
		}else if(key.length === 1 && current.length < target.length){
			setCurrent(current + key.toLowerCase());
		}
	}

	const win = ()=>{
		Party.confetti(document.querySelector('.row.current'), {
			count: 100
		})
		setShowResults(true);
		setHasWon(true);
	}

	if(typeof document !== 'undefined') document.onkeydown = handleKey;

	return x`<div class='Main'>
		<div class='content'>
			${hint && x`<h3 class='hint'>${hint}</h3>`}
			<div class='rows'>
				${guesses.map(([word, status])=>Row(target.length, word, status))}
				${Row(target.length, current, [], 'current')}
				${times(target.length - guesses.length, ()=>Row(target.length, ''))}
			</div>
			${Keyboard(guesses, addKeyPress)}
		</div>

		<aside>
			<button onclick=${()=>setShowGenerator(!showGenerator)}>Make your Own</button>
			${showGenerator && Generator()}

			<button onclick=${()=>setShowResults(!showResults)}>${showResults ? 'Hide' : 'Show'} Results</button>
			${showResults && Share(guesses)}
		</aside>
	</div>`;
});

module.exports = Main;