const { environment } = require('@rails/webpacker')

const webpack = require('webpack')
environment.plugins.append('Provide',
    new webpack.ProvidePlugin({
        _: 'underscore',
        $: 'jquery/src/jquery',
        jQuery: 'jquery/src/jquery',
        Backbone: 'backbone',
        Moment: 'moment'
    })
    )
module.exports = environment
