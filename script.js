const twoDisplay = document.getElementById("twoDigit");
const threeDisplay = document.getElementById("threeDigit");

document.getElementById("gen2").addEventListener("click", () => {
    twoDisplay.innerText = generateNumber(2);
});

document.getElementById("gen3").addEventListener("click", () => {
    threeDisplay.innerText = generateNumber(3);
});

function generateNumber(digits){
    let n;
    if(digits === 2){
        n = Math.floor(Math.random() * 100); // 00-99
    } else {
        n = Math.floor(Math.random() * 1000); // 000-999
    }
    return n.toString().padStart(digits,"0");
}
