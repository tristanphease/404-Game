module.exports = function (grunt) {
    grunt.initConfig({
    
        //bundles modules together into one
        rollup: {
            options: {
                
            },
            main: {
                dest: 'doors/doors.js',
                src: 'game/game.js'
            }
        },
        //minifies file(removes comments, whitespace)
        terser: {
            options: {
                mangle: true //shortens variable names
            },
            
            files: { 
                src: 'doors/doors.js',  // source files mask
                dest: 'final/',    // destination folder
                expand: true,    // allow dynamic building
                flatten: true,   // remove all unnecessary nesting
            },
        },
        //zip the file
        compress: {
            main: {
                options: {
                    archive: 'final.zip',
                    mode: 'zip'
                },
                files: [{
                    cwd: 'final/',
                    src: ['doors.js', 'index.html'], 
                    dest: '.',
                    expand: true
                }]
           }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-terser');
    grunt.loadNpmTasks('grunt-rollup');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // register at least this one task
    grunt.registerTask('default', [ 'rollup', 'terser', 'compress' ]);

};