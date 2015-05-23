//case for UnaryExpression
;"undefined" == typeof window.test && undefined === null && function (e) {
    window.test = +e;
    window.test = -e;
    window.test = !e;
}(window);
