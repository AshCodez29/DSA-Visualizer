import { buildLinkedListTrace } from './linkedList';
import type { ListAction, ListTraceState } from './linkedList';
export type ExtendedListKind='Doubly linked list'|'Circular linked list';
export function buildExtendedListTrace(values:number[],action:ListAction,value:number,position:number,kind:ExtendedListKind):ListTraceState[]{
  const circular=kind==='Circular linked list';
  const trace=buildLinkedListTrace(values,action,value,position);
  return trace.map((s,i)=>{
    const pointers={...s.pointers};
    const variables={...s.variables};
    if(kind==='Doubly linked list'){
      pointers.tail=s.nodes.length?s.nodes.length-1:null;
      if(action.startsWith('Insert')) variables['prev link']='updated with next link';
      if(action.startsWith('Delete')) variables['prev link']='neighbor prev updated';
      if(action==='Traverse backward') variables.direction='tail → head';
      if(action==='Traverse forward') variables.direction='head → tail';
    }
    if(circular){
      variables['tail->next']='head';
      if(action.startsWith('Traverse')) variables.stop='temp == head';
      if(action.startsWith('Traverse')&&s.phase==='done'&&s.operation==='Move to next node'){pointers.temp=0;s.explanation='temp follows next from the last node back to head. The traversal stops when it returns to the starting node.';}
      if(action.startsWith('Insert')&&s.phase==='link') variables['tail->next']=`node ${s.nodes.length}`;
    }
    return {...s,pointers,variables,kind,circular,stepIndex:i};
  });
}

const doublyBody=[
 'void insertFront(int value) {','    Node* node = new Node();','    node->data = value;','    node->prev = NULL;','    node->next = head;','    if (head != NULL) head->prev = node;','    else tail = node;','    head = node;','}',
 'void insertEnd(int value) {','    Node* node = new Node();','    node->data = value;','    node->next = NULL;','    node->prev = tail;','    if (tail != NULL) tail->next = node;','    else head = node;','    tail = node;','}',
 'void displayForward() {','    Node* temp = head;','    while (temp != NULL) {','        cout << temp->data << " <-> ";','        temp = temp->next;','    }','    cout << "NULL" << endl;','}',
 'void displayBackward() {','    Node* temp = tail;','    while (temp != NULL) {','        cout << temp->data << " <-> ";','        temp = temp->prev;','    }','    cout << "NULL" << endl;','}',
 'void deleteAtPosition(int position) {','    Node* temp = head;','    for (int i = 1; temp != NULL && i < position; i++)','        temp = temp->next;','    if (temp == NULL) return;','    if (temp->prev != NULL) temp->prev->next = temp->next;','    else head = temp->next;','    if (temp->next != NULL) temp->next->prev = temp->prev;','    else tail = temp->prev;','    delete temp;','}'
];
const circularBody=[
 'void insertEnd(int value) {','    Node* node = new Node();','    node->data = value;','    if (head == NULL) {','        head = node;','        node->next = head;','        return;','    }','    Node* temp = head;','    while (temp->next != head)','        temp = temp->next;','    temp->next = node;','    node->next = head;','}',
 'void insertFront(int value) {','    Node* node = new Node();','    node->data = value;','    if (head == NULL) { head = node; node->next = head; return; }','    Node* last = head;','    while (last->next != head) last = last->next;','    node->next = head;','    last->next = node;','    head = node;','}',
 'void display() {','    if (head == NULL) return;','    Node* temp = head;','    do {','        cout << temp->data << " -> ";','        temp = temp->next;','    } while (temp != head);','    cout << "(back to head)" << endl;','}',
 'void deleteValue(int value) {','    if (head == NULL) return;','    Node* current = head;','    Node* previous = NULL;','    do {','        if (current->data == value) break;','        previous = current;','        current = current->next;','    } while (current != head);','    if (current->data != value) return;','    if (current == head && current->next == head) head = NULL;','    else {','        if (current == head) head = head->next;','        if (previous != NULL) previous->next = current->next;','        else { Node* last = head; while (last->next != current) last = last->next; last->next = head; }','    }','    delete current;','}'
];
function completeCode(kind:ExtendedListKind,lang:'C'|'C++'){
 const cpp=lang==='C++';
 const pre=cpp?['#include <iostream>','using namespace std;']:['#include <stdio.h>','#include <stdlib.h>'];
 const body=kind==='Doubly linked list'?doublyBody:circularBody;
 const converted=cpp?body:body.map(line=>line.replace(/Node\*/g,'struct Node*').replace(/new Node\(\)/g,'malloc(sizeof(struct Node))').replace(/delete temp;/g,'free(temp);').replace(/delete current;/g,'free(current);').replace(/cout << temp->data << " <-> ";/g,'printf("%d <-> ", temp->data);').replace(/cout << temp->data << " -> ";/g,'printf("%d -> ", temp->data);').replace(/cout << "NULL" << endl;/g,'printf("NULL\\n");').replace(/cout << "\(back to head\)" << endl;/g,'printf("(back to head)\\n");'));
 const node=kind==='Doubly linked list'?(cpp?['struct Node {','    int data;','    Node* prev;','    Node* next;','};']:['struct Node {','    int data;','    struct Node* prev;','    struct Node* next;','};']):(cpp?['struct Node {','    int data;','    Node* next;','};']:['struct Node {','    int data;','    struct Node* next;','};']);
 const globals=kind==='Doubly linked list'?(cpp?['Node* head = NULL;','Node* tail = NULL;']:['struct Node* head = NULL;','struct Node* tail = NULL;']):(cpp?['Node* head = NULL;']:['struct Node* head = NULL;']);
 const main=cpp?['int main() {','    insertEnd(10); insertEnd(20); insertEnd(30);',...(kind==='Doubly linked list'?['    displayForward();','    displayBackward();']:['    display();']),'    return 0;','}']:['int main() {','    insertEnd(10); insertEnd(20); insertEnd(30);',...(kind==='Doubly linked list'?['    displayForward();']:['    display();']),'    return 0;','}'];
 return [...pre,'',...node,'',...globals,'',...converted,'',...main];
}
export const phase4Code:Record<ExtendedListKind,Record<'C'|'C++',string[]>>={
 'Doubly linked list':{C:completeCode('Doubly linked list','C'),'C++':completeCode('Doubly linked list','C++')},
 'Circular linked list':{C:completeCode('Circular linked list','C'),'C++':completeCode('Circular linked list','C++')}
};
