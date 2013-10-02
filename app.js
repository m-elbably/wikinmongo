var fs = require('fs'),
    mc = require('mongodb').MongoClient,
    xml = require('xml-object-stream'),
    clc = require('cli-color');

var dbName = process.argv[2],
    dump = process.argv[3], 
    drop = process.argv[4];

if (!(dbName && dump)) {
    console.log(clc.redBright('#Invalid arguments'));
    process.exit(1);
};

mc.connect(dbName, function(err, db) {
    if (err) throw err;

    console.log(clc.greenBright('#Connected to ' + dbName));
    console.log('#Reading dump file');

    if(drop){
        db.dropCollection('pages' ,function(err, ret) {
            console.log('#Collection drop: Ok');
        });
	}

    var rStream = fs.createReadStream(dump);
    var parser = xml.parse(rStream);

    var a = {};
    var count = 0;
    var t = 0;

    function getProperty(name) {
        if (name && name.$text) {
            return name.$text;
        } else {
            return '';
        }
    }

    function padNum(n) {
      if (n<=9) {
        n = ("0" + n).slice(-2); 
      }
      
      return n;
    }

    function parseSeconds(s)
    {
        var ts = s;
        var h = parseInt(ts / 3600);
        ts %= 3600;
        var m = parseInt(ts / 60);
        var s = ts % 60;

        return ('Elapsed Time ' + padNum(h) + ':' + padNum(m) + ':' + padNum(s));
    }

    parser.on('error', function(err) {
        console.log(err);
        process.exit(1);
    });

    parser.on('end', function(err) {
        setTimeout(function(){
            clearInterval(tmr);
            console.log(clc.greenBright('\nInserted ' + count + ' Documents.\n' + parseSeconds(t)));
            db.close();
        },1000);
    });

    var tmr = setInterval(function() {
                t++;  
              }, 1000);

    parser.each('page', function(node) {
        a = {
            title: getProperty(node.title),
            ns: parseInt(getProperty(node.ns)),
            id: parseInt(getProperty(node.id)),
            revision: {
                id: parseInt(getProperty(node.revision.id)),
                parentid: parseInt(getProperty(node.revision.parentid)),
                timestamp: Date.parse(getProperty(node.revision.timestamp)),
                contributor: {
                    username: getProperty(node.revision.contributor.username),
                    id: parseInt(getProperty(node.revision.contributor.id)),
                    ip: getProperty(node.revision.contributor.ip)
                },
                comment: getProperty(node.revision.comment),
                text: getProperty(node.revision.text),
                sha1: getProperty(node.revision.sha1),
                model: getProperty(node.revision.model),
                format: getProperty(node.revision.format)
            }
        };

        //insert page object to db
        db.collection('pages').insert(a, function(err, doc) {
            if (err)
                console.log(clc.redBright(err));

            process.stdout.write('Inserted ' + (++count) + '\n');
            process.stdout.write(parseSeconds(t) + '\n');
            process.stdout.write(clc.move(0, -2));
        });

    });
});
