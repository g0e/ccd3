module.exports = function(grunt){
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-compress");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint : {
			files : ['src/ccd3.js'],
			options : {}
		},
		uglify : {
			dist : {
				src : ["src/ccd3.js"],
				dest : "dist/ccd3.min.js"
			}
		},
		cssmin : {
			compress : {
				files : {
					"dist/ccd3.min.css" : ["src/ccd3.css"]
				}
			}
		},
		copy : {
			main : {
				files : [{
					expand: true,
					cwd: 'src/',
					src: ['ccd3.js','ccd3.css','dataset_sample.js','server/**'],
					dest: 'dist/',
				}]
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
					"ccd3_v<%= pkg.version %>" : ["dist/**","LICENSE.txt"]
				}
			}
		}
	});

	grunt.registerTask("test", ["jshint"]);
	grunt.registerTask("default", ["jshint","uglify","cssmin","copy","compress"]);
	
};

