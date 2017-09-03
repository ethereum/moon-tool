#!/usr/bin/env node --harmony-tailcalls

var fs = require("fs");
var path = require("path");
var Moon = require("moon-lang")("https://ipfs.infura.io:5001");
var nodeIO = () => require("moon-lang/lib/moon-io-node.js");
var performIO = program => Moon.performIO(program, nodeIO());
var packageJson = require("./package.json");

// Gets the command line arguments
var args = [].slice.call(process.argv, 2);

var val = () => {
  var val = args[args.length - 1];
  var file = path.join(process.cwd(), val + ".moon");
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
          (Moon.run
          (await Moon.imports
          (await val())));
        break;

      case "runio":
        console.log
          (Moon.stringify
          (await performIO
          (Moon.parse
          (await Moon.imports
          (await val())))));
        process.exit();
        break;

      case "format":
        console.log
          (Moon.format
          (await val()));
        process.exit();
        break;

      case "pack":
        console.log
          (Moon.pack
          (await val()));
        break;

      case "unpack":
        console.log
          (Moon.unpack
          (await val()));
        break;
        
      case "compile":
        console.log
          (Moon.compile
          (await Moon.imports
          (await val())));
        break;
        
      case "save":
        console.log
          (await Moon.save
          (await val()));
        break;

      case "load":
        console.log
          (await Moon.load
          (await val()));
        break;

      case "imports":
        console.log
          (await Moon.imports
          (await val()));
        break;

      case "cid":
        console.log
          (await Moon.cid
          (await val()));
        break;

      case "version":
        console.log(packageJson.version);
        break;

      default:
        console.log("Moon-Lang ☾");
        console.log("");
        console.log("Commands:");
        console.log("");
        console.log("  moon run <expr/file>       -- runs an expr/file");
        console.log("  moon pack <expr/file>      -- packs an expr/file to binary");
        console.log("  moon unpack <expr/file>    -- unpacks a packed term");
        console.log("  moon stringify <expr/file> -- displays an expr/file");
        console.log("  moon compile <expr/file>   -- compiles an expr/file to JS");
        console.log("  moon save <expr/file>      -- saves an expr/file to IPFS");
        console.log("  moon load <expr/file>      -- loads an expr/file from IPFS");
        console.log("  moon cid <expr/file>       -- gets the IPFS ID of an expr/file");
        console.log("  moon imports <expr/file>   -- recursively imports an expr/file");
        console.log("  moon version               -- prints the version");
        console.log("");
        console.log("Examples:");
        console.log("");
        console.log("  Inline execution:");
        console.log("");
        console.log("    moon run '(add 1 2)'        -- output: 3");
        console.log("    moon run 'x=4 y=2 [x y]'    -- output: [4 2]");
        console.log("    moon run '((x => [x x]) 3)' -- output: [3 3]");
        console.log("");
        console.log("  File execution:");
        console.log("");
        console.log("    echo '\"Hello\"' >> hi.moon");
        console.log("    moon run hi -- output: \"Hello\"");  
        console.log("");
        console.log("  Saving to IPFS:");
        console.log("");
        console.log("    moon save 'x => (add x 1)'");
        console.log("");
        console.log("    After you save an expression, you may use its hash inside");
        console.log("    other expressions: `moon run` recursively imports IPFS hashes.");
        console.log("");
        console.log("  Loading from IPFS:");
        console.log("");
        console.log("    moon load zb2rhea5n8bErvkLE3fBgJjUd8noxXMunHUisVH4HhDxhSrMn");
        console.log("");
        console.log("  Running with side-effects:");
        console.log("");
        console.log("    moon runIO 'ask => end => (ask \"prompt\" \"Hi!\" then => (end 0))'")
        console.log("");
        console.log("    Moon is pure, but you can still peform side-effects by");
        console.log("    evaluating computations in a side-effective language.");
        console.log("    The `runIO` command does that with default side-effects.");
        console.log("");
        console.log("  Compiling to JavaScript:");
        console.log("");
        console.log("     moon compile 'x => (mul x 10)'");
        console.log("");
    }
  } catch (e) {
    console.log(e);
  }

})();
