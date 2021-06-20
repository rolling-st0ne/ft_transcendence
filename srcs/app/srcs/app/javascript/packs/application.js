// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import * as ActiveStorage from "@rails/activestorage"
let $ = require("jquery");
let _ = require("underscore");
let Backbone = require("backbone");

Rails.start()
ActiveStorage.start()

$(function () {
    $('.alert').delay(2000).fadeOut(function() { $(this).remove(); });
});