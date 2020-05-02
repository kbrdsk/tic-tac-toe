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

	let fromBoard = (board) => {
		history = [board];
		if(board.filter(space => space === null).length % 2 === 0){
			player = 'o';
		}
		else player = 'x';
	}


	return {advance, board, state, activePlayer, fromBoard};
}

const renderer = (() => {
	let draw = (board, gameState) => {
		for(let i = 0; i < 9; i++){
			board[i].textContent = gameState[i];
		}
	}

	let gameOver = (currentGame) => {
		setTimeout(() => {
			if(currentGame.state() === 'draw') alert('Draw!');
			else alert(`Game Over, `
				+ `${currentGame.activePlayer().toUpperCase()} Wins!`);
		}, 300);
	}

	let showMove = (square, player) => {
		if(!square.textContent){
			square.setAttribute('preview', 'true');
			square.textContent = player;
		}

	}

	let hideMove = (square) => {
		if(square.getAttribute('preview') === 'true') square.textContent = '';
		square.setAttribute('preview', 'false');
	}

	return {draw, gameOver, showMove, hideMove};	
})();

const ai = (() => {
	let random = (board) => {
		let potentialMoves = playableIndices(board);
		let move = Math.floor(potentialMoves.length * Math.random());
		return (potentialMoves[move]);
	}

	let unbeatable = (board, tryingToWin = true) => {
		let winVals = winValues(board, tryingToWin);
		let potentialMoves = playableIndices(board).map((pos, index) => {
			return [pos, winVals[index]];
		});
		let move = potentialMoves.find(([pos, winVal]) => {
			return potentialMoves.every(([_, winVal2]) => winVal >= winVal2);
		});
		return move[0];

	}

	let easy = board => unbeatable(board, false);

	function playableIndices(board){
		return Array.from(Array(9).keys())
								  .filter(i => board[i] === null);
	}

	function max(board){
		return Math.max(...winValues(board, true));
	}

	function min(board){
		return Math.min(...winValues(board, false));
	}

	function winValues(board, aiTurn){
		let valueFunction = aiTurn? min: max;
		return playableIndices(board).map(i => {
			let simGame = game();
			simGame.fromBoard(board);
			simGame.advance(i);
			if(simGame.state() === 'victory'){
				return aiTurn? 1 : -1;
			}else if(simGame.state() === 'draw'){
				return 0;
			}
			else return valueFunction(simGame.board());
		});
	}

	return {easy, random, unbeatable};
})();

const controller = (() => {
	let board = [],
		currentGame = game(),
		players = {x: 'user', o: 'user'},
		aiType = 'easy';

	let boardControl = document.getElementById('board'),
		resetButton = document.getElementById('reset-button'),
		activeGameModeDisplay = document.getElementById('active-game-mode-display');
		gameModeList = document.getElementById('game-mode-list');

	let gameModes = {
		multiplayer: document.getElementsByClassName('multiplayer')[0],
		easy: document.getElementsByClassName('easy-ai')[0],
		random: document.getElementsByClassName('random-ai')[0],
		unbeatable: document.getElementsByClassName('unbeatable-ai')[0],
	};

	let activeGameMode = gameModes.multiplayer;

	let reset = () => {
		currentGame = game();
		renderer.draw(board, currentGame.board());
	}

	let aiPlay = () => {
		return ai[aiType](currentGame.board());
	}

	let aiTurn = () => {
		let boardSquares = boardControl.getElementsByTagName('*');
		for(let square of boardSquares) square.disabled = true;
		setTimeout(() => {
			playSquare(board[aiPlay()]);
			for(let square of boardSquares) square.disabled = false;
		}, 300);
	}

	let playSquare = (square) => {
		if(currentGame.state() === 'active'){
			currentGame.advance(board.indexOf(square));
			square.setAttribute('preview', 'false');
			renderer.draw(board, currentGame.board());
			if(currentGame.state() !== 'active'){
				renderer.gameOver(currentGame);
				setTimeout(reset, 300);
			} 
			if(players[currentGame.activePlayer()] !== 'user'){
				aiTurn();
			}
		}	
	}

	let toggleGameModeSelect = () => {
		let display = gameModeList.style.display;
		gameModeList.style.display = (display === 'flex')? 'none': 'flex';
	}

	let activateGameMode = (mode) => {
		if(mode === 'multiplayer') players.o = 'user';
		else{
			players.o = 'ai';
			aiType = mode;
		} 

		gameModeList.style.display = 'none';
		activeGameMode.hidden = false;
		activeGameModeDisplay.removeChild(activeGameModeDisplay.lastElementChild);
		activeGameModeDisplay.appendChild(gameModes[mode].cloneNode());
		gameModes[mode].hidden = true;
		activeGameMode = gameModes[mode];
	}

	resetButton.addEventListener('click', reset);
	activeGameModeDisplay.addEventListener('click', toggleGameModeSelect);
	for(let mode in gameModes){
		gameModes[mode].addEventListener('click', () => activateGameMode(mode));
	}

	activateGameMode('multiplayer');

	for(let i = 0; i < 9; i++){
		let square = document.createElement('button');
		square.addEventListener('click', e => playSquare(e.target));
		square.addEventListener('mouseenter', e => {
			if(currentGame.state() === 'active'
				&& players[currentGame.activePlayer()] === 'user'){
				renderer.showMove(e.target, currentGame.activePlayer());
			}
		});
		square.addEventListener('mouseleave', e => renderer.hideMove(e.target));
		board.push(square);
		boardControl.appendChild(square);
	}

	return {board};
})();