const {x, cx, comp, css} = require('../../libs');

global.css.Share = css`
	.Share{
		resize: none;
		text-align: right;
		border: none;
		background-color: white;
		height:14em;
	}
`;

const getEmojiResult = (guesses)=>{
	const mapping = {y : '🟩',c : '🟨',n : '⬜'};
	return guesses.map(([word, status])=>{
		return status.split('').map(code=>mapping[code]).join('');
	}).join('\n');
};


const Share = comp(function(guesses){
	return x`<textarea class='Share'>${getEmojiResult(guesses)}</textarea>`;
});
module.exports = Share;