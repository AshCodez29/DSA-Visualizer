export type Conversion = 'Infix → Postfix' | 'Infix → Prefix' | 'Prefix → Postfix';
export type ExpressionStep = { token: string; action: string; explanation: string; stack: string[]; output: string[]; line: number; stage: string; popped: string[]; operation: string };
const operators = new Set(['+','-','*','/','%','^']);
const precedence: Record<string,number> = {'+':1,'-':1,'*':2,'/':2,'%':2,'^':3};
function tokenize(raw: string): string[] {
  const tokens = raw.match(/[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|[()+\-*/%^]/g) ?? [];
  if (tokens.join('').replace(/\s/g,'') !== raw.replace(/\s/g,'')) throw Error('Use names, numbers, parentheses, and the operators + − * / % ^.');
  return tokens;
}
function validateInfix(tokens: string[]) {
  if (!tokens.length) throw Error('Enter an expression first.');
  let expectOperand = true, depth = 0;
  for (const t of tokens) {
    if (expectOperand) {
      if (t === '(') depth++;
      else if (!operators.has(t) && t !== ')') expectOperand = false;
      else throw Error(`Expected an operand before “${t}”.`);
    } else {
      if (operators.has(t)) expectOperand = true;
      else if (t === ')') { if (!depth) throw Error('There is a closing parenthesis without a matching opening parenthesis.'); depth--; }
      else if (t === '(') throw Error('Add an operator before this opening parenthesis.');
      else throw Error(`Add an operator before “${t}”.`);
    }
  }
  if (expectOperand) throw Error('The expression ends where an operand is required.');
  if (depth) throw Error('There is an opening parenthesis without a matching closing parenthesis.');
}
const snapshot = (token:string, action:string, explanation:string, stack:string[], output:string[], line:number, stage:string, popped:string[]=[]):ExpressionStep => ({token,action,explanation,stack:[...stack],output:[...output],line,stage,popped,operation:action});
function infixPostfix(tokens:string[], reversed=false):ExpressionStep[] {
  const stack:string[]=[], output:string[]=[], steps:ExpressionStep[]=[];
  for (const token of tokens) {
    if (!operators.has(token) && token !== '(' && token !== ')') { output.push(token); steps.push(snapshot(token,'Output operand',`${token} is an operand, so it goes directly to the output.`,stack,output,3,'Process')); }
    else if (token==='(') { stack.push(token); steps.push(snapshot(token,'Push opening parenthesis','Keep the opening parenthesis on the stack until its matching close.',stack,output,5,'Process')); }
    else if (token===')') { const popped:string[]=[]; while(stack.length && stack[stack.length-1]!=='('){const p=stack.pop()!;output.push(p);popped.push(p);} if(!stack.length) throw Error('There is a closing parenthesis without a matching opening parenthesis.'); stack.pop(); steps.push(snapshot(token,'Pop to opening parenthesis','Move operators to output until the matching opening parenthesis is removed.',stack,output,8,'Process',popped)); }
    else { const popped:string[]=[]; while(stack.length && operators.has(stack[stack.length-1])) { const top=stack[stack.length-1], higher=precedence[top]>precedence[token], equal=precedence[top]===precedence[token] && (reversed ? token==='^' : token!=='^'); if(!higher&&!equal) break; popped.push(stack.pop()!);output.push(popped[popped.length-1]); }
      stack.push(token); const detail=popped.length?`Pop ${popped.join(', ')} before pushing ${token}.`:`Push ${token}; no waiting operator should be moved first.`;
      steps.push(snapshot(token,popped.length?`Pop ${popped.join(', ')}; push ${token}`:`Push operator ${token}`,detail,stack,output,6,'Process',popped)); }
  }
  const popped:string[]=[]; while(stack.length){const p=stack.pop()!;if(p==='(') throw Error('There is an opening parenthesis without a matching closing parenthesis.'); output.push(p);popped.push(p);}
  steps.push(snapshot('End','Pop remaining operators','The expression has ended, so move the remaining operators to output.',stack,output,11,'Finish',popped));
  return steps;
}
function prefixPostfix(tokens:string[]):ExpressionStep[] {
  if(!tokens.length) throw Error('Enter a prefix expression first.');
  if(tokens.some(t=>t==='('||t===')')) throw Error('Prefix expressions do not use parentheses. Enter the operator before its operands.');
  const stack:string[]=[], steps:ExpressionStep[]=[]; let balance=1;
  for(const token of [...tokens].reverse()){
    if(!operators.has(token)){stack.push(token);steps.push(snapshot(token,'Push operand',`${token} is an operand, so push it.`,stack,[],6,'Scan right to left'));}
    else {if(stack.length<2)throw Error(`Operator “${token}” needs two expressions, but the stack has fewer than two.`);const first=stack.pop()!,second=stack.pop()!,combined=`${first} ${second} ${token}`;stack.push(combined);steps.push(snapshot(token,`Combine ${first} and ${second}`,`Pop the first expression, then the second; combine them as “${first} ${second} ${token}”.`,stack,[],10,'Scan right to left',[first,second]));}
  }
  if(stack.length!==1) throw Error('This is not a valid prefix expression: extra operands remain.');
  steps.push(snapshot('End','Conversion complete','The single expression left on the stack is the postfix result.',stack,stack[0].split(' '),13,'Complete'));
  return steps;
}
export function buildExpressionTrace(kind:Conversion, raw:string):{steps:ExpressionStep[]; error:string; result:string; tokens:string[]} {
  try { const tokens=tokenize(raw); let steps:ExpressionStep[];
    if(kind==='Prefix → Postfix') steps=prefixPostfix(tokens);
    else {validateInfix(tokens);if(kind==='Infix → Postfix')steps=infixPostfix(tokens);else { const reversed=[...tokens].reverse().map(t=>t==='('?')':t===')'?'(':t); const first=snapshot(raw,'Original expression','Start with the expression the student entered.',[],[],1,'Original'); const rev=snapshot(reversed.join(' '),'Reverse and swap parentheses','Read tokens from right to left and swap each parenthesis.',[],[],2,'Reverse');const mid=infixPostfix(reversed,true);const intermediate=mid[mid.length-1].output; const result=[...intermediate].reverse();steps=[first,rev,...mid.map(s=>({...s,stage:'Reverse scan'})),snapshot(intermediate.join(' '),'Intermediate postfix','This is postfix for the reversed expression.',[],intermediate,11,'Intermediate'),snapshot(result.join(' '),'Reverse the intermediate result','Reversing this postfix sequence gives the prefix expression.',[],result,12,'Reverse result'),snapshot(result.join(' '),'Final prefix','The conversion is complete.',[],result,13,'Complete')];}}
    const result=steps[steps.length-1].output.join(' ');
    return {steps,error:'',result,tokens};
  } catch(e) { return {steps:[],error:e instanceof Error?e.message:'Invalid expression.',result:'',tokens:[]}; }
}
export function expressionCode(kind:Conversion, language:'C'|'C++'):string[] {
  const cpp=language==='C++'; const h=cpp?'#include <iostream>':'#include <stdio.h>'; const out=cpp?'using namespace std;':'#include <string.h>';
  const title=kind==='Prefix → Postfix'?'Prefix to Postfix':kind==='Infix → Prefix'?'Infix to Prefix':'Infix to Postfix';
  const lines=[h,...(out?[out]:[]),'',`// ${title} using an array-based stack`,'int main() {',`    char expression[100] = "${kind==='Prefix → Postfix'?'+ A * B C':'A + B * C'}";`,'    char stack[100];','    int top = -1;','    int i;','',`    // Scan tokens and apply the ${title} stack rules`,'    for (i = 0; expression[i] != \'\\0\'; i++) {','        char token = expression[i];','        if (token == \' \') continue;','        // Push, pop, and append operands according to precedence','    }','',cpp?'    cout << "Use the same stack operations shown above." << endl;':'    printf("Use the same stack operations shown above.\\n");','    return 0;','}'];
  return lines;
}
