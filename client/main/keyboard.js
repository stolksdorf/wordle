const {x, cx, comp, css} = require('../../libs');

global.css.Keyboard = css`
	.Keyboard{
		position: relative;
		.kb_row{
			justify-content: center;
			display:flex;


		}

		.backspace{
			position: absolute;
			top: 0px;
			left:50%;
			margin-left:11em;
		}
		.enter{
			position: absolute;
			top: 4em;
			left:50%;
			margin-left:11em;
		}

		.key{
			font-size:2em;
			cursor:pointer;
			border: 1px solid black;
			width: 2em;
			height: 2em;
			line-height:2em;

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
`;

const Keys = `qwertyuiop
asdfghjkl
zxcvbnm`;

const Keyboard = comp(function(guesses, onPress){

	let lookup = {};
	guesses.map(([word, status])=>{
		status.split('').map((code, idx)=>{
			const letter = word[idx];
			if(lookup[letter] !== 'y') lookup[letter] = code;
		})
	})

	return x`<div class='Keyboard'>
		${Keys.split('\n').map(line=>{
			return x`<div class='kb_row'>
				${line.split('').map(key=>{
					return x`<div class=${cx('key', lookup[key]||'')} onclick=${()=>onPress(key)}>${key}</div>`;
				})}
			</div>`;
		})}
		<div class='backspace key' onclick=${()=>onPress('Backspace')}>ᐊ</div>
		<div class='enter key' onclick=${()=>onPress('Enter')}>🗸</div>
	</div>`;
});

module.exports = Keyboard;