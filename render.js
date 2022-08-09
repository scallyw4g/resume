#! /usr/bin/env node

var pug = require('pug')
  , fs = require('fs')
  , pdf = require('html-pdf')
  , moment = require('moment')
  , readline = require('readline-sync')
  , resume;

var commandLineArgs = process.argv.slice(2);

var DefaultTemplate = "resume.pug";
var DefaultLocation = "Victoria";

if ( commandLineArgs.indexOf("--sample") !== -1 ) {

  let args = {
    location: "Sample Location",
    position: "SAMPLE",
    application_url: "http://www.someGreatCompany.com",
    company_name: "Sample",
    template: DefaultTemplate
  }

  render(args);

} else if ( commandLineArgs.indexOf('--args') === 0 ) {

  let args = fs.readFile(commandLineArgs[1], (err, data) => {
    if (err) throw err;
    render( JSON.parse(data.toString()) );
  });

} else if ( commandLineArgs.indexOf('--help') !== -1 ||
            commandLineArgs.indexOf('-h') !== -1 ) {

  console.log("");
  console.log(" Usage: render.js [--sample] [--args saved-arguments.json] [--help|-h]");
  console.log("");
  console.log(" --sample                    | Render resume with sample data");
  console.log(" --args saved-arguments.json | Render resume with arguments saved to a file");
  console.log(" --help    -h                | Print help text and exit");
  console.log("");

} else {
  main();
}



function main() {

  let args = readArgsFromStdIn();

  // If we encounter undefined or null values in our arguments
  if ( args.errors.length > 0 ) {
    dumpErrorsToStdOut(args.errors);
    main(args);

  // All good, render that ****!
  } else {
    render(args);
    // Write latest_args outside of render so that they don't get overwritten when rendering a sample
    fs.writeFile(`latest_args.json`,
                 JSON.stringify(args, null, 2),
                 () => console.log("latest_args.json written") );
  }
}

/*
 *  Render resume as PDF and write args out to the filesystem for future reference.
 */
function render (args) {

  console.log('\n -- Rendering\n');

  // Where we're saving the PDF and args.json
  var date = moment().format('YY-MM-Do');
  var filePath = `./outgoing/${date}/${args.company_name}`;

  // Render the pug template as html
  html = pug.renderFile(args.template, args);
  fs.writeFile(`index.html`,
               html,
               () => console.log(`Writing ${process.cwd()}/index.html\n`) );

  // Convert HTML to PDF and write it to the FS
  pdf.create(html).toFile( `${filePath}/Jesse_Hughes_Resume.pdf`, (err, res) => {
    fs.writeFile(`${filePath}/args.json`,
                 JSON.stringify(args, null, 2),
                 () => console.log(`PDF written to ${res.filename}\n`) )

  });
}

/*
 *  Interactively read arguments from stdin.
 */
function readArgsFromStdIn () {

  let args = {};

  args.position = readline.question("What is the position title? ");

  args.company_name = readline.question("What company is hiring this position? ");

  args.application_url = readline.question("What url is the position advertised at? ");

  args.location = readline.question(`Where is this position located? ( Default: ${DefaultLocation} ) `);

  args.template = readline.question(`What template should I render? ( Default: ${DefaultTemplate} ) `);

  setDefaultValues(args);

  ValidateArgs(args);

  return args;
}

/*
 *  Sets default values for the args object if they're not set.
 */
function setDefaultValues(args) {
  if (args.template.length === 0 ) {
    args.template = DefaultTemplate;
  }

  if (args.location.length === 0 ) {
    args.location = DefaultLocation;
  }
}

/*
 *  Checks for arguments with falsy values.  Populates an `errors`
 *  property in the args object if it encounters any falsy values.
 */
function ValidateArgs (args) {

  args.errors = [];

  // Validate we received something for each input
  for (var val in args) {
    if ( ! args[val] ) {
      args.errors.push("Required value: " + val) ;
    }
  };
}

/*
 *  Dump errors array to stdout.
 */
function dumpErrorsToStdOut(errors) {
  console.log('\n -- Errors');
  errors.forEach( e => console.log(e) );
  console.log('');
}
