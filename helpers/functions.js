var _ 				= require('lodash');
var pt 				= require('path');
var fs 				= require('fs');
var config			= require('../config');
var url				= require('url');
var marked			= require('marked');

var functions = {
	// File locate
	locate: function(path) {
		return pt.join(__dirname, '../' + path);
	},

	// convert markdown to html
	md_to_html: function(content) {
		marked.setOptions({
			highlight: function(code, lang, callback){
				return require('highlight.js').highlightAuto(code).value;
			}
		})

		return marked(content);
	},

	// helper url
	home: function(path) {
		var home = config.site.url;
		if ( path ) {
			home = url.resolve(home,path);
		}

		return home;
	},

	// get all posts
	get_posts: function(paged) {
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
		var files = fs.readdirSync(this.locate('content/post'));
		files.sort(sort_date);
		var posts = [];
		for (var i = offset; i < limit; i++) {
			if ( files[i] ) {
				post = this.parse_content(this.locate('content/post/'+files[i]));
				posts.push(post);
			}
		}

		return posts;
	},

	// parse content
	parse_content: function(path,type) {
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
			content: this.md_to_html(content[1])
		};

		return result;
	},

	get_pagination: function(current_page) {
		var totalItems = fs.readdirSync(this.locate('content/post')).length;
		var pagination = {
			page: parseInt( current_page ),
			limit: config.options.posts_per_page,
			pages: Math.ceil( totalItems / config.options.posts_per_page ),
			total: totalItems,
			next: null,
			prev: null,
			nextURL: null,
			prevURL: null
		}

		if ( pagination.pages > 1 ) {
			if ( pagination.page === 1 ) {
				pagination.next = pagination.page + 1;
				pagination.nextURL = this.home('page/' + pagination.next);
			} else if ( pagination.page === pagination.pages ) {
				pagination.prev = pagination.page - 1;
				pagination.prevURL = this.home('page/' + pagination.prev);
			} else {
				pagination.next = pagination.page + 1;
				pagination.prev = pagination.page - 1;
				pagination.nextURL = this.home('page/' + pagination.next);
				pagination.prevURL = this.home('page/' + pagination.prev);
			}
		}

		return pagination;
	},

	get_navigation: function(relativeUrl) {
		var nav = [
			{
				title: "Home",
				url: '/',
				current: relativeUrl === '/'
			}
		];

		var pages = fs.readdirSync(this.locate('content/page'));
		var limit = pages.length;
		for(var i = 0; i < limit; i++) {
			if ( pages[i] ) {
				page = this.parse_content(this.locate('content/page/'+pages[i]),'page');
				page['current'] = relativeUrl === page['url'];
				nav.push(page);
			}
		}

		return nav;
	},
}

module.exports = functions;