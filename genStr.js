function generateRandomString() {
  const arr = [1,2,3,4,5,6,7,8,9,0,"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let ans = ""
  for(let i=0; i<6; i++){
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans
  }

  module.exports = generateRandomString;