do {
    if ( (elemLang = documentIsHTML ?
    elem.lang :
    elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
        elemLang = elemLang.toLowerCase();
    }
} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
do
    doSomething();
while(true);