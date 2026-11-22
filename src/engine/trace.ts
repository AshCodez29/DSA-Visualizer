export type AlgorithmName = 'Linear search' | 'Binary search' | 'Bubble sort' | 'Selection sort' | 'Insertion sort' | 'Merge sort' | 'Quick sort';
export type TraceState = {
  line: number;
  operation: string;
  explanation: string;
  array: number[];
  index: number | null;
  secondary: number | null;
  checked: number[];
  result: number | null;
  variables: Record<string, string>;
  kind: 'init' | 'compare' | 'swap' | 'shift' | 'insert' | 'found' | 'done' | 'range' | 'pivot';
  sorted: number[];
  key: number | null;
  low: number | null;
  high: number | null;
  pass: number;
  comparisons: number;
  swaps: number;
};
const state = (a: number[], patch: Partial<TraceState> = {}): TraceState => {
  const merged = { line: 1, operation: 'Initialize', explanation: 'Prepare the input data.', array: a, index: null, secondary: null, checked: [], result: null, variables: {}, kind: 'init', sorted: [], key: null, low: null, high: null, pass: 0, comparisons: 0, swaps: 0, ...patch } as TraceState;
  return { ...merged, array: [...merged.array], variables: { ...merged.variables }, checked: [...merged.checked], sorted: [...merged.sorted] };
};

export function buildSearchTrace(name: 'Linear search' | 'Binary search', input: number[], target: number): TraceState[] {
  const a = [...input];
  const trace: TraceState[] = [];
  let comparisons = 0;
  if (name === 'Linear search') {
    trace.push(state(a, { line: 4, operation: 'Initialize index', explanation: 'Start at the first position. Array indexes begin at 0.', variables: { i: '0', key: String(target) } }));
    for (let i = 0; i < a.length; i++) {
      trace.push(state(a, { line: 6, operation: 'Check loop condition', explanation: `Check whether i (${i}) is still inside the array (length ${a.length}).`, index: i, variables: { i: String(i), key: String(target) } }));
      comparisons++;
      trace.push(state(a, { line: 7, operation: 'Compare values', explanation: `Compare arr[${i}] = ${a[i]} with key = ${target}.`, index: i, checked: Array.from({ length: i }, (_, n) => n), kind: 'compare', comparisons, variables: { i: String(i), key: String(target), current: String(a[i]) } }));
      if (a[i] === target) {
        trace.push(state(a, { line: 8, operation: 'Match found', explanation: `The values match. Return index ${i} (position ${i + 1}).`, index: i, checked: Array.from({ length: i + 1 }, (_, n) => n), result: i, kind: 'found', comparisons, variables: { i: String(i), key: String(target), result: String(i) } }));
        trace.push(state(a, { line: 12, operation: 'Return result', explanation: `Linear search is complete. The key is at index ${i}.`, index: i, checked: Array.from({ length: i + 1 }, (_, n) => n), result: i, kind: 'done', comparisons, variables: { result: String(i) } }));
        return trace;
      }
    }
    trace.push(state(a, { line: 11, operation: 'Return not found', explanation: 'The loop reached the end without a match. Return -1.', result: -1, kind: 'done', comparisons, checked: a.map((_, i) => i), variables: { result: '-1' } }));
    return trace;
  }
  let low = 0, high = a.length - 1;
  trace.push(state(a, { line: 5, operation: 'Initialize search range', explanation: 'Binary search needs sorted data. Begin with the full range of indexes.', low, high, variables: { low: String(low), high: String(high), key: String(target) } }));
  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    trace.push(state(a, { line: 7, operation: 'Find middle index', explanation: `mid = low + (high - low) / 2 = ${mid}.`, index: mid, low, high, kind: 'range', variables: { low: String(low), high: String(high), mid: String(mid), key: String(target) } }));
    comparisons++;
    trace.push(state(a, { line: 8, operation: 'Compare with middle', explanation: `Compare arr[${mid}] = ${a[mid]} with key = ${target}.`, index: mid, low, high, kind: 'compare', comparisons, variables: { low: String(low), high: String(high), mid: String(mid), key: String(target), current: String(a[mid]) } }));
    if (a[mid] === target) {
      trace.push(state(a, { line: 9, operation: 'Match found', explanation: `The middle value matches. Return index ${mid}.`, index: mid, low, high, result: mid, kind: 'found', comparisons, variables: { low: String(low), high: String(high), mid: String(mid), result: String(mid) } }));
      trace.push(state(a, { line: 15, operation: 'Return result', explanation: `Binary search is complete. The key is at index ${mid}.`, index: mid, low, high, result: mid, kind: 'done', comparisons, variables: { result: String(mid) } }));
      return trace;
    }
    if (a[mid] < target) {
      trace.push(state(a, { line: 11, operation: 'Discard left half', explanation: `${a[mid]} is less than ${target}. Values through mid cannot be the key, so set low = mid + 1.`, index: mid, low, high, kind: 'range', comparisons, checked: Array.from({ length: mid + 1 }, (_, i) => i), variables: { low: String(low), high: String(high), mid: String(mid), key: String(target) } }));
      low = mid + 1;
    } else {
      trace.push(state(a, { line: 13, operation: 'Discard right half', explanation: `${a[mid]} is greater than ${target}. Values from mid onward cannot be the key, so set high = mid - 1.`, index: mid, low, high, kind: 'range', comparisons, checked: Array.from({ length: a.length - mid }, (_, i) => mid + i), variables: { low: String(low), high: String(high), mid: String(mid), key: String(target) } }));
      high = mid - 1;
    }
  }
  trace.push(state(a, { line: 17, operation: 'Return not found', explanation: 'low moved past high. The key is not in this sorted array.', low, high, result: -1, kind: 'done', comparisons, variables: { low: String(low), high: String(high), result: '-1' } }));
  return trace;
}

export function buildSortTrace(name: Exclude<AlgorithmName, 'Linear search' | 'Binary search'>, input: number[]): TraceState[] {
  const a = [...input], n = a.length, trace: TraceState[] = [];
  let comparisons = 0, swaps = 0;
  const emit = (line: number, operation: string, explanation: string, patch: Partial<TraceState> = {}) => trace.push(state(a, { line, operation, explanation, comparisons, swaps, ...patch }));
  const compare = (i: number, j: number, extra: Partial<TraceState> = {}) => { comparisons++; emit(extra.line ?? 7, extra.operation ?? 'Compare values', extra.explanation ?? `Compare ${a[i]} and ${a[j]}.`, { kind: 'compare', index: i, secondary: j, comparisons, ...extra }); };
  if (name === 'Bubble sort') {
    emit(4, 'Start first pass', 'Compare each adjacent pair. The largest unsorted value moves to the end.');
    for (let i=0;i<n-1;i++) { let changed=false; for(let j=0;j<n-1-i;j++) { compare(j,j+1,{line:6,pass:i+1,variables:{pass:String(i+1),i:String(i),j:String(j)}}); if(a[j]>a[j+1]) { [a[j],a[j+1]]=[a[j+1],a[j]]; swaps++; changed=true; emit(8,'Swap adjacent values',`${a[j]} and ${a[j+1]} were out of order, so exchange them.`,{line:8,kind:'swap',index:j,secondary:j+1,pass:i+1,swaps,sorted:Array.from({length:i},(_,k)=>n-1-k),variables:{i:String(i),j:String(j)}}); } } emit(10,`Pass ${i+1} complete`,`The largest remaining value is now fixed at index ${n-1-i}.`,{pass:i+1,sorted:Array.from({length:i+1},(_,k)=>n-1-k)}); if(!changed) break; }
  } else if (name === 'Selection sort') {
    for(let i=0;i<n-1;i++) { let min=i; emit(5,'Select current position',`Assume arr[${i}] = ${a[i]} is the minimum in the unsorted part.`,{line:5,index:i,pass:i+1,variables:{i:String(i),min:String(min)}}); for(let j=i+1;j<n;j++){compare(min,j,{line:7,pass:i+1,variables:{i:String(i),j:String(j),min:String(min)}}); if(a[j]<a[min]){min=j;emit(8,'Update minimum',`${a[j]} is the smallest value seen so far.`,{line:8,index:min,secondary:i,pass:i+1,variables:{i:String(i),j:String(j),min:String(min)}});}} if(min!==i){[a[i],a[min]]=[a[min],a[i]];swaps++;emit(11,'Place minimum',`Swap the minimum into position ${i}.`,{line:11,kind:'swap',index:i,secondary:min,pass:i+1,swaps,variables:{i:String(i),min:String(min)}});} }
  } else if (name === 'Insertion sort') {
    for(let i=1;i<n;i++){const key=a[i];let j=i-1;emit(5,'Pick the key',`Temporarily hold ${key}; insert it into the sorted left portion.`,{line:5,index:i,key,pass:i,variables:{i:String(i),j:String(j),key:String(key)}});while(j>=0){comparisons++;emit(7,'Compare with key',`Compare arr[${j}] = ${a[j]} with key = ${key}.`,{line:7,index:j,secondary:i,key,pass:i,comparisons,variables:{i:String(i),j:String(j),key:String(key)}});if(a[j]>key){a[j+1]=a[j];emit(8,'Shift value right',`Move ${a[j]} one position right to make room for the key.`,{line:8,kind:'shift',index:j,secondary:j+1,key,pass:i,variables:{i:String(i),j:String(j),key:String(key)}});j--;}else break;}a[j+1]=key;emit(10,'Insert key',`Place ${key} at index ${j+1}.`,{line:10,kind:'insert',index:j+1,key,pass:i,variables:{i:String(i),j:String(j+1),key:String(key)}});}
  } else if (name === 'Merge sort') {
    const mergeSort=(lo:number,hi:number,depth:number):void=>{if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);emit(5,'Split range',`Split indexes ${lo}–${hi} into ${lo}–${mid} and ${mid+1}–${hi}.`,{line:5,kind:'range',index:lo,secondary:hi,low:lo,high:hi,pass:depth,variables:{left:String(lo),mid:String(mid),right:String(hi)}});mergeSort(lo,mid,depth+1);mergeSort(mid+1,hi,depth+1);const left=a.slice(lo,mid+1),right=a.slice(mid+1,hi+1);let i=0,j=0,k=lo;while(i<left.length&&j<right.length){comparisons++;emit(10,'Compare merge values',`Compare ${left[i]} and ${right[j]} before placing the smaller value.`,{line:10,kind:'compare',index:k,secondary:k,comparisons,pass:depth,variables:{i:String(i),j:String(j),k:String(k)}});a[k++]=left[i]<=right[j]?left[i++]:right[j++];emit(12,'Write merged value',`Write ${a[k-1]} into index ${k-1}.`,{line:12,kind:'insert',index:k-1,pass:depth,variables:{k:String(k-1)}});}while(i<left.length){a[k++]=left[i++];emit(12,'Copy left value',`Copy ${a[k-1]} into the merged range.`,{line:12,kind:'insert',index:k-1,pass:depth});}while(j<right.length){a[k++]=right[j++];emit(13,'Copy right value',`Copy ${a[k-1]} into the merged range.`,{line:13,kind:'insert',index:k-1,pass:depth});}emit(15,'Merge complete',`Indexes ${lo}–${hi} are now merged in order.`,{line:15,low:lo,high:hi,pass:depth,kind:'done'});}; if(n)mergeSort(0,n-1,1);
  } else {
    const partition=(lo:number,hi:number):number=>{const pivot=a[hi];let i=lo-1;emit(5,'Choose pivot',`Use the last value, ${pivot}, as the pivot for indexes ${lo}–${hi}.`,{line:5,index:hi,key:pivot,low:lo,high:hi,kind:'pivot',variables:{low:String(lo),high:String(hi),pivot:String(pivot)}});for(let j=lo;j<hi;j++){comparisons++;emit(7,'Compare with pivot',`Compare ${a[j]} with pivot ${pivot}.`,{line:7,index:j,secondary:hi,key:pivot,low:lo,high:hi,kind:'compare',comparisons,variables:{i:String(i),j:String(j),pivot:String(pivot)}});if(a[j]<=pivot){i++;if(i!==j){[a[i],a[j]]=[a[j],a[i]];swaps++;emit(9,'Swap into left partition',`Move ${a[i]} into the group of values no greater than the pivot.`,{line:9,index:i,secondary:j,low:lo,high:hi,kind:'swap',swaps,variables:{i:String(i),j:String(j),pivot:String(pivot)}});}}}if(i+1!==hi){[a[i+1],a[hi]]=[a[hi],a[i+1]];swaps++;}emit(11,'Place pivot',`Place pivot ${pivot} at its final index ${i+1}.`,{line:11,index:i+1,key:pivot,low:lo,high:hi,kind:'pivot',swaps,variables:{pivot:String(pivot),pivotIndex:String(i+1)}});return i+1;};const quick=(lo:number,hi:number):void=>{if(lo<hi){const p=partition(lo,hi);quick(lo,p-1);quick(p+1,hi);}};if(n)quick(0,n-1);
  }
  emit(name==='Merge sort'?15:12,'Sorting complete','The array is in ascending order.',{kind:'done',sorted:a.map((_,i)=>i),low:null,high:null,variables:{comparisons:String(comparisons),swaps:String(swaps)}});
  return trace.length ? trace : [state(a,{operation:'Nothing to sort',explanation:'Add at least one number to the array.',kind:'done'})];
}

export const codeSamples: Record<AlgorithmName, { C: string[]; 'C++': string[] }> = {
  'Linear search': { C:['#include <stdio.h>','','int linearSearch(int arr[], int n, int key) {','    int i;','    for (i = 0; i < n; i++) {','        if (arr[i] == key) {','            return i;','        }','    }','    return -1;','}','','int main() {','    int arr[] = {12, 7, 24, 9, 31, 18};','    int n = 6, key = 24;','    int result = linearSearch(arr, n, key);','    printf("Index: %d\\n", result);','    return 0;','}'], 'C++':['#include <iostream>','using namespace std;','','int linearSearch(int arr[], int n, int key) {','    int i;','    for (i = 0; i < n; i++) {','        if (arr[i] == key) {','            return i;','        }','    }','    return -1;','}','','int main() {','    int arr[] = {12, 7, 24, 9, 31, 18};','    int n = 6, key = 24;','    int result = linearSearch(arr, n, key);','    cout << "Index: " << result << endl;','    return 0;','}'] },
  'Binary search': { C:['#include <stdio.h>','','int binarySearch(int arr[], int n, int key) {','    int low = 0, high = n - 1;','    while (low <= high) {','        int mid = low + (high - low) / 2;','        if (arr[mid] == key) return mid;','        if (arr[mid] < key) low = mid + 1;','        else high = mid - 1;','    }','    return -1;','}','','int main() {','    int arr[] = {7, 12, 18, 24, 31, 40};','    int result = binarySearch(arr, 6, 24);','    printf("Index: %d\\n", result);','    return 0;','}'], 'C++':['#include <iostream>','using namespace std;','','int binarySearch(int arr[], int n, int key) {','    int low = 0, high = n - 1;','    while (low <= high) {','        int mid = low + (high - low) / 2;','        if (arr[mid] == key) return mid;','        if (arr[mid] < key) low = mid + 1;','        else high = mid - 1;','    }','    return -1;','}','','int main() {','    int arr[] = {7, 12, 18, 24, 31, 40};','    int result = binarySearch(arr, 6, 24);','    cout << "Index: " << result << endl;','    return 0;','}'] },
  'Bubble sort': sortCode('bubble'), 'Selection sort': sortCode('selection'), 'Insertion sort': sortCode('insertion'), 'Merge sort': sortCode('merge'), 'Quick sort': sortCode('quick'),
};
function sortCode(type:string): {C:string[];'C++':string[]} { const body:Record<string,string[]>={bubble:['void bubbleSort(int arr[], int n) {','    int i, j, temp;','    for (i = 0; i < n - 1; i++) {','        for (j = 0; j < n - 1 - i; j++) {','            if (arr[j] > arr[j + 1]) {','                temp = arr[j];','                arr[j] = arr[j + 1];','                arr[j + 1] = temp;','            }','        }','    }','}'],selection:['void selectionSort(int arr[], int n) {','    int i, j, min, temp;','    for (i = 0; i < n - 1; i++) {','        min = i;','        for (j = i + 1; j < n; j++)','            if (arr[j] < arr[min]) min = j;','        temp = arr[i]; arr[i] = arr[min]; arr[min] = temp;','    }','}'],insertion:['void insertionSort(int arr[], int n) {','    int i, j, key;','    for (i = 1; i < n; i++) {','        key = arr[i];','        j = i - 1;','        while (j >= 0 && arr[j] > key) {','            arr[j + 1] = arr[j];','            j--;','        }','        arr[j + 1] = key;','    }','}'],merge:['void merge(int arr[], int left, int mid, int right) {','    int i = left, j = mid + 1, k = left;','    int temp[100];','    while (i <= mid && j <= right) {','        if (arr[i] <= arr[j]) temp[k++] = arr[i++];','        else temp[k++] = arr[j++];','    }','    while (i <= mid) temp[k++] = arr[i++];','    while (j <= right) temp[k++] = arr[j++];','    for (i = left; i <= right; i++) arr[i] = temp[i];','}','void mergeSort(int arr[], int left, int right) {','    if (left < right) {','        int mid = (left + right) / 2;','        mergeSort(arr, left, mid);','        mergeSort(arr, mid + 1, right);','        merge(arr, left, mid, right);','    }','}'],quick:['int partition(int arr[], int low, int high) {','    int pivot = arr[high];','    int i = low - 1, j, temp;','    for (j = low; j < high; j++) {','        if (arr[j] <= pivot) {','            i++; temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;','        }','    }','    temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;','    return i + 1;','}','void quickSort(int arr[], int low, int high) {','    if (low < high) {','        int p = partition(arr, low, high);','        quickSort(arr, low, p - 1);','        quickSort(arr, p + 1, high);','    }','}']}; const b=body[type];const functionName:Record<string,string>={bubble:'bubbleSort',selection:'selectionSort',insertion:'insertionSort',merge:'mergeSort',quick:'quickSort'}; const call=type==='merge'||type==='quick'?`    ${functionName[type]}(arr, 0, n - 1);`:`    ${functionName[type]}(arr, n);`; return {C:['#include <stdio.h>','',...b,'','int main() {','    int arr[] = {40, 10, 30, 20, 50};','    int n = 5;',call,'    printf("%d %d %d %d %d\\n", arr[0], arr[1], arr[2], arr[3], arr[4]);','    return 0;','}'], 'C++':['#include <iostream>','using namespace std;','',...b,'','int main() {','    int arr[] = {40, 10, 30, 20, 50};','    int n = 5;',call,'    for (int i = 0; i < n; i++) cout << arr[i] << \" \";','    cout << endl;','    return 0;','}']}; }

export function complexityFor(name: AlgorithmName) { const data:Record<AlgorithmName,{best:string;average:string;worst:string;space:string;note:string}>={ 'Linear search':{best:'O(1)',average:'O(n)',worst:'O(n)',space:'O(1)',note:'May check each element once.'},'Binary search':{best:'O(1)',average:'O(log n)',worst:'O(log n)',space:'O(1)',note:'Halves the search range each step; input must be sorted.'},'Bubble sort':{best:'O(n)',average:'O(n²)',worst:'O(n²)',space:'O(1)',note:'Adjacent comparisons; early exit helps an already sorted array.'},'Selection sort':{best:'O(n²)',average:'O(n²)',worst:'O(n²)',space:'O(1)',note:'Scans the remaining values to select the next minimum.'},'Insertion sort':{best:'O(n)',average:'O(n²)',worst:'O(n²)',space:'O(1)',note:'Shifts values into a growing sorted prefix.'},'Merge sort':{best:'O(n log n)',average:'O(n log n)',worst:'O(n log n)',space:'O(n)',note:'Splits the array, then merges sorted halves.'},'Quick sort':{best:'O(n log n)',average:'O(n log n)',worst:'O(n²)',space:'O(log n)',note:'Partitions around a pivot; a poor pivot can make partitions uneven.'}};return data[name]; }
