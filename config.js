var config = {
	server: {
		host: '0.0.0.0',
		port: process.env.PORT
	},
	site: {
		title: 'Siminimal',
		name: 'Siminimal',
		url: 'http://dungps.herokuapp.com',
		description: 'Simple Minimal Blogging Platform built with NodeJS. No database required. Markdown supports.',
		author: 'DungPS',
		keywords: "siminimal, blog, cms, simple, minimal"
	},
	options: {
		posts_per_page: 1,
		theme: 'mono'
	}
}

module.exports = config;