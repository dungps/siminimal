var express = require( 'express' );
var	http 	= require( 'http' );
var hbs 	= require('express-hbs');
var pt 		= require('path');
var fs 		= require('fs');
var config	= require('./config');
var marked	= require('marked');
var _		= require('lodash');
var extractor = require('file-extractor');
var	app 	= express();

function locate(path) {
	return pt.join(__dirname, path);
}

function get_posts(page, cb) {
	if ( page == null ) {
		page = 1;
	}

	var offset = ( page - 1 ) * config.options.posts_per_page;
	var limit = offset + config.options.posts_per_page;

	fs.readdir(locate('content/post'), function(err,items){
		var posts = [];
		if ( err !== false && typeof items != 'null' ) {
			for( var i = offset; i < limit; i++ ) {
				if ( typeof items[i] !== 'undefined' ) {
					post = get_post(locate('content/post/'+items[i]));
					posts.push(post);
				}
			}
		}

		if ( cb ) {
			cb(posts);
		}
	});
}

function get_post(path) {
	var result = {};
	var content = fs.readFileSync(path,'utf-8');

	var get_info = function(type) {
		var r = /-{3}data\n?([\s\S]*)-{3}/m;
		var r_info = new RegExp(type+": (.+)", 'g' );
		var content_data = content.match(r);
		var info = content_data[1].match(r_info);
		if ( info ) {
			split = _.split(info[0], ': ');
			return split[1];
		} else {
			return '';
		}
	}

	var get_content = function() {
		var r = /\n\n([\s\S]*)/g;
		var content_data = content.match(r);
		return md_to_html(content_data[0]);
	}

	get_content();
	
	var result = {
		title: get_info('title'),
		author: get_info('author'),
		date: get_info('date'),
		content: get_content()
	};

	return result;
}

function home(path) {
	var home = config.site.url;
	if ( path ) {
		home = home + path;
	}

	return home;
}

function md_to_html(content) {
	marked.setOptions({
		renderer: new marked.Renderer(),
		gfm: true,
		tables: true,
		breaks: false,
		pedantic: false,
		sanitize: true,
		smartLists: true,
		smartypants: false
	});

	return marked(content);
}

var test_data = [
	{
		title: "bài 1",
		content: "bài 1"
	},
	{
		title: 'bai 2',
		content: 'bai 2'
	}
];


hbs.registerHelper('foreach', function(items, options){
	var out = '';
	for(var i=0; i<items.length; i++) {
		out = out + options.fn(items[i]);
	}
	return out;
});

hbs.registerHelper('assets', function(path, options){
	return home(path);
});

app.use(express.static(locate('assets')));

app.engine('hbs', hbs.express4({
	partialsDir: locate('views/inc'),
	defaultLayout: locate('views/default.hbs')
}));

app.set('view engine', 'hbs');
app.set('views', locate('views'));

app.get('/',function(req,res,next){
	get_posts(1, function(posts){
		res.render('index', {
			site: config.site,
			posts: posts
		});
	});
})

app.get('/paged/:paged',function(req,res,next){
	get_posts(req.params.paged, function(posts){
		res.render('index', {
			site: config.site,
			posts: posts
		});
	});
})

app.get('/:post', function(req,res,next){
	res.render('post', {
		post: {
			title: 'test',
			content: 'test'
		}
	});
});

app.get('/admin', function(req,res,next){
	
})

http.createServer( app ).listen( config.server.port, config.server.host );

console.log( 'Server is running in %s:%s', config.server.host, config.server.port );
console.log( 'Press Ctrl + C to exit' );