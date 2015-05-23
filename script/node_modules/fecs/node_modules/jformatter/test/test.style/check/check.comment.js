var
    //a
a,
    //b
b, //c
c; //d

//0
if (doSomething()) //1
{ //2
    doSomething() //3
} //4
else //5
{ //6
    //7
} //8

/**
 * test
 */
if (doSomething()/*  */) { //1
    //j1k
    //jjj
} else { //3
    //5
}/* */
doSomething(p1 //a
, p2);/**
 */
doSomething(p1,/* p2 */ p2);/* do */

/**
 * foo
 * @param p1
 * @returns {number}
 */
function foo(p1) {
    /* num */
    return Number(p1);
}
