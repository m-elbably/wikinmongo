WikinMogo 0.1.0
==============

Overview
--------

This is just a simple node.js script to import Wikipedia XML dump into MongoDB database.

Environment
-----------

* GNU/Linux, Windows, Mac
* Node.js `0.10.18` +
* Node.js Modules
  * xml-object-stream : `0.2.0` +
  * mongodb: `1.3.19` +
  * cli-color: `0.2.3` + (can be remove and use only stdout)
* MongoDB `2.2` +

Data Source
-----------

Wikipedia XML dump file (uncompressed)  
http://dumps.wikimedia.org

Page Document Structure
-----------------------
````js
{
	title: string,
	ns: string,
	id: number,
	revision: {
	    id: number,
	    parentid: number,
	    timestamp: date,
	    contributor: {
	        username: string,
	        id: number,
	        ip: string
	    },
	    comment: string,
	    text: string,
	    sha1: string,
	    model: string,
	    format: string
	}
}
````

Usage
-----

node app.js `db` `dump` `drop`

Arguments:
````
db:   MongoDB database
dump: Wikipedia dump XML file (uncomressed)
drop: Drop pages collection (if exists) before insterting new documents
````
Example:
`node app.js 'mongodb://localhost:27017/wiki' '/media/Data/enwiki.xml' drop`

Notes
-----

* Importing full Wikipedia dump will take a while (several hours, 3:30 to import 2012 dump on quad core machine)
* Importing full Wikipedia dump will require upto 40 GB of storage space
* index.coffee requires compile with the following coffee -c index.coffee before use.

License
-------

This project is BSD (2 clause) licensed.
