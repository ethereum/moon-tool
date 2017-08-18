## moon-tool

Command-line tool for [Moon-lang](https://github.com/maiavictor/moon-lang). Allows you to:

- Run expressions and files from the command-line;

- Load/save expressions and files to IPFS;

- Pack/unpack, compile to JS, etc...

## Installing

```bash
npm i -g moon-tool
```

## Usage

#### Inline execution:

```bash
moon run '(add 1 2)'        -- output: 3
moon run 'x=4 y=2 [x y]'    -- output: [4 2]
moon run '((x => [x x]) 3)' -- output: [3 3]
```

#### File execution:

```bash
echo '"Hello"' >> hi.moon
moon run hi -- output: "Hello"
```

#### Saving to IPFS:

```bash
moon save 'x => (add x 1)'
-- output: zb2rhoKHTgNBYJDnzaBn8uaCpKuX9iGpsc2hpLdE2k2YTD1jH
```

After you save an expression, you may use its hash inside other expressions: `moon run` recursively imports IPFS hashes.

#### Loading from IPFS:

```bash
moon load zb2rhoKHTgNBYJDnzaBn8uaCpKuX9iGpsc2hpLdE2k2YTD1jH
-- output: x => (add x 1)
```

#### Running with side-effects:

```bash
moon runIO 'ask => end => (ask "prompt" "Hi!" then => (end 0))'
```

Moon is pure, but you can still peform side-effects by evaluating computations in a side-effective language. The `runIO` command does that with default side-effects.


#### Compiling to JavaScript:

```bash
moon compile 'x => (mul x 10)'
```
