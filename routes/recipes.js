var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns 3 random recipes
 * seif 6
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
 * This path returns a preview details of a recipe by its id
 * seif 1
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
 * list of preview recipes, for example : search recipe page
 * seif 8
 */
 router.get("/query/:query", async (req, res, next) => {
  try {
    const recipesToReturn = await recipes_utils.searchRecipes(req.query, req.params.query);
    res.send(recipesToReturn);
  } catch (error) {
    next(error);
  }
});

/**
 * preview + list_ingredients + instructions + servings
 * seif 7 + mark as seen
 */
router.get("/reviewRecipe/:id", async (req, res, next) => {
  try {
    // mark as seen
    await user_utils.markAsSeen(req.session.user_id, req.params.id);
    // recieve all info
    const all_info = await recipes_utils.getRecipeReview(req.params.id);
    res.send(all_info);
  } catch (error){
    next(error);
  }
});
/**
 * route for creating recipe
 * seif 9
 */
router.post("/createRecipe/:name", async (req, res, next) => {
  try {
    // await recipes_utils.createRecipe(req.session.user_id, req.params.name, req.query);
    await recipes_utils.createRecipe('0', req.params.name, req.query);
    res.status(200).send({ success: true, message: "Recipe Created" });
  }catch (error){
    next(error);
  }
});


module.exports = router;
