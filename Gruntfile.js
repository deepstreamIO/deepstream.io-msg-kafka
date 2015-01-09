module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		release: {
			options: {
				github: { 
					repo: '<yourGitubRepoName>',
					usernameVar: 'GITHUB_USERNAME',
					passwordVar: 'GITHUB_PASSWORD'
				}
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-release' );
};