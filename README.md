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

#### Updating IPFS imports:

If you modify a file and save it to IPFS, all files that import it will keep using the old version, because Moon guarantees that a file's behavior doesn't change if its contents don't change. To amend that, `moon-tool` provides the replace command, which allows you to change the contents of a file, save it to IPFS and update all imports that refer to the old version. Example:

```bash
# creates a `helloworld.moon` file which imports a `hello.moon` file

$ echo "\"hello\"" > hello.moon

$ echo "[$(moon save hello) \"world\"]" > helloworld.moon

# Prints and runs both files

$ cat hello.moon
"hello"

$ moon run hello
"hello"

$ cat helloworld.moon
[zb2rhfsstEj5riwMdMpKep4h1MmCXTzKYrucQJ6TEqRCRRxAw "world"]

$ moon run helloworld
["hello" "world"]

# Rewrites `hello.moon`'s contents

$ moon replace $(cat hello.moon) "\"hola\""
zb2rhfsstEj5riwMdMpKep4h1MmCXTzKYrucQJ6TEqRCRRxAw -> zb2rhf5uqM37QCXN8VMTXYPDA2XB2w1fwHzy91CjWovJmVGUW (hello.moon)
zb2rhiNoCanP5qCJeePx5zEyp8EBp9tBgGrEmQJ1K7ZKNSena -> zb2rhkikpZPfJGvJJ2wyUSTe9W4zeKBJHuaSrfpFBpbH18M3N (helloworld.moon)

# Prints and runs both files again

$ cat hello.moon
"hola"

$ moon run hello
"hola"

$ cat helloworld.moon
[zb2rhf5uqM37QCXN8VMTXYPDA2XB2w1fwHzy91CjWovJmVGUW "world"]

$ moon run helloworld
["hola" "world"]

# Notice `helloworld.moon` changed accourdingly.
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
