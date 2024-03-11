function handle(funcOrStr, item) {
  if(typeof funcOrStr === 'function') {
    return funcOrStr(item);
  } else {
    if(funcOrStr.startsWith('#')) {
      return item.id === funcOrStr.replace('#', '');
    } else {
      return (item.className || '').includes(funcOrStr.replace('.', ''))
    }
  }
}

export function getDom(mark) {
  const str = (mark || '').toString();
  return str.startsWith('#') ? document.getElementById(str.replace('#', ''))
    : document.getElementsByClassName(str.replace('.', ''))[0];
}

export function getChildDom(rootDom, func) {
  if(!rootDom) {
    return;
  }

  for (let i = 0; i < rootDom.childNodes.length; i++) {
    const ele = rootDom.childNodes[i];
    if (handle(func, ele)) {
      return ele;
    }
  }
}

export function getChildren(rootDom, func) {
  if(!rootDom) {
    return;
  }

  const result = [];

  for (let i = 0; i < rootDom.childNodes.length; i++) {
    const ele = rootDom.childNodes[i];
    if (handle(func, ele)) {
      result.push(ele);
    }
  }

  return result;
}

export function dQuery(rootDom, str) {
  const names = str.split(' ');
  let currentDom = rootDom;
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    if(n) {
      currentDom = getChildDom(currentDom, n);
    }
  }

  return currentDom;
}
