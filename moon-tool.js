#!/usr/bin/env node --harmony-tailcalls

var fs = require("fs");
var util = require("util");
var exec = util.promisify(require("child_process").exec);
var path = require("path");
var Moon = require("moon-lang");
var nodeIO = () => require("moon-lang/lib/moon-io-node.js");
var packageJson = require("./package.json");

// Gets the command line arguments and options
var args = [].slice.call(process.argv, 2);
var opts = {};
loop: while (1) {
  switch (args[0]) {
    case "--ipfs-url":
      opts["ipfs-url"] = args[1];
      args.splice(0, 2);
      break;
    default:
      break loop;
  }
}

var moon = Moon(opts["ipfs-url"] || "https://ipfs.infura.io:5001");
var performIO = program => moon.performIO(program, nodeIO());

var val = () => {
  var val = args[args.length - 1];
  var file = path.join(process.cwd(), val.slice(-5) === ".moon" ? val : val + ".moon");
  if (fs.existsSync(file)) {
    val = fs.readFileSync(file, "utf8");
  }
  return val; 
}

(async () => {

  try {

    switch ((args[0]||"").toLowerCase()) {
      case "run":
        console.log
          (moon.run
          (await moon.imports
          (await val())));
        break;

      case "runio":
        (moon.stringify
        (await performIO
        (moon.parse
        (await moon.imports
        (await val())))));
        process.exit();
        break;

      case "format":
        console.log
          (moon.format
          (await val()));
        process.exit();
        break;

      case "pack":
        console.log
          (moon.pack
          (await val()));
        break;

      case "unpack":
        console.log
          (moon.unpack
          (await val()));
        break;
        
      case "compile":
        console.log
          (moon.compile
          (await moon.imports
          (await val())));
        break;
        
      case "save":
        console.log
          (await moon.save
          (await val()));
        break;

      case "load":
        console.log
          (await moon.load
          (await val()));
        break;

      case "imports":
        console.log
          (await moon.imports
          (await val()));
        break;

      case "cid":
        console.log
          (await moon.cid
          (await val()));
        break;

      case "version":
        console.log(packageJson.version);
        break;

      case "replace":
        try {
          await exec("which ag");
        } catch (e) {
          console.log("This command requires ag (the silver searcher) installed.");
          break;
        };

        const find = async expr => {
          try {
            var files = await exec("ag '" + expr + "' -l");
          } catch (e) {
            var files = {stdout: ""};
          }
          return files
            .stdout
            .split("\n")
            .slice(0,-1)
            .map(file => path.join(".", file));
        };

        const replace = async (file, old, neo) => {
          const oldContents = fs.readFileSync(file, "utf8");
          const newContents = oldContents.replace(new RegExp(old,"g"), neo);
          const oldCid = await moon.cid(oldContents);
          const newCid = await moon.save(newContents);
          fs.writeFileSync(file, newContents);
          console.log(oldCid + " -> " + newCid + " (" + file + ")");
          const changedFiles = await find(oldCid);
          for (let i = 0; i < changedFiles.length; ++i) {
            await replace(changedFiles[i], oldCid, newCid);
          };
        };

        // Replaces single file, adjust imports
        if (args[1].slice(-5) === ".moon") {
          replace(args[1], fs.readFileSync(args[1], "utf8"), args[2]);
        // Search/replaces a regex, adjust imports
        } else {
          const files = await find(args[1]);
          for (let i = 0; i < files.length; ++i) {
            await replace(files[i], args[1], args[2]);
          };
        }

        break;

      default:
        console.log("Moon-Lang ☾");
        console.log("");
        console.log("");
        console.log("# Options:");
        console.log("");
        console.log("  --ipfs-url <url>             -- IPFS url. Default: Infura");
        console.log("");
        console.log("# Commands:");
        console.log("");
        console.log("  moon run <expr/file>         -- runs an expr/file");
        console.log("  moon pack <expr/file>        -- packs an expr/file to binary");
        console.log("  moon unpack <expr/file>      -- unpacks a packed term");
        console.log("  moon stringify <expr/file>   -- displays an expr/file");
        console.log("  moon compile <expr/file>     -- compiles an expr/file to JS");
        console.log("  moon save <expr/file>        -- saves an expr/file to IPFS");
        console.log("  moon load <expr/file>        -- loads an expr/file from IPFS");
        console.log("  moon cid <expr/file>         -- gets the IPFS ID of an expr/file");
        console.log("  moon imports <expr/file>     -- recursively imports an expr/file");
        console.log("  moon version                 -- prints the version");
        console.log("  moon replace <expr/file> val -- recursive replace, readjusts imports");
        console.log("");
        console.log("# Inline execution:");
        console.log("");
        console.log("  moon run '(add 1 2)'        -- output: 3");
        console.log("  moon run 'x=4 y=2 [x y]'    -- output: [4 2]");
        console.log("  moon run '((x => [x x]) 3)' -- output: [3 3]");
        console.log("");
        console.log("# File execution:");
        console.log("");
        console.log("  echo '\"Hello\"' >> hi.moon");
        console.log("  moon run hi -- output: \"Hello\"");  
        console.log("");
        console.log("# Saving to IPFS:");
        console.log("");
        console.log("  moon save 'x => (add x 1)'");
        console.log("");
        console.log("  After you save an expression, you may use its hash inside");
        console.log("  other expressions: `moon run` recursively imports IPFS hashes.");
        console.log("");
        console.log("# Loading from IPFS:");
        console.log("");
        console.log("  moon load zb2rhea5n8bErvkLE3fBgJjUd8noxXMunHUisVH4HhDxhSrMn");
        console.log("");
        console.log("# Running with side-effects:");
        console.log("");
        console.log("  moon runIO 'ask => end => (ask \"prompt\" \"Hi!\" then => (end 0))'")
        console.log("");
        console.log("  Moon is pure, but you can still peform side-effects by");
        console.log("  evaluating computations in a side-effective language.");
        console.log("  The `runIO` command does that with default side-effects.");
        console.log("");
        console.log("# Compiling to JavaScript:");
        console.log("");
        console.log("   moon compile 'x => (mul x 10)'");
        console.log("");
        console.log("# Import-aware recursive search/replace:");
        console.log("");
        console.log("  moon replace file.moon \"new_file_contents\"");
        console.log("");
        console.log("  The command above replaces the contents of `file.moon`,");
        console.log("  saves it to IPFS, and recursivelly updates all files on");
        console.log("  this directory-tree that import the old version. You can");
        console.log("  also replace arbitrary strings instead of single files:");
        console.log("");
        console.log("  moon replace \"2017\" \"2018\"");
        console.log("");
        console.log("  The replace command modifies your files. Use it carefully.");
    }
  } catch (e) {
    console.log(e);
  }

})();
