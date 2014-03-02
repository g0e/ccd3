module.exports = function(grunt){
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-compress");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint : {
			files : ['ccd3.js', 'dataset_sample.js'],
			options : {}
		},
		uglify : {
			dist : {
				src : ["ccd3.js"],
				dest : "ccd3.min.js"
			}
		},
		cssmin : {
			compress : {
				files : {
					"ccd3.min.css" : ["ccd3.css"]
				}
			}
		},
		compress : {
			main : {
				options : {
					archive: 'dist.zip',
					mode: "zip",
					pretty: true
				},
				files : {
					"ccd3_v<%= pkg.version %>" : ["ccd3.*","dataset_sample.js","LICENSE.txt","server/*"]
				}
			}
		}
	});

	grunt.registerTask("test", ["jshint"]);
	grunt.registerTask("default", ["jshint","uglify","cssmin","compress"]);
	
};

