export const clamp = (x:number, a:number, b:number)=>Math.max(a, Math.min(b, x));
export const mean = (xs:number[]) => xs.length? xs.reduce((a,b)=>a+b,0)/xs.length : 0;
export const max = (xs:number[]) => xs.reduce((m,x)=>x>m?x:m, -Infinity);
