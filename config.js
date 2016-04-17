var config = {
	server: {
		host: '0.0.0.0',
		port: process.env.PORT
	},
	site: {
		title: 'DungPS Blog',
		name: 'DungPS',
		url: 'http://dungps.herokuapp.com',
		description: 'Simple Minimal Blogging Platform built with NodeJS. No database required. Markdown supports.',
		author: 'DungPS',
		keywords: "dungps, oryc, blog, wordpress, nodejs"
	},
	options: {
		posts_per_page: 5,
		theme: 'mono'
	}
}

module.exports = config;