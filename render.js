#! /bin/node

var jade = require('jade')
  , fs = require('fs')
  , pdf = require('html-pdf')
  , resume;

var args = process.argv.slice(2);

var company,
    url,
    job,
    location = 'Victoria';

var templateArgs = {

    job_title: job,
    application_url: url,
    company_name: company,
    location: location

    }

args.forEach(function(val, index, array) {

  if ( val === 'company' ) {
    company = args[index + 1];
  }

  if ( val === 'url' ) {
    url = args[index + 1];
  }

  if ( val === 'job' ) {
    job = args[index + 1];
  }

  if ( val === 'locaton' ) {
    location = args[index + 1];
  }
});

if ( !job || !url || !company ){
  console.log('Required arguments: job url company');
  process.exit(1);
}

html = jade.renderFile('resume.jade', templateArgs );

fs.writeFile('./resume.html', html);

pdf.create(html).toFile('./outgoing/' + company + '/Jesse_Hughes_Resume.pdf', function(err, res){
  console.log('Written to ' + res.filename);
});
