const fs = require('fs');

const issueTitle = process.env.ISSUE_TITLE || '';
if (!issueTitle.startsWith('ttt|')) {
    console.log('Bukan langkah tic-tac-toe.');
    process.exit(0);
}

const [, rowStr, colStr] = issueTitle.split('|');
const userRow = parseInt(rowStr);
const userCol = parseInt(colStr);

let readme = fs.readFileSync('README.md', 'utf8');
const lines = readme.split('\n');

let boardStart = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<!-- ttt-board-start -->')) {
        boardStart = i + 3; // skip marker, header separator, header text
        break;
    }
}

if (boardStart === -1) {
    console.log('Board tidak ditemukan di README.');
    process.exit(0);
}

let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

const EMOJI_EMPTY = '⬜';
const EMOJI_X = '❌';
const EMOJI_O = '⭕';

// Parse board
for (let r = 0; r < 3; r++) {
    const cells = lines[boardStart + r].split('|').map(s => s.trim()).filter(s => s.length > 0);
    for (let c = 0; c < 3; c++) {
        if (cells[c].includes(EMOJI_X)) board[r][c] = 'X';
        else if (cells[c].includes(EMOJI_O)) board[r][c] = 'O';
        else board[r][c] = ' ';
    }
}

// User Move
if (board[userRow][userCol] === ' ') {
    board[userRow][userCol] = 'X';
} else {
    console.log('Kotak sudah terisi.');
    process.exit(0);
}

function checkWin(b, player) {
    for (let i=0; i<3; i++) {
        if (b[i][0]===player && b[i][1]===player && b[i][2]===player) return true;
        if (b[0][i]===player && b[1][i]===player && b[2][i]===player) return true;
    }
    if (b[0][0]===player && b[1][1]===player && b[2][2]===player) return true;
    if (b[0][2]===player && b[1][1]===player && b[2][0]===player) return true;
    return false;
}

function getEmptyCells(b) {
    let empty = [];
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if(b[r][c] === ' ') empty.push({r,c});
        }
    }
    return empty;
}

let emptyCells = getEmptyCells(board);
let gameOver = false;
let message = '';

if (checkWin(board, 'X')) {
    gameOver = true;
    message = '🎉 **Pemain X Menang!**';
} else if (emptyCells.length === 0) {
    gameOver = true;
    message = '🤝 **Seri!**';
} else {
    // Bot move
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomCell.r][randomCell.c] = 'O';
    
    if (checkWin(board, 'O')) {
        gameOver = true;
        message = '🤖 **Bot O Menang!**';
    } else if (getEmptyCells(board).length === 0) {
        gameOver = true;
        message = '🤝 **Seri!**';
    }
}

function generateLink(r, c) {
    return `https://github.com/sutan789/sutan789/issues/new?title=ttt%7C${r}%7C${c}&body=Just+push+%27Submit+new+issue%27.`;
}

function cellToMarkdown(r, c, val) {
    if (val === 'X') return EMOJI_X;
    if (val === 'O') return EMOJI_O;
    return `[${EMOJI_EMPTY}](${generateLink(r, c)})`;
}

// Update board lines
for (let r = 0; r < 3; r++) {
    lines[boardStart + r] = `| ${cellToMarkdown(r, 0, board[r][0])} | ${cellToMarkdown(r, 1, board[r][1])} | ${cellToMarkdown(r, 2, board[r][2])} |`;
}

if (gameOver) {
    // Reset the board to empty if game is over
    for (let r = 0; r < 3; r++) {
        lines[boardStart + r] = `| [⬜](${generateLink(r, 0)}) | [⬜](${generateLink(r, 1)}) | [⬜](${generateLink(r, 2)}) |`;
    }
    // Add game over message
    lines[boardStart + 4] = `\n${message} *(Game telah di-reset untuk pemain berikutnya)*`;
} else {
    lines[boardStart + 4] = ``; // Clear game over message
}

fs.writeFileSync('README.md', lines.join('\n'));
console.log('README.md sukses diupdate.');
