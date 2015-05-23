var a = "\n\r\t\u0020";
var str1 = "abc, 123";
var str2 = "abc, \'123";
var str3 = "abc, \"123";
var str4 = "abc, '123";
var str5 = "abc, \''123";
var str6 = 'abc, \'\'123';
var str7 = "aa\
bb";
var obj = {
    "a-1": 1,
    "a-\"1": 1,
    "a-'1": 1,
    "a-\'1": 1,
    "'": 1,
    "\"\\": 1,
    "var": 1
};