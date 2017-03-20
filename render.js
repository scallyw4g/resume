#! /bin/node

var jade = require('jade')
  , fs = require('fs')
  , pdf = require('html-pdf')
  , moment = require('moment')
  , resume;

// Locals for rendering
var company
  , url
  , position
  , location = 'Victoria'
  , readline = require('readline-sync');

var args = {};

var commandLineArgs = process.argv.slice(2);

if ( commandLineArgs.indexOf("--sample") > -1 ) {

  args = {
    location,
    position: "SAMPLE",
    application_url: "http://www.someGreatCompany.com",
    company_name: "Sample",
    template: "resume.jade"
  }

  render(args);

} else if ( commandLineArgs.indexOf('--args') === 0 ) {

  args = fs.readFile(commandLineArgs[1], (err, data) => {
    if (err) throw err ;
    render( JSON.parse(data.toString()) );
  });

} else {
  main(args);

}



function main(args) {

  args = readArgs()

  // If we encounter undefined or null values in our arguments
  if ( args.errors.length > 0 ) {
    writeErrors(args.errors);
    main(args);

  // All good, render that ****!
  } else {
    render(args);
    // Write this here so that it doesn't get overwritten by sample
    fs.writeFile(`latest_args.json`, JSON.stringify(args, null, 2) );
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

  // Render the jade template as html
  html = jade.renderFile(args.template, args);
  fs.writeFile(`resume.html`, html );

  // Convert HTML to PDF and write it to the FS
  pdf.create(html).toFile( `${filePath}/Jesse_Hughes_Resume.pdf`, (err, res) => {
    console.log(`Written to ${res.filename}\n`);

    // Write out args
    fs.writeFile(`${filePath}/args.json`, JSON.stringify(args, null, 2) );
  });
}

/*
 *  Interactively read arguments from stdin.
 */
function readArgs () {

  args.position ? null : args.position = readline.question("What is the position title? ");

  args.company_name ? null : args.company_name = readline.question("What company is hiring this position? ");

  args.application_url ? null : args.application_url = readline.question("What url is the position advertised at? ");

  args.location ? null : args.location = readline.question("Where is this position located? ( Default: Victoria ) ");

  args.template ? null : args.template = readline.question("What template should I render? ( Default: resume.jade ) ");

  setDefaultValues(args);

  checkNullArgs(args);

  return args;
}

/*
 *  Sets default values for the args object if they're not set.
 */
function setDefaultValues(args) {
  if (args.template.length === 0 ) {
    args.template = "resume.jade";
  }

  if (args.location.length === 0 ) {
    args.location = "Victoria";
  }
}

/*
 *  Checks for arguments with falsy values.  Populates an `errors`
 *  property in the args object if it encounters any falsy values.
 */
function checkNullArgs (args) {

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
function writeErrors(errors) {
  console.log('\n -- Errors');

  for (var i=0; i < errors.length; i++) {
    console.log(errors[i]);
  }
  console.log('');
}
