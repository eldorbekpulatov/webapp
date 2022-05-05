var turn = 0;
var def = 99;
var gameOver = false;

// Create Matrix
var matrix = [...Array(3)].map(e => Array(3).fill(def));

var modal = new bootstrap.Modal(document.getElementById('winnerAlert'));
var modal_title = document.getElementById('winnerAlertTitle');
var modal_body = document.getElementById('winnerAlertBody');


var cases = [
	[[0,0],[0,1],[0,2]],
	[[1,0],[1,1],[1,2]],
	[[2,0],[2,1],[2,2]],
	[[0,0],[1,0],[2,0]],
	[[0,1],[1,1],[2,1]],
	[[0,2],[1,2],[2,2]],
	[[0,0],[1,1],[2,2]],
	[[2,0],[1,1],[0,2]],
]

// Returns the turn number of the player who won
// and the cordinate list of winning case.
// If not won, then returns default turn number,
// and undefined winning case.
function whowon(){
	for (let i = 0; i<8; i++){
		let win_case = cases[i] 
		let case_total = 0

		for (let j=0; j<3; j++){
			let r = win_case[j][0]
			let c = win_case[j][1]
			case_total += matrix[r][c]
		}

		if (case_total== 3){
			return ["O", win_case];
		}else if (case_total== 0){
			return ["X", win_case];
		}
	}
	return [def, undefined];
}


// based on the turn of the player and the target DOM
// it inserts the corresponding images: X.png and O.png
function add_img(turn, target) { 
	let img = document.createElement('img');
	img.classList.add("pictures");

	if (turn%2 == 0) {
		img.src = '../static/images/tictactoe/x.png'; 
	}else{
		img.src = "../static/images/tictactoe/o.png"
	}
	target.appendChild(img);
}


function restart(){
	// set turn to 0
	turn = 0;

	// clear the matrix
	matrix = [...Array(3)].map(e => Array(3).fill(def));

	// set game not over
	gameOver = false;

	// Clear the visuals
	Array.from(document.getElementsByTagName("img")).forEach(img => {img.remove()});

	// clear the line
	Array.from(document.getElementsByClassName("winning-square")).forEach(each=>{
		// remove the winning square class from element
		each.classList.remove("winning-square");
	});

	// dissmis the modal
	modal.hide();
}


function foo(event){
	if (!gameOver){
		let square = event.target;
		let c = square.id;
		let r = square.parentElement.id;

		// check if square is empty
		if (matrix[r][c] == def){

			// update the matrix with turn
			matrix[r][c]=turn%2;

			// updates the visual
			add_img(turn, square);

			// updates the turn
			turn +=1;

			// check who won and how
			let [winner,winning_case] = whowon();

			if (winner != def & turn <= 9){
				// set the gameover
				gameOver = true;

				// show the winning line
				Array.from(winning_case).forEach(coord => {
					[row, col] = coord;
					let sq = document.getElementsByClassName("row")[row].children[col];
					sq.classList.add("winning-square")
				});
				
				// set a little delay for the visual affect
				setTimeout(function(){
					// show the winner alert
					modal_title.innerHTML = "Player "+winner+" won!";
					modal_body.innerHTML = "Would you like to rematch?"
					modal.show();
				}, 500);

				
			}else if ( winner == def & turn == 9){
				// game is over but no winner
				gameOver = true;
				// show the winner alert
				modal_title.innerHTML = "There was a tie!";
				modal_body.innerHTML = "Would you like to rematch?"
				modal.show();
			}
			
		}else{
			console.log("make a different move")
		}
	}else{
		modal.show();
	}
	
}