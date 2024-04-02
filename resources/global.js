const now = new Date();

document.getElementById("age").innerText = Math.floor((now.valueOf() - new Date(2005, 9, 7).valueOf()) / 31556926000);
document.getElementById("birthday").style.display = (now.getMonth() === 9 && now.getDate() === 7) ? "inline" : "none";
