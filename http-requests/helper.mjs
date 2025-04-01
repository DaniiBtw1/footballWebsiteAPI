import hbs from 'hbs'

hbs.handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});


export default hbs;