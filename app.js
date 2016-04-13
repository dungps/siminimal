var express = require('express');
var	http 	= require('http');
var hbs 	= require('express-hbs');
var pt 		= require('path');
var fs 		= require('fs');
var marked	= require('marked');
var _		= require('lodash');
var url		= require('url');

var config	= require('./config');

var	app 	= express();

// File locate
function locate(path) {
	return pt.join(__dirname, path);
}

// get all posts
function get_posts(paged) {
	if ( paged == null ) {
		paged = 1;
	}

	var offset = ( paged - 1 ) * config.options.posts_per_page;
	var limit = offset + config.options.posts_per_page;
	var files = fs.readdirSync(locate('content/post'));
	var posts = [];
	for (var i = offset; i < limit; i++) {
		if ( files[i] ) {
			post = parse_content(locate('content/post/'+files[i]));
			posts.push(post);
		}
	}

	return posts;
}

function get_navigation() {
	var defaults = [
		{
			label: "Home",
			url: home()
		}
	];

	var get_pages = function() {
		var pages = fs.readdirSync(locate('content/page'));
		for(var i = 0; i < pages.length; i++) {
			if ( files[i] ) {
				page = parse_content(locate('content/page/'+files[i]));
			}
		}
	}
}

// parse content
function parse_content(path) {
	var result = {};
	var content = fs.readFileSync(path,{encoding: 'utf8'});
	content = _.split(content, '<!--content-->');
	
	var get_info = function(type) {
		var r_info = new RegExp(type+": (.+)", 'g' );
		var info = content[0].match(r_info);
		if ( info ) {
			split = _.split(info[0], ': ');
			return split[1];
		} else {
			return '';
		}
	}
	
	var result = {
		title: get_info('title'),
		author: get_info('author'),
		date: get_info('date'),
		keywords: get_info('keywords'),
		thumb: get_info('thumb'),
		description: get_info('description'),
		excerpt: get_info('excerpt'),
		url: 'article/'+pt.basename(path,'.md'),
		content: md_to_html(content[1])
	};

	return result;
}

// convert markdown to html
function md_to_html(content) {
	marked.setOptions({
		highlight: function(code, lang, callback){
			return require('highlight.js').highlightAuto(code).value;
		}
	})

	return marked(content);
}

// helper url
function home(path) {
	var home = config.site.url;
	if ( path ) {
		home = url.resolve(home,path);
	}

	return home;
}

// register foreach helper for handlebars
hbs.registerHelper('foreach', function(items, options){
	var ret = '';
	for(var i=0; i<items.length; i++) {
		ret = ret + options.fn(items[i]);
	}
	return ret;
});

// register assets helper for handlebars
hbs.registerHelper('assets', function(path, options){
	return home(path);
});

// safestring for content
hbs.registerHelper('content', function(options){
	return new hbs.handlebars.SafeString(this.content);
})

app.use(express.static(locate('assets')));

app.engine('hbs', hbs.express4({
	partialsDir: locate('views/partials'),
	defaultLayout: locate('views/default.hbs')
}));

app.set('view engine', 'hbs');
app.set('views', locate('views'));

app.get('/',function(req,res,next){
	res.render('index', {
		site: config.site,
		posts: get_posts(1)
	});
})

app.get('/paged/:paged',function(req,res,next){
	res.render('index', {
		site: config.site,
		posts: get_posts(req.params.paged)
	});
})

app.get('/article/:post', function(req,res,next){
	var file_path = locate( 'content/post/' + req.params.post + '.md' );
	if ( fs.existsSync(file_path) ) {
		res.render('post', {
			site: config.site,
			post: parse_content(file_path)
		});
	} else {
		res.status('404').render('404');
	}
});

app.get('/:page', function(req,res,next){
	var file_path = locate('content/page/' + req.params.page + '.md' );
	if ( fs.existsSync( file_path ) ) {
		res.render('page', {
			site: config.site,
			page: parse_content( locate('content/page/' + req.params.page + '.md' ) )
		});
	} else {
		res.status('404').render('404');
	}
});

app.get('/admin', function(req,res,next){
	
})

http.createServer( app ).listen( config.server.port, config.server.host );

console.log( 'Server is running in %s:%s', config.server.host, config.server.port );
console.log( 'Press Ctrl + C to exit' );