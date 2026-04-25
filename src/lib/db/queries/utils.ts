

export function firstOrUndefined<T>(arr: Array<T>) {
if (arr.length === 0 ) {
return undefined;    
}
return arr[0]
}