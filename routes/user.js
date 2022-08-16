var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { removeAllListeners } = require("nodemon");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT userId FROM users").then((users) => {
      if (users.find((x) => x.userId === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 * seif 10
 * error 500 if duplicate (userId, recipeId) at table : favoriterecipes since PK
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 * seif 10
 */
router.get('/favorites', async (req,res,next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => {

      recipes_id_array.push(element.recipeId)

    }); //extracting the recipe ids into array
    const results = await recipe_utils.getPreviews(user_id, recipes_id_array);
    const results_final = {
      recipes: results
    };
    res.status(200).send(results_final);
  } catch(error){
    next(error); 
  }
});

/**
 * route for My Recipes Page
 * seif 11
 */
router.get('/myRecipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let all_my_recipes = await recipe_utils.getMyRecipes(user_id);
    let results = {
      recipes : all_my_recipes
    }
    res.status(200).send(results);
  }catch(error){
    next(error);
  }
});

/**
 * seif 6
 * 3 last seen recipes
 */
router.get('/lastseen', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    let last_3_recipes = await recipe_utils.getMyLastRecipes(user_id);
    // let tmp_arr = [
    //   {
    //         id: "156124",
    //         title: "pizza",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "156122",
    //     title: "pizza124",
    //     readyInMinutes: "60",
    //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //     popularity: "50",
    //     vegan: true,
    //     vegetarian: true,
    //     glutenFree: true,
    //     seen: false,
    //     favorite: false
    //   },
    //   {
    //     id: "15612",
    //         title: "pizza12",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   }
    // ]
    let results = {
      recipes: last_3_recipes
      // recipes: tmp_arr
    }
    res.status(200).send(results);
  }catch(error){
    next(error);
  }
});

/**
 * route for creating recipe
 * seif 9
 */
 router.post("/createRecipe/:name", async (req, res, next) => {
  if (req.params.name == undefined)
      res.sendStatus(400).send({ message: "name of recipe is undefined" });
  try {
    await recipe_utils.createRecipe(req.session.user_id, req.params.name, req.body.params);
    res.status(200).send({ success: true, message: "Recipe Created" });
  }catch (error){
    next(error);
  }
});

router.get("/familyRecipes", async (req, res, next) => {
  try{
    let family_recipes = await user_utils.getFamilyRecipes(req.session.user_id);
    const results_final = {
      recipes: family_recipes
    };
    res.status(200).send(results_final);
  }
  catch (error){
    next(error);
  }
});

module.exports = router;
