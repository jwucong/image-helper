const os = require('os');
const ora = require('ora');
const chalk = require('chalk');
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const devConfig = merge(config, {
  mode: 'development',
})
const spinner = ora(`${chalk.cyan('Starting development server...')}\n`);

const getLocalIP = () => {
	const network = os.networkInterfaces();
	for (const key in network) {
		const interfaces = network[key];
		for (let i = 0; i < interfaces.length; i++) {
			const face = interfaces[i];
			if (face.family === 'IPv4' && face.address !== '127.0.0.1' && !face.internal) {
				return face.address;
			}
		}
	}
	return 'localhost';
};

const serverConfig = {
	contentBase: devConfig.output.path,
	publicPath: devConfig.output.publicPath,
	host: getLocalIP(),
	port: 8080,
	compress: true,
	clientLogLevel: 'error',
	// stats: 'errors-only',
	historyApiFallback: {
		disableDotRule: true
	},
	hot: true,
	inline: true,
	open: true,
	quiet: true,
	overlay: {
		errors: true,
		warnings: false
	},
	proxy: {}
};


process.env.NODE_ENV = 'development';
spinner.start();

const compiler = webpack(devConfig);
const server = new WebpackDevServer(compiler, serverConfig);

server.listen(serverConfig.port, serverConfig.host, err => {
	if (err) {
		spinner.fail(`${chalk.red('Failed to start development server!')}`);
		throw err;
	}
	const host = `http://${serverConfig.host}:${serverConfig.port}`;
	spinner.succeed(
		`${chalk.green('Start the development server successfully!')}`
	);
	spinner.info(`${chalk.blue(`Server listening at local network: ${host}`)}`);
});
