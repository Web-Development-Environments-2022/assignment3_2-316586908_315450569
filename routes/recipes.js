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
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes(req.session.user_id);
    // let tmp_arr = [
    //   {
    //         id: "716429",
    //         title: "pizza",
    //         readyInMinutes: "45",
    //         // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         image: null,
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "716429",
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
    //     id: "636768",
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
    // let results = {
    //   recipes: tmp_arr
    // }
    let results = {
      recipes: random_3_recipes
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
  //   let tmp_arr1 = [];
  //   let tmp_arr = [
  //     {
  //           id: "636768",
  //           title: "pizza",
  //           readyInMinutes: "45",
  //           image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //           popularity: "10",
  //           vegan: true,
  //           vegetarian: true,
  //           glutenFree: true,
  //           seen: false,
  //           favorite: false
  //     },
  //     {
  //       id: "636768",
  //       title: "pizza124",
  //       readyInMinutes: "60",
  //       image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //       popularity: "50",
  //       vegan: true,
  //       vegetarian: true,
  //       glutenFree: true,
  //       seen: false,
  //       favorite: false
  //     },
  //     {
  //       id: "636768",
  //           title: "pizza12",
  //           readyInMinutes: "34",
  //           image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //           popularity: "36",
  //           vegan: true,
  //           vegetarian: true,
  //           glutenFree: true,
  //           seen: false,
  //           favorite: false
  //     },
  //     {
  //       id: "636768",
  //       title: "pizza",
  //       readyInMinutes: "20",
  //       image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //       popularity: "26",
  //       vegan: true,
  //       vegetarian: true,
  //       glutenFree: true,
  //       seen: false,
  //       favorite: false
  // },
  // {
  //   id: "636768",
  //   title: "pizza124",
  //   readyInMinutes: "70",
  //   image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //   popularity: "16",
  //   vegan: true,
  //   vegetarian: true,
  //   glutenFree: true,
  //   seen: false,
  //   favorite: false
  // },
  // {
  //   id: "636768",
  //       title: "pizza12",
  //       readyInMinutes: "47",
  //       image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //       popularity: "90",
  //       vegan: true,
  //       vegetarian: true,
  //       glutenFree: true,
  //       seen: false,
  //       favorite: false
  // },
  // {
  //   id: "636768",
  //   title: "pizza",
  //   readyInMinutes: "32",
  //   image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //   popularity: "87",
  //   vegan: true,
  //   vegetarian: true,
  //   glutenFree: true,
  //   seen: false,
  //   favorite: false
  // },
  // {
  // id: "636768",
  // title: "pizza124",
  // readyInMinutes: "98",
  // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  // popularity: "95",
  // vegan: true,
  // vegetarian: true,
  // glutenFree: true,
  // seen: false,
  // favorite: false
  // },
  // {
  // id: "636768",
  //     title: "pizza12",
  //     readyInMinutes: "15",
  //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //     popularity: "21",
  //     vegan: true,
  //     vegetarian: true,
  //     glutenFree: true,
  //     seen: false,
  //     favorite: false
  // },
  // {
  // id: "636768",
  // title: "pizza",
  // readyInMinutes: "15",
  // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  // popularity: "32",
  // vegan: true,
  // vegetarian: true,
  // glutenFree: true,
  // seen: false,
  // favorite: false
  // }
  //     ]
  //   res.send(tmp_arr);
    const recipesToReturn = await recipes_utils.searchRecipes(req.session.user_id, req.query, req.params.query);
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
  if (req.params.id == undefined)
      res.sendStatus(400).send({ message: "id is undefined" });
  const user_id = req.session.user_id;
  const recipe_id = req.params.id;
  let all_info = '';

  try{
    all_info = await reviewRecipeHandler(user_id, recipe_id);
  }
  catch(error){
    next(error);
  }
  res.send(all_info);

  //   let tmp_arr = [
  //     {
  //           id: "156124",
  //           title: "pizza",
  //           readyInMinutes: "45",
  //           image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //           popularity: "50",
  //           vegan: true,
  //           vegetarian: true,
  //           glutenFree: true,
  //           seen: false,
  //           favorite: false
  //     },
  //     {
  //       id: "156122",
  //       title: "pizza124",
  //       readyInMinutes: "60",
  //       image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //       popularity: "50",
  //       vegan: true,
  //       vegetarian: true,
  //       glutenFree: true,
  //       seen: false,
  //       favorite: false
  //     },
  //     {
  //       id: "15612",
  //           title: "pizza12",
  //           readyInMinutes: "45",
  //           image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //           popularity: "50",
  //           vegan: true,
  //           vegetarian: true,
  //           glutenFree: true,
  //           seen: false,
  //           favorite: false
  //     },
  //     {
  //       id: "156124",
  //       title: "pizza",
  //       readyInMinutes: "45",
  //       image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //       popularity: "50",
  //       vegan: true,
  //       vegetarian: true,
  //       glutenFree: true,
  //       seen: false,
  //       favorite: false
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
  //   },
  //   {
  //     id: "156124",
  //     title: "pizza",
  //     readyInMinutes: "45",
  //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //     popularity: "50",
  //     vegan: true,
  //     vegetarian: true,
  //     glutenFree: true,
  //     seen: false,
  //     favorite: false
  // },
  // {
  // id: "156122",
  // title: "pizza124",
  // readyInMinutes: "60",
  // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  // popularity: "50",
  // vegan: true,
  // vegetarian: true,
  // glutenFree: true,
  // seen: false,
  // favorite: false
  // },
  // {
  // id: "15612",
  //     title: "pizza12",
  //     readyInMinutes: "45",
  //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //     popularity: "50",
  //     vegan: true,
  //     vegetarian: true,
  //     glutenFree: true,
  //     seen: false,
  //     favorite: false
  // },
  // {
  // id: "156124",
  // title: "pizza",
  // readyInMinutes: "45",
  // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  // popularity: "50",
  // vegan: true,
  // vegetarian: true,
  // glutenFree: true,
  // seen: false,
  // favorite: false
  // }
  //     ]
  //     res.send(tmp_arr);
});

 async function reviewRecipeHandler(user_id, recipe_id){
  let all_info = '';
  let tmp_recipe = await DButils.execQuery(`select userId, recipeId from recipes where userId='${user_id}' AND recipeId='${recipe_id}'`);
  if (tmp_recipe.length == 0)
  // recipe from spooncoolar
  {
    // mark as seen
    let tmp = await user_utils.markAsSeen(user_id, recipe_id);
    // recieve all info
    all_info = {
      recipe: await recipes_utils.getRecipeReview(user_id, recipe_id),
      flag: true
    }
  }
  else{
    // recipe from My Recipes
      all_info = {
        recipe: await recipes_utils.getMySpecificRecipe(user_id, recipe_id),
        flag: false
      }
  }
  return all_info;
}

/**
 * BONUS - seif 13
 * new route for Analyzed Recipe Instructions
 */
 router.get("/:id/analyzedInstructions", async (req, res, next) => {
  if (req.params.id == undefined)
      res.sendStatus(400).send({ message: "id is undefined" });
  try{
    let response = {};
    const user_id = req.session.user_id;
    const recipe_id = req.params.id;
    
    let analyzedInstructions = '';
    let recipe_review = await reviewRecipeHandler(user_id, recipe_id);
    if (recipe_review.flag){ // flag == true => from spooncular
      analyzedInstructions = await recipes_utils.getAnalyzedInstructions(recipe_id);
      analyzedInstructions = analyzedInstructions.data;
    }
    else
      analyzedInstructions = recipe_review.recipe.analyzedInstructions;

    response = {
      title: recipe_review.recipe.title,
      image: recipe_review.recipe.image,
      recipeIngredients : recipe_review.recipe.ingredients,
      analyzedInstructions : analyzedInstructions,
      servings: recipe_review.recipe.servings
    }
    // analyzedInstructions = await recipes_utils.getAnalyzedInstructions(recipe_id);
    
    res.send(response);
  }
  catch (error){
    next(error);
  } 
});


module.exports = router;
