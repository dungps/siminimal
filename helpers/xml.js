var config = require('../config');
var functions = require('./functions');
var fs = require('fs');
var pt = require('path');
var Feed = require('feed');
var sm = require('sitemap');

var blog_feed = {
	ParseIndex: function(posts) {
		var feed = new Feed({
			title: config.site.title,
			description: config.site.description,
			link: functions.home(),
			author: {
				name: config.site.author
			}
		});

		if ( posts ) {
			for(var key in posts) {
				feed.addItem({
					title: posts[key].title,
					link: functions.home( posts[key].url ),
					description: posts[key].description,
					author: [{
						name: posts[key].author
					}],
					date: new Date( posts[key].date ),
					image: posts[key].thumb
				})
			}
		}

		return feed.render('rss-2.0');
	}
}

var blog_sitemap = {
	ParseIndex: function() {
		var args = {
			hostname: config.site.url,
			cacheTime: 600000,
			urls: [
				{
					url: functions.home(),
					changefreq: 'daily'
				}
			]
		}

		// get page url
		pages = fs.readdirSync(functions.locate('content/page/'));
		for(var i = 0;i < pages.length;i++) {
			var filePath = pt.basename(pages[i],'.md');
			var url = functions.parseURL(filePath, 'page');
			var page_args = {
				url: functions.home(url),
				changefreq: 'daily'
			}

			args.urls.push(page_args);
		}

		posts = fs.readdirSync(functions.locate('content/post/'));
		for(var i = 0;i < posts.length;i++) {
			var filePath = pt.basename(posts[i],'.md');
			var url = functions.parseURL(filePath);
			var page_args = {
				url: functions.home(url),
				changefreq: 'daily'
			}

			args.urls.push(page_args);
		}
		var sitemap = sm.createSitemap(args);

		return sitemap.toString();
	}
}

module.exports.feed = blog_feed;
module.exports.sitemap = blog_sitemap;