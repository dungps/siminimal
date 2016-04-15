var express 		= require('express');
var	http 			= require('http');
var hbs 			= require('express-hbs');
var pt 				= require('path');
var fs 				= require('fs');
var _				= require('lodash');

var helpers 		= require('./helpers');
var config			= require('./config');

var	app 			= express();
var theme_locate 	= helpers.functions.locate('views/' + config.options.theme );

hbs.registerHelper('foreach', helpers.hbs.foreach);
hbs.registerHelper('assets', helpers.hbs.assets);
hbs.registerHelper('content', helpers.hbs.content);
hbs.registerHelper('title', helpers.hbs.title);
hbs.registerHelper('is', helpers.hbs.is);
hbs.registerHelper('body_class', helpers.hbs.body_class);
hbs.registerHelper('post_class', helpers.hbs.post_class);
hbs.registerHelper('url', helpers.hbs.url);

app.use(express.static(theme_locate + '/assets'));

app.engine('hbs', hbs.express4({
	partialsDir: theme_locate + '/partials',
	defaultLayout: theme_locate + '/default.hbs'
}));

app.set('view engine', 'hbs');
app.set('views', theme_locate);

app.get('/',function(req,res,next){
	res.render('index', {
		site: config.site,
		navigation: helpers.functions.get_navigation('/'),
		posts: helpers.functions.get_posts(),
		pagination: helpers.functions.get_pagination(1),
		current: 'home',
	});
})

app.get('/rss', function(req,res,next){
	res.set({
		'Cache-Control': 'public, max-age=3600',
		'Content-Type': 'text/xml'
	});
	res.send(helpers.xml.feed.ParseIndex(helpers.functions.get_posts({nopaging:true})));
})

app.get('/sitemap.xml', function(req,res,next){
	res.set({
		'Cache-Control': 'public, max-age=3600',
		'Content-Type': 'text/xml'
	});
	res.send(helpers.xml.sitemap.ParseIndex());
})

app.get('/page/:paged',function(req,res,next){
	res.render('index', {
		site: config.site,
		navigation: helpers.functions.get_navigation('/'),
		posts: helpers.functions.get_posts({page:req.params.paged}),
		pagination: helpers.functions.get_pagination(req.params.paged),
		current: 'home',
	});
})

app.get('/:year/:month/:date/:post', function(req,res,next){
	var params = [req.params.year, req.params.month, req.params.date, req.params.post];
	var file_path = helpers.functions.locate( 'content/post/' + params.join('-') + '.md' );
	if ( fs.existsSync(file_path) ) {
		res.render('post', {
			site: config.site,
			navigation: helpers.functions.get_navigation(req.path),
			post: helpers.functions.parse_content(file_path),
			current: 'post',
		});
	} else {
		res.status('404').render('404');
	}
});

app.get('/:page', function(req,res,next){
	var file_path = helpers.functions.locate('content/page/' + req.params.page + '.md' );
	if ( fs.existsSync( file_path ) ) {
		res.render('page', {
			site: config.site,
			navigation: helpers.functions.get_navigation(req.path),
			post: helpers.functions.parse_content( helpers.functions.locate('content/page/' + req.params.page + '.md' ), 'page' ),
			current: 'page'
		});
	} else {
		res.status('404').render('404');
	}
});

http.createServer( app ).listen( config.server.port, config.server.host );

console.log( 'Server is running in %s:%s', config.server.host, config.server.port );
console.log( 'Press Ctrl + C to exit' );