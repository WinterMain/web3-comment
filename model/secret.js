export function encrypt(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str[i].charCodeAt() - i % 10);
  }
  return result;
}

export function decrypt(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str[i].charCodeAt() + i % 10);
  }

  return result;
}
