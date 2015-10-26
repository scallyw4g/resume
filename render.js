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

var args = readArgs();

if ( args.errors.length > 0 ) {

  writeErrors(args.errors);

} else {
  render(args);
}









function render (args) {

  console.log('\n -- Rendering');

  var date = moment().format('YY-MM-Do');

  html = jade.renderFile(args.template, args );

  fs.writeFile('./resume.html', html);

  pdf.create(html).toFile('./outgoing/' + date + '/' + args.company_name + '/Jesse_Hughes_Resume.pdf', function(err, res){
    console.log('Written to ' + res.filename);
  });

}

function readArgs () {

  var
    args = {}
  , errors = [];

  args.position = readline.question("What is the position title? ");

  args.company_name = readline.question("What company is hiring this position? ");

  args.application_url = readline.question("What url is the position advertised at? ");

  args.location = readline.question("Where is this position located? ( Default: Victoria ) ");

  args.template = readline.question("What template should I render? ( Default: resume.jade ) ");

  args = setDefaultValues(args);

  args = checkNullArgs(args);

  return args;
}

function setDefaultValues(args) {
  if (args.template.length === 0 ) {
    args.template = "resume.jade";
  }

  if (args.location.length === 0 ) {
    args.location = "Victoria";
  }

  return args;
}

function checkNullArgs (args) {

  args.errors = [];

  // Validate we received something for each input
  for (var val in args) {
    if ( ! args[val] ) {
      args.errors.push("Required value: " + val) ;
    }
  };

  return args;
}

function writeErrors(errors) {
  console.log('\n -- Errors');
  console.log(errors);

  for (var i=0; i < errors.lenght; i++) {
    console.log(errors[i]);
  }
}
