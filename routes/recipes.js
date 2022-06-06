var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try{
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  }
  catch (error){
    next(error);
  }
});

/**
 * list of preview recipes, for example : search recipe page
 * TODO: function to search recipe. question 8 . need use spooncular API
 */
 router.get("/:query", async (req, res, next) => {
  try {
    const recipesPreviews = await recipes_utils.getRecipesPreview(req.params.number);
    res.send(recipesPreviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
