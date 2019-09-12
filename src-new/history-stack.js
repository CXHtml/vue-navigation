const stack = [];
let flag = true; // true is forward, false is backward
export const push = (cache) => {
    console.log('push component')
    stack.push(cache);
    console.log(stack.map(({ tag, cloudNavKey }) => `${tag}-${cloudNavKey}`))
}
export const pop = () => {
    console.log('pop component')

    stack.pop();
    console.log(stack.map(({ tag, cloudNavKey }) => `${tag}-${cloudNavKey}`))
    return stack[stack.length-1];
}
export const has = (condition) => {
    return stack.some((condition));
}

export const getCurrentCache = () => {
    return stack[stack.length-1]
}

export const prePush = (cache) => {
    prepare = cache;
}

export const setForward = () => {
    flag = true;
}
export const setBackward = () => {
    flag = false;
}

export const isBackward = () => !flag;