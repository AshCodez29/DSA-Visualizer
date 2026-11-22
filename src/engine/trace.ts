export type TraceState = {
  line: number;
  operation: string;
  explanation: string;
  array: number[];
  index: number | null;
  target: number;
  checked: number[];
  result: number | null;
  variables: Record<string, string>;
};

/** Build a deterministic state after each meaningful line in linear search. */
export function buildLinearSearchTrace(array: number[], target: number): TraceState[] {
  const trace: TraceState[] = [];
  const checked: number[] = [];
  let result: number | null = null;
  trace.push({ line: 2, operation: 'Initialize index', explanation: 'Start at the first array position. In C and C++, array indexing begins at 0.', array: [...array], index: null, target, checked: [], result, variables: { i: '0', key: String(target) } });
  for (let i = 0; i < array.length; i++) {
    trace.push({ line: 4, operation: 'Check loop condition', explanation: `Is i (${i}) less than the array length (${array.length})?`, array: [...array], index: i, target, checked: [...checked], result, variables: { i: String(i), key: String(target) } });
    trace.push({ line: 5, operation: 'Compare values', explanation: `Compare arr[${i}] (${array[i]}) with key (${target}).`, array: [...array], index: i, target, checked: [...checked], result, variables: { i: String(i), key: String(target), current: String(array[i]) } });
    if (array[i] === target) {
      result = i;
      trace.push({ line: 6, operation: 'Match found', explanation: `The values match. Save index ${i} and return it.`, array: [...array], index: i, target, checked: [...checked, i], result, variables: { i: String(i), key: String(target), current: String(array[i]), found: String(i) } });
      trace.push({ line: 10, operation: 'Return result', explanation: `Linear search is complete. The key is at index ${i} (position ${i + 1}).`, array: [...array], index: i, target, checked: [...checked, i], result, variables: { result: String(i) } });
      return trace;
    }
    checked.push(i);
  }
  trace.push({ line: 4, operation: 'Loop ends', explanation: 'i reached the array length. Every element was checked, so the key is not present.', array: [...array], index: null, target, checked: [...checked], result, variables: { i: String(array.length), key: String(target) } });
  trace.push({ line: 9, operation: 'Return not found', explanation: 'No match was found. Return -1 as the not-found value.', array: [...array], index: null, target, checked: [...checked], result: -1, variables: { result: '-1' } });
  return trace;
}

export const codeSamples = {
  C: [
    '#include <stdio.h>', '', 'int linearSearch(int arr[], int n, int key) {', '    int i;', '    for (i = 0; i < n; i++) {', '        if (arr[i] == key) {', '            return i;', '        }', '    }', '    return -1;', '}', '', 'int main() {', '    int arr[] = {12, 7, 24, 9, 31, 18};', '    int n = 6, key = 24;', '    int result = linearSearch(arr, n, key);', '    printf("Index: %d\\n", result);', '    return 0;', '}',
  ],
  'C++': [
    '#include <iostream>', 'using namespace std;', '', 'int linearSearch(int arr[], int n, int key) {', '    int i;', '    for (i = 0; i < n; i++) {', '        if (arr[i] == key) {', '            return i;', '        }', '    }', '    return -1;', '}', '', 'int main() {', '    int arr[] = {12, 7, 24, 9, 31, 18};', '    int n = 6, key = 24;', '    int result = linearSearch(arr, n, key);', '    cout << "Index: " << result << endl;', '    return 0;', '}',
  ],
} as const;
