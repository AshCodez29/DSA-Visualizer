export type PriorityItem={value:number;priority:number};
export type PriorityAction='Insert'|'Delete highest priority'|'Peek'|'Display';
export type PriorityState={line:number;operation:string;explanation:string;items:PriorityItem[];focus:number|null;best:number|null;phase:'compare'|'insert'|'shift'|'done';variables:Record<string,string>;error:boolean};
const copy=(items:PriorityItem[])=>items.map(x=>({...x}));
const snap=(items:PriorityItem[],patch:Partial<PriorityState>={}):PriorityState=>{const merged={line:1,operation:'Initialize',explanation:'Priorities are stored beside each value in the array.',items,focus:null,best:null,phase:'compare',variables:{},error:false,...patch} as PriorityState;return {...merged,items:copy(merged.items),variables:{...merged.variables}}};
export function buildPriorityTrace(initial:PriorityItem[],action:PriorityAction,value:number,priority:number,higherFirst:boolean):PriorityState[]{
 const items=copy(initial),trace:PriorityState[]=[];const emit=(line:number,operation:string,explanation:string,patch:Partial<PriorityState>={})=>trace.push(snap(items,{line,operation,explanation,...patch}));
 const better=(a:number,b:number)=>higherFirst?a>b:a<b;
 emit(1,'Start priority queue',`Array stores value and priority. ${higherFirst?'A larger priority number is served first.':'A smaller priority number is served first.'}`,{variables:{size:String(items.length),ordering:higherFirst?'larger first':'smaller first'}});
 if(action==='Insert'){
  if(items.length>=8)emit(3,'Queue is full','The array capacity is 8, so this item cannot be inserted.',{line:3,phase:'done',error:true});else{emit(3,'Check capacity','There is room in the array for another item.',{line:3,variables:{size:String(items.length),capacity:'8'}});items.push({value,priority});emit(4,'Insert at rear',`Add (${value}, priority ${priority}) at index ${items.length-1}.`,{line:4,phase:'insert',focus:items.length-1,variables:{rear:String(items.length-1),value:String(value),priority:String(priority)}});emit(5,'Insertion complete','The new item is stored. The highest priority is found by scanning the array.',{line:5,phase:'done',focus:items.length-1,variables:{size:String(items.length)}});}
 }else if(action==='Delete highest priority'||action==='Peek'){
  if(items.length===0)emit(3,'Priority queue is empty','There is no item to remove or inspect.',{line:3,phase:'done',error:true});else{
   let best=0;emit(4,'Assume first item is highest',`Start with value ${items[0].value} at index 0 as the current highest priority.`,{line:4,focus:0,best:0,variables:{highestIndex:'0',highestPriority:String(items[0].priority)}});
   for(let i=1;i<items.length;i++){emit(5,'Compare priorities',`Compare priority ${items[i].priority} at index ${i} with current highest ${items[best].priority} at index ${best}.`,{line:5,focus:i,best,variables:{i:String(i),highestIndex:String(best),currentPriority:String(items[i].priority),highestPriority:String(items[best].priority)}});if(better(items[i].priority,items[best].priority)){best=i;emit(6,'Update highest index',`Index ${best} now has the highest priority seen so far.`,{line:6,focus:i,best,variables:{highestIndex:String(best),highestPriority:String(items[best].priority)}});}}
   if(action==='Peek')emit(7,'Peek highest priority',`Value ${items[best].value} (priority ${items[best].priority}) would be served next. Nothing is removed.`,{line:7,focus:best,best,phase:'done',variables:{value:String(items[best].value),priority:String(items[best].priority)}});
   else{const removed=items[best];emit(8,'Select item to delete',`Remove value ${removed.value} with priority ${removed.priority}.`,{line:8,focus:best,best,variables:{removeIndex:String(best),value:String(removed.value)}});for(let i=best;i<items.length-1;i++){items[i]={...items[i+1]};emit(9,'Shift next item left',`Move value ${items[i].value} from index ${i+1} into index ${i}.`,{line:9,focus:i,best:i,phase:'shift',variables:{i:String(i),shiftedValue:String(items[i].value)}});}items.pop();emit(10,'Deletion complete',`Removed (${removed.value}, priority ${removed.priority}). The array now has ${items.length} items.`,{line:10,phase:'done',variables:{size:String(items.length),removed:String(removed.value)}});}
  }
 }else{
  if(!items.length)emit(3,'Priority queue is empty','There are no items to display.',{line:3,phase:'done'});else for(let i=0;i<items.length;i++)emit(11,'Display item',`Index ${i}: value ${items[i].value}, priority ${items[i].priority}.`,{line:11,focus:i,phase:'compare',variables:{i:String(i),value:String(items[i].value),priority:String(items[i].priority)}});
  emit(12,'Display complete','Every value and priority pair has been shown.',{line:12,phase:'done'});
 }
 return trace;
}
function sample(lang:'C'|'C++',higherFirst=true){
 const cpp=lang==='C++';const pre=cpp?['#include <iostream>','using namespace std;']:['#include <stdio.h>'];
 const t=cpp?'PriorityItem':'struct PriorityItem';
 const print=cpp?['        cout << items[i].value << " " << items[i].priority << endl;']:['        printf("%d %d\\n", items[i].value, items[i].priority);'];
 return [...pre,'',`struct PriorityItem {`,`    int value;`,`    int priority;`,`};`,'',`${t} items[8];`,'int size = 0;','', 'void insert(int value, int priority) {','    if (size == 8) return;','    items[size].value = value;','    items[size].priority = priority;','    size++;','}', '', 'int highestIndex() {','    if (size == 0) return -1;','    int best = 0;','    for (int i = 1; i < size; i++)',`        if (items[i].priority ${higherFirst?'>':'<'} items[best].priority) best = i;`,'    return best;','}', '', 'int peekHighest() {','    int best = highestIndex();','    if (best == -1) return -1;','    return items[best].value;','}', '', 'int deleteHighest() {','    int best = highestIndex();','    if (best == -1) return -1;','    int value = items[best].value;','    for (int i = best; i < size - 1; i++) items[i] = items[i + 1];','    size--;','    return value;','}', '', 'void display() {','    for (int i = 0; i < size; i++)',...print,'}', '', 'int main() {','    insert(40, 2); insert(15, 5); insert(30, 3);','    display();','    return 0;','}'];
}
export const priorityCode={C:sample('C'),'C++':sample('C++')};
export const getPriorityCode=(lang:'C'|'C++',higherFirst:boolean)=>sample(lang,higherFirst);
