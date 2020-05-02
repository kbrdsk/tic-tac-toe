const game = () => {
	let history = [Array(9).fill(null)];
	let player = 'x';

	let advance = (position) => {
		if(state() === 'active'){
			if(board()[position] !== null) return;
			let newBoard = board();
			newBoard[position] = player;
			history.unshift(newBoard);
			if(state() === 'active') switchPlayer();
		}
	}

	let board = () => {
		return [...history[0]];
	}

	let switchPlayer = () => {
		player = (player === 'x')? 'o': 'x';
	}

	let activePlayer = () => {
		return player;
	}

	let state = () => {
		if(testWin()) return 'victory';
		else if(board().every(space => space !== null)) return 'draw';
		return 'active';
	}

	let testWin = () => {
		for(let i = 0; i < 3; i++){
			if(board()[i*3]
				&& board()[i * 3] === board()[i * 3 + 1]
				&& board()[i * 3 + 1] === board()[i * 3 + 2]){
				return true;
			}
			if(board()[i]
				&& board()[i] === board()[i + 3]
				&& board()[i + 3] === board()[i + 6]){
				return true;
			}
		}
		if(board()[0]
			&& board()[0] === board()[4]
			&& board()[4] === board()[8]) return true;
		if(board()[2]
			&& board()[2] === board()[4]
			&& board()[4] === board()[6]) return true;

		return false;
	}


	return {advance, board, state, activePlayer};
}

const renderer = (() => {
	let draw = (board, gameState) => {
		for(let i = 0; i < 9; i++){
			board[i].textContent = gameState[i];
		}
	}

	return {draw};
})();

const controller = (() => {
	let board = [];
	let currentGame = game();

	let playSquare = (square) => {
		if(currentGame.state() === 'active'){
			currentGame.advance(board.indexOf(square));
			renderer.draw(board, currentGame.board());
			if(currentGame.state() !== 'active'){
				setTimeout(() => alert('Game Over'), 500);
			} 
		}	
	}

	for(let i = 0; i < 9; i++){
		let square = document.createElement('button');
		square.addEventListener('click', e => playSquare(e.target));
		board.push(square);
		document.getElementById('board').appendChild(square);
	}

	return {board};
})();

