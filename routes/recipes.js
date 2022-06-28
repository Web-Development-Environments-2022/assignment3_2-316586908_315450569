var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const DButils = require("./utils/DButils");


router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns 3 random recipes
 * seif 6
 */
 router.get("/random", async (req, res, next) => {
  try{
    // let random_3_recipes = await recipes_utils.getRandomThreeRecipes(req.session.user_id);
    let tmp_arr = [
      {
            id: "156124",
            title: "pizza",
            readyInMinutes: "45",
            image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
            popularity: "50",
            vegan: true,
            vegetarian: true,
            glutenFree: true,
            seen: false,
            favorite: false
      },
      {
        id: "156122",
        title: "pizza124",
        readyInMinutes: "60",
        image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
        popularity: "50",
        vegan: true,
        vegetarian: true,
        glutenFree: true,
        seen: false,
        favorite: false
      },
      {
        id: "15612",
            title: "pizza12",
            readyInMinutes: "45",
            image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
            popularity: "50",
            vegan: true,
            vegetarian: true,
            glutenFree: true,
            seen: false,
            favorite: false
      }
    ]
    // let results = {
    //   recipes: random_3_recipes
    // }

    let results = {
      recipes: tmp_arr
    }
    res.send(results);
  }
  catch (error){
    next(error);
  }
});

/**
 * list of preview recipes, for example : search recipe page
 * seif 8
 * /:number/:cuisine/:diet/:intolerance/:sort
 */
 router.get("/query/:query", async (req, res, next) => {
  try {
    let tmp_arr = [
      {
            id: "156124",
            title: "pizza",
            readyInMinutes: "45",
            image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
            popularity: "50",
            vegan: true,
            vegetarian: true,
            glutenFree: true,
            seen: false,
            favorite: false
      },
      {
        id: "156122",
        title: "pizza124",
        readyInMinutes: "60",
        image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
        popularity: "50",
        vegan: true,
        vegetarian: true,
        glutenFree: true,
        seen: false,
        favorite: false
      },
      {
        id: "15612",
            title: "pizza12",
            readyInMinutes: "45",
            image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
            popularity: "50",
            vegan: true,
            vegetarian: true,
            glutenFree: true,
            seen: false,
            favorite: false
      },
      {
        id: "156124",
        title: "pizza",
        readyInMinutes: "45",
        image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
        popularity: "50",
        vegan: true,
        vegetarian: true,
        glutenFree: true,
        seen: false,
        favorite: false
  },
  {
    id: "156122",
    title: "pizza124",
    readyInMinutes: "60",
    image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    popularity: "50",
    vegan: true,
    vegetarian: true,
    glutenFree: true,
    seen: false,
    favorite: false
  },
  {
    id: "15612",
        title: "pizza12",
        readyInMinutes: "45",
        image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
        popularity: "50",
        vegan: true,
        vegetarian: true,
        glutenFree: true,
        seen: false,
        favorite: false
  },
  {
    id: "156124",
    title: "pizza",
    readyInMinutes: "45",
    image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    popularity: "50",
    vegan: true,
    vegetarian: true,
    glutenFree: true,
    seen: false,
    favorite: false
},
{
id: "156122",
title: "pizza124",
readyInMinutes: "60",
image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
popularity: "50",
vegan: true,
vegetarian: true,
glutenFree: true,
seen: false,
favorite: false
},
{
id: "15612",
    title: "pizza12",
    readyInMinutes: "45",
    image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    popularity: "50",
    vegan: true,
    vegetarian: true,
    glutenFree: true,
    seen: false,
    favorite: false
},
{
id: "156124",
title: "pizza",
readyInMinutes: "45",
image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
popularity: "50",
vegan: true,
vegetarian: true,
glutenFree: true,
seen: false,
favorite: false
}
    ]
    res.send(tmp_arr);
    // const recipesToReturn = await recipes_utils.searchRecipes(req.session.user_id, req.query, req.params.query);
    // res.send(recipesToReturn);
  } catch (error) {
    next(error);
  }
});

/**
 * preview + list_ingredients + instructions + servings
 * seif 7 + mark as seen
 */
router.get("/reviewRecipe/:id", async (req, res, next) => {
  const all_info = '';
  try {
    let tmp_recipe = await DButils.execQuery(`select userId, recipeId from recipes where userId='${user_id}' AND recipeId='${req.params.id}'`);
    if (tmp_recipe.length == 0)
    // recipe from spooncoolar
    {
      // mark as seen
      await user_utils.markAsSeen(req.session.user_id, req.params.id);
      // recieve all info
      all_info = {
        recipe: await recipes_utils.getRecipeReview(req.session.user_id, req.params.id)
      }
    }
    else{
      // recipe from My Recipes
        const user_id = req.session.user_id;
        all_info = {
          recipe: await recipes_utils.getMySpecificRecipe(user_id,req.params.id)
        }
    }
    res.send(all_info);
  } catch (error){
    next(error);
  }
});



module.exports = router;
