# Metro Journey Compiler

A compiler for a tiny Delhi Metro journey language, with a browser playground.

```
board Rajiv Chowk; ride Yellow to Hauz Khas; change Magenta; ride to Botanical Garden; exit
```

compiles to a journey card listing the stations, interchanges and an estimated time. It is rejected with
a precise error if the journey isn't possible.

## Run

```sh
npm install
npm run dev        # playground at http://localhost:5173
npm test           # compiler test suite
npm run build      # static site in dist/ (deploy anywhere)
```

## Language

| Statement | Meaning |
|---|---|
| `board <station>` | Start the journey (exactly once, first). |
| `ride <line> to <station>` | Ride a line. The line is required on the first ride unless the station has only one line. |
| `ride to <station>` | Keep riding the current line. |
| `change <line>` | Switch lines. Only at a real interchange served by both lines. |
| `exit` | End the journey (exactly once, last). |

Statements are separated by `;` or new lines. `#` starts a comment. Names are case, space and
punctuation insensitive (`rk puram` = `R.K. Puram`), and common aliases work (`Connaught Place`, `INA`, `T3`).

## Pipeline

```
source ─► lexer ─► parser ─► AST ─► checker ─► lowering ─► journey card / IR
                                       ▲
                               network (symbol table)
```

| File | Stage |
|---|---|
| `src/compiler/lexer.ts` | Tokens: keywords, words, separators, comments |
| `src/compiler/parser.ts` | Recursive descent, joins words into multi-word names, recovers from errors |
| `src/compiler/checker.ts` | Semantic rules, run as a small interpreter over (station, line) state |
| `src/compiler/lower.ts` | Legs, transfers and the time estimate |
| `src/compiler/network*.ts` | Lines and stations, branches as services, Dijkstra route planner |
| `src/ui/` | Playground: highlighted editor, problems with fix buttons, card, Tokens/AST/IR views |

### Diagnostics

Syntax errors are `E1xx`, semantic errors `E2xx`, warnings `W3xx` and suggestions `I4xx`. Most come
with a fix that can be applied in one click. Key rules:

- `E208`: a station is not on the line you're riding (the fix suggests a working route)
- `E211`: switching lines without `change`
- `E212` / `E213`: `change` at a station that isn't an interchange, or that the new line doesn't serve
- `E216`: two stations on different branches of one line (Blue → Vaishali, Green → Kirti Nagar)
- `I401`: the journey is valid, but a much faster route exists

### Time model

3 min initial wait, plus about 2.2 min per stop (4.5 on Airport Express, 2.5 on Grey), plus 5 min per
interchange and 4 min per same-line train change. Constants are in `src/compiler/network.ts`.

## Data

`src/compiler/network-data.ts` is a hand-entered snapshot of the operational network. It covers the Red,
Yellow, Blue, Green, Violet, Pink, Magenta, Airport Express and Grey lines. Aqua and Rapid Metro are not
included, and neither are Phase 4 sections still under construction. Check it against the current DMRC
map. Interchanges aren't listed by hand: any station on two or more lines is one.
