let db = require("../models");
let request = require('request');

let updateNutrition = (recipe) => {
    let apiKey = "6ebac7e6562262d5b1213134d8d7fe4a";
    let appID = "936c8444";
    let ingredient = "1 slice of chocolate cake";
    request(`https://api.edamam.com/api/nutrition-data?app_id=${appID}&app_key=${apiKey}&ingr=${ingredient}`, function (error, response, body) {
        console.log('calories:', JSON.parse(body).calories);
    });
};

module.exports = function (app) {
    //Find all of the recipes - include users
    app.get("/recipes", isLoggedIn, function (req, res) {
        // db.Recipes.findAll({
        //     include: [db.Users]
        // }).then(function (recipesDB) {
        //     updateNutrition(recipesDB);
        //     res.render("home", recipesDB);
        // });
        res.render("home");

    });

    //Find one single recipe - include users
    app.get("/recipes/:id", isLoggedIn, function (req, res) {
        db.Recipes.findOne({
            where: {
                id: req.params.id
            },
            include: [db.Users]
        }).then(function (recipesDB) {
            res.json(recipesDB);
        });
    });

    //Save a new recipe
    app.post("/recipes", isLoggedIn, function (req, res) {
        db.Recipes.create(req.body).then(function (recipesDB) {
            res.json(recipesDB);
        });
    });

    //Delete one single recipe
    app.delete("/recipes/:id", isLoggedIn, function (req, res) {
        db.Recipes.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (recipesDB) {
            res.json(recipesDB);
        });
    });

    //Update one single recipe
    app.put("/recipes", isLoggedIn, function (req, res) {
        db.Recipes.update(
            req.body, {
                where: {
                    id: req.body.id
                }
            }).then(function (recipesDB) {
            res.json(recipesDB);
        });
    });

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}