"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Hello world!');
var express = require("express");
var app = express();
app.listen(process.env.PORT || 8080, function () {
    console.log('App listening on port 8080!');
});
//# sourceMappingURL=index.js.map