

#### Work Ex Questions –  

Tell me about a technical challenge you faced in your previous project and how you solved it.

Cultural Fit Questions –

1.       Have you ever had a disagreement with your colleague/supervisor on any approach and how did you come to a conclusion on it.

Technical Questions –

1.      Given a pointer to the nth node in the linked list how do you delete it in O(1).

2.       What is Event Loop in nodeJS?

3.       Given a string, you need to reverse the order of characters in each word within a sentence while still preserving whitespace and initial word order.

a.       Example:

b.       Input: "Let's take a drink”

c.       Output: "s'teL ekat a knirk”

d.       Note: In the string, each word is separated by single space and there will not be any extra space in the string.

4.       Find the Square root of an integer – start with O(n) and optimize the solution as much as u can till O(Log n)

·         Input: x = 4

·         Output: 2

·         Input: x = 11

·         Output: 3

5.       Q2. Rearrange positive and negative numbers in a given array maintaining the order of occurrence – optimize with “constant extra space”

·         Input:  [12 11 -13 -5 6 -7 5 -3 -6]

·         Output: [-13 -5 -7 -3 -6 12 11 6 5]

```typescript

function rearrangeNegativeAndPostive(A){
    let min = Number.MAX_SAFE_INTEGER, max = -Number.MAX_SAFE_INTEGER;
    for(let i=0; i<A.length; i++){
        if(A[i] > max)
            max = A[i];
        if(A[i] < min)
            min = A[i];
    }
    //Change all values to Positive
    for(let i=0; i<A.length; i++)
        A[i]-= min;
    const newMax = max-min+1;        
    //Save original negative values into new positions
    let currNegativeIndex = 0;
    for(let i=0; i<A.length; i++)
        if(A[i]%newMax < (-min))
            A[currNegativeIndex++] += (A[i]%newMax)*newMax;
    //Save original positive values into new positions
    let currPositiveIndex = currNegativeIndex;
    for(let i=0; i<A.length; i++)
        if(A[i]%newMax > (-min))
            A[currPositiveIndex++] += (A[i]%newMax)*newMax;
    //Recover to original value 
    for(let i=0; i<A.length; i++){
        A[i] = Math.floor(A[i]/newMax) + min; 
    }
}

```


Front End questions (I’ve added):

Write a JavaScript program to sort the items of an array.
How would you merge two sorted array?
How do you remove duplicate characters from a sting?




1. Technical challegenge - introducing real-time features to a web application using websockets, and having web clients
connect to the right websocket server.

2. Usually disagreements are resolved by discussing and whiteboarding, the best solution wins, ultimately the supervisor makes
the decision.

----------

1. A linked-list is designed so that the remove() functionality is O(1), in fact that is the main motivation to use
a linked-list instead of simple array.

2. Event-loop is a language architecture for processing the program - timers, i/o, callbacks, etc, are handled for every
tick of the event loop. The event loop for Node.js is processed by Libuv library.
See: https://github.com/libuv/libuv/blob/v1.x/src/unix/core.c#L341

The event loop differs for example from the actor model.

3. Reverse words:

```typescript

const reverseWords = function(s: string) : string {
  return s.split(/\s+/g).map(v => {
    return v.split('').reverse().join('');
  })
  .join(' ');
};

console.log(reverseWords("Let's take a drink"));

```



# Write a JavaScript program to sort the items of an array.
How would you merge two sorted array?
How do you remove duplicate characters from a sting?

```typescript

let sortingMethod = (a,b) => a-b;  // you didn't specify how to sort, so we just sort this way
const a = [], b = [];
const set = new Set([...a.sort(sortingMethod),...b.sort(sortingMethod)]);

// The set has unqiue items in it, and you can get an array from the set using:

const uniqueList = Array.from(set);
```





