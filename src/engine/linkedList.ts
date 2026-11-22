export type ListAction = 'Traverse' | 'Insert at beginning' | 'Insert at end' | 'Insert at position' | 'Insert after value' | 'Delete from beginning' | 'Delete from end' | 'Delete at position' | 'Delete by value';
export type ListTraceState = { line:number; operation:string; explanation:string; nodes:number[]; active:number|null; pointers:Record<string,number|null>; phase:'scan'|'create'|'link'|'remove'|'done'; variables:Record<string,string> };
const snap=(nodes:number[],patch:Partial<ListTraceState>={}):ListTraceState=>{const merged={line:1,operation:'Initialize',explanation:'Begin with the current linked list.',nodes,active:null,pointers:{head:nodes.length?0:null},phase:'scan',variables:{},...patch} as ListTraceState;return {...merged,nodes:[...merged.nodes],pointers:{...merged.pointers},variables:{...merged.variables}}};
export function buildLinkedListTrace(initial:number[], action:ListAction, value:number, position:number):ListTraceState[]{
  const list=[...initial], t:ListTraceState[]=[];const emit=(line:number,operation:string,explanation:string,patch:Partial<ListTraceState>={})=>t.push(snap(list,{line,operation,explanation,...patch}));
  emit(1,'Start at head','The head pointer refers to the first node. Each node stores data and a next link.',{pointers:{head:list.length?0:null}});
  if(action==='Traverse'){
    if(!list.length)emit(4,'List is empty','head is NULL, so there are no nodes to visit.',{line:4,phase:'done',pointers:{head:null,temp:null}});
    for(let i=0;i<list.length;i++){emit(4,'Check temp','temp is not NULL, so visit this node.',{line:4,active:i,pointers:{head:0,temp:i},variables:{temp:`node ${i+1}`}});emit(5,'Visit node',`Read data ${list[i]} from the current node.`,{line:5,active:i,pointers:{head:0,temp:i},variables:{temp:String(list[i])}});emit(6,'Move to next node',i===list.length-1?'temp follows next to NULL, ending traversal.':`temp follows next to the node containing ${list[i+1]}.`,{line:6,active:i===list.length-1?null:i+1,pointers:{head:0,temp:i===list.length-1?null:i+1},phase:i===list.length-1?'done':'scan',variables:{temp:i===list.length-1?'NULL':`node ${i+2}`}});}
  } else if(action.startsWith('Insert')){
    const newValue=value;
    if(action==='Insert at beginning'){
      list.unshift(newValue); emit(4,'Create newNode',`Allocate a node and store ${newValue}.`,{line:4,phase:'create',active:0,pointers:{head:1,newNode:0},variables:{'newNode->data':String(newValue)}});
      emit(5,'Link to old head','Set newNode->next to the previous head node.',{line:5,phase:'link',active:0,pointers:{head:1,newNode:0,temp:1},variables:{'newNode->next':'old head'}});
      emit(6,'Move head','Set head = newNode. The new node is now first.',{line:6,phase:'done',active:0,pointers:{head:0,newNode:0}});
    } else {
      const idx=action==='Insert at end'?list.length:action==='Insert after value'?Math.max(0,list.indexOf(position)+1):Math.max(0,Math.min(list.length,position-1));
      emit(4,'Create newNode',`Allocate a node and store ${newValue}; set newNode->next = NULL.`,{line:4,phase:'create',pointers:{head:list.length?0:null,newNode:idx,temp:null},variables:{'newNode->data':String(newValue),'newNode->next':'NULL'}});
      if(action==='Insert after value'&& !list.includes(position))emit(7,'Value not found',`There is no node with value ${position}; the list is unchanged.`,{line:7,phase:'done',pointers:{head:list.length?0:null,newNode:null}});
      else {
        const stop=Math.max(0,idx-1);for(let i=0;i<=stop&&i<list.length;i++)emit(7,'Move temp',`temp advances to ${list[i]}.`,{line:7,active:i,pointers:{head:0,temp:i,newNode:idx},variables:{temp:String(list[i])}});
        list.splice(idx,0,newValue);emit(9,'Connect new node',idx===0?'The new node becomes head and points to the old first node.':`Set node ${idx} next to newNode. The value ${newValue} is now linked into the list.`,{line:9,phase:'link',active:idx,pointers:{head:0,temp:Math.max(0,idx-1),newNode:idx},variables:{'temp->next':'newNode'}});emit(10,'Insertion complete',`The list now contains ${list.length} nodes.`,{line:10,phase:'done',active:idx,pointers:{head:0,newNode:idx}});
      }
    }
  } else {
    if(!list.length){emit(4,'List is empty','There is no node to delete.',{line:4,phase:'done',pointers:{head:null,temp:null}});}
    else {
      let idx=action==='Delete from beginning'?0:action==='Delete from end'?list.length-1:action==='Delete by value'?list.indexOf(value):Math.max(0,Math.min(list.length-1,position-1));
      if(action==='Delete by value'&&idx<0){emit(5,'Value not found',`No node contains ${value}; the list remains unchanged.`,{line:5,phase:'done'});}
      else {
        if(idx>0)for(let i=0;i<idx;i++)emit(5,'Find previous node',`temp advances through ${list[i]} to find the node before the target.`,{line:5,active:i,pointers:{head:0,temp:i,remove:idx},variables:{temp:String(list[i])}});
        emit(7,'Select node to remove',`Node ${list[idx]} is selected for deletion.`,{line:7,phase:'remove',active:idx,pointers:{head:0,temp:idx?idx-1:null,remove:idx},variables:{target:String(list[idx])}});
        const removed=list.splice(idx,1)[0];emit(8,'Reconnect links',idx===0?'Move head to the next node.':idx===list.length?'Set the previous node next to NULL.':'Set the previous node next to the target node next.',{line:8,phase:'link',active:idx<list.length?idx:null,pointers:{head:list.length?0:null,temp:idx?idx-1:null,remove:null},variables:{removed:String(removed)}});
        emit(9,'Deletion complete',`The node containing ${removed} has been removed.`,{line:9,phase:'done',pointers:{head:list.length?0:null}});
      }
    }
  }
  if(!t.length)emit(1,'Ready','');return t;
}
export const listCode:Record<'C'|'C++',string[]>={
 C:['#include <stdio.h>','#include <stdlib.h>','','struct Node {','    int data;','    struct Node* next;','};','','struct Node* head = NULL;','','void insertFront(int value) {','    struct Node* newNode = malloc(sizeof(struct Node));','    newNode->data = value;','    newNode->next = head;','    head = newNode;','}','','void insertEnd(int value) {','    struct Node* newNode = malloc(sizeof(struct Node));','    newNode->data = value;','    newNode->next = NULL;','    if (head == NULL) { head = newNode; return; }','    struct Node* temp = head;','    while (temp->next != NULL) temp = temp->next;','    temp->next = newNode;','}','','void deleteAtPosition(int position) {','    struct Node* temp = head;','    if (position == 1 && head != NULL) {','        head = head->next; free(temp); return;','    }','    for (int i = 1; temp != NULL && i < position - 1; i++)','        temp = temp->next;','    if (temp != NULL && temp->next != NULL) {','        struct Node* removed = temp->next;','        temp->next = removed->next;','        free(removed);','    }','}','','void display() {','    struct Node* temp = head;','    while (temp != NULL) {','        printf("%d -> ", temp->data);','        temp = temp->next;','    }','    printf("NULL\\n");','}','','int main() {','    insertFront(30); insertFront(20); insertFront(10);','    display();','    return 0;','}'],
 'C++':['#include <iostream>','using namespace std;','','struct Node {','    int data;','    Node* next;','};','','Node* head = NULL;','','void insertFront(int value) {','    Node* newNode = new Node();','    newNode->data = value;','    newNode->next = head;','    head = newNode;','}','','void insertEnd(int value) {','    Node* newNode = new Node();','    newNode->data = value;','    newNode->next = NULL;','    if (head == NULL) { head = newNode; return; }','    Node* temp = head;','    while (temp->next != NULL) temp = temp->next;','    temp->next = newNode;','}','','void deleteAtPosition(int position) {','    Node* temp = head;','    if (position == 1 && head != NULL) {','        head = head->next; delete temp; return;','    }','    for (int i = 1; temp != NULL && i < position - 1; i++)','        temp = temp->next;','    if (temp != NULL && temp->next != NULL) {','        Node* removed = temp->next;','        temp->next = removed->next;','        delete removed;','    }','}','','void display() {','    Node* temp = head;','    while (temp != NULL) {','        cout << temp->data << " -> ";','        temp = temp->next;','    }','    cout << "NULL" << endl;','}','','int main() {','    insertFront(30); insertFront(20); insertFront(10);','    display();','    return 0;','}']
};
