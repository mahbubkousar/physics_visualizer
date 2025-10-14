# glsl-parser (SICMUtils fork of https://github.com/stackgl/glsl-parser)

A GLSL parser that takes tokens from
[glsl-tokenizer](http://github.com/stackgl/glsl-tokenizer) and turns them into
an AST.

May either be used synchronously or as a stream.

## API

NOTE: This fork of https://github.com/stackgl/glsl-parser removes the streaming
api (in `stream.js`) to exclude the `through` dependency, which causes problems
with Mathbox. See [this issue](https://gitgud.io/unconed/mathbox/-/issues/20)
for details.

### `ast = require('@sicmutils/glsl-parser/direct')(tokens)`

Synchronously parses an array of tokens from `glsl-tokenizer`.

``` javascript
var TokenString = require('glsl-tokenizer/string')
var ParseTokens = require('@sicmutils/glsl-parser/direct')
var fs = require('fs')

var src = fs.readFileSync('test.glsl', 'utf8')
var tokens = TokenString(src)
var ast = ParseTokens(tokens)

console.log(ast)
```

## Nodes

* `stmtlist`
* `stmt`
* `struct`
* `function`
* `functionargs`
* `decl`
* `decllist`
* `forloop`
* `whileloop`
* `if`
* `expr`
* `precision`
* `comment`
* `preprocessor`
* `keyword`
* `ident`
* `return`
* `continue`
* `break`
* `discard`
* `do-while`
* `binary`
* `ternary`
* `unary`

## Known Issues

* the parser might hit a state where it's looking at what *could be* an
expression, or it could be a declaration -- that is, the statement starts with a
previously declared `struct`. it'll opt to pretend it's a declaration, but that
might not be the case -- it might be a user-defined constructor starting a
statement!

* "unhygenic" `#if` / `#endif` macros are completely unhandled at the moment,
since they're a bit of a pain. if you've got unhygenic macros in your code, move
the #if / #endifs to statement level, and have them surround wholly parseable
code. this sucks, and i am sorry.

## License

MIT, see [LICENSE.md](LICENSE.md) for more details.
