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

	var sort_date = function(a,b) {
		aSplit = _.split(a,'-');
		bSplit = _.split(b,'-');

		aDate = aSplit[0] + '-' + aSplit[1] + '-' + aSplit[2];
		bDate = bSplit[0] + '-' + bSplit[1] + '-' + bSplit[2];
		aDate = Date.parse(aDate);
		bDate = Date.parse(bDate);

		return ( aDate > bDate ) ? -1 : ( aDate < bDate ? 1 : 0 );
	}

	var offset = ( paged - 1 ) * config.options.posts_per_page;
	var limit = offset + config.options.posts_per_page;
	var files = fs.readdirSync(locate('content/post'));
	files.sort(sort_date);
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
	var nav = [
		{
			title: "Home",
			url: home()
		}
	];

	var pages = fs.readdirSync(locate('content/page'));
	var limit = pages.length;
	for(var i = 0; i < limit; i++) {
		if ( pages[i] ) {
			page = parse_content(locate('content/page/'+pages[i]),'page');
			nav.push(page);
		}
	}

	return nav;
}

// parse content
function parse_content(path,type) {
	if ( type == null ) {
		type = 'post';
	}
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

	var filename = pt.basename(path,'.md');
	if ( type === 'post' ) {
		var filePath = _.split(filename, '-');
		var name = _.slice(filePath, 3);
		name = _.join(name,'-');
		var url = '/' + filePath[0] + '/' + filePath[1] + '/' + filePath[2] + '/' + name;
	} else {
		url = '/' + filename;
	}

	result = {
		title: get_info('title'),
		author: get_info('author'),
		date: get_info('date'),
		keywords: get_info('keywords'),
		thumb: get_info('thumb'),
		description: get_info('description'),
		excerpt: get_info('excerpt'),
		url: url,
		filename: filename,
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

// safestring for title
hbs.registerHelper('title', function(options){
	return new hbs.handlebars.SafeString(this.title);
})

hbs.registerHelper('pagination', function(options){

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
		navigation: get_navigation(),
		posts: get_posts(1),
		is_front_page: true
	});
})

app.get('/page/:paged',function(req,res,next){
	res.render('index', {
		site: config.site,
		navigation: get_navigation(),
		posts: get_posts(req.params.paged),
		is_front_page: true
	});
})

app.get('/:year/:month/:day/:post', function(req,res,next){
	var file_path = locate( 'content/post/' + req.params.year + '-' + req.params.month + '-' + req.params.day + '-' + req.params.post + '.md' );
	if ( fs.existsSync(file_path) ) {
		res.render('post', {
			site: config.site,
			navigation: get_navigation(),
			post: parse_content(file_path),
			is_post: true
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
			navigation: get_navigation(),
			page: parse_content( locate('content/page/' + req.params.page + '.md' ), 'page' ),
			is_page: true
		});
	} else {
		res.status('404').render('404');
	}
});

http.createServer( app ).listen( config.server.port, config.server.host );

console.log( 'Server is running in %s:%s', config.server.host, config.server.port );
console.log( 'Press Ctrl + C to exit' );