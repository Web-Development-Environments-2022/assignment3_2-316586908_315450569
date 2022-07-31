const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");

// /**
//  * Get recipes list from spooncular response and extract the relevant recipe data for preview
//  * @param {*} recipes_info 
//  */

async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

/**
 * main function for returning Preview Details of Recipe
 * @param {*} user_id 
 * @param {*} recipes_ids_list 
 * @returns 
 */
async function getPreviews(user_id, recipes_ids_list){
    
    // let promises = []
    let promises = recipes_ids_list.map(async (recipe_id) => {

        let seen = false;
        let favorite = false;
        let recipe_info = await getRecipeInformation(recipe_id);
        let seen_lst = await DButils.execQuery(`SELECT * FROM seenrecipes where userId = '${user_id}' AND recipeId = '${recipe_id}'`);
        let fav_lst = await DButils.execQuery(`SELECT * FROM favoriterecipes where userId = '${user_id}' AND recipeId = '${recipe_id}'`);
        if (user_id && seen_lst.length > 0)
            seen = true;
        if (user_id && fav_lst.length > 0)
            favorite = true;
        return {
            id: recipe_info.data.id,
            title: recipe_info.data.title,
            readyInMinutes: recipe_info.data.readyInMinutes,
            image: recipe_info.data.image,
            popularity: recipe_info.data.aggregateLikes,
            vegan: recipe_info.data.vegan,
            vegetarian: recipe_info.data.vegetarian,
            glutenFree: recipe_info.data.glutenFree,
            seen: seen,
            favorite: favorite
        };
    });
    let results = await Promise.all(promises);
    return results;
}

async function getRandomRecipes(){
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response;
}

async function getRandomThreeRecipes(user_id){
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.title))
    if (filtered_random_pool < 3)
        return getRandomThreeRecipes();
    return getPreviews(user_id, [filtered_random_pool[0].id,filtered_random_pool[1].id,filtered_random_pool[2].id])
}

async function searchRecipes(user_id, query_params, query){
    const {
        number,
        cuisine,
        diet,
        intolerance,
        sort
    } = query_params;

    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey,
            query: query,
            instructionsRequired: true,
            cuisine: cuisine,
            diet: diet,
            intolerance: intolerance,
            sort: sort
        }
    });

    let extract_ids = response.data.results.map((recipe_info) => {
        
        let data = recipe_info;
        if (recipe_info.results){
            data = recipe_info.results;
        }
        const id = data.id;
        
        return id
        
    });
    return getPreviews(user_id, extract_ids)
}

/**
 * function for seif 7 
 */
async function getRecipeReview(user_id, recipe_id){
    let recipe_info = await getRecipeInformation(recipe_id);
    let preview_info = await getPreviews(user_id, [recipe_id]);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, servings, extendedIngredients, analyzedInstructions } = recipe_info.data;
    extendedIngredients = extendedIngredients.map((ingredient) => {
        return {
            ingredientName: ingredient.name,
            amount: ingredient.amount,
            units: ingredient.unit
        }
    });
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        seen: preview_info[0].seen,
        favorite: preview_info[0].favorite,
        instructions: instructions,
        servings: servings,
        ingredients: extendedIngredients,
        analyzedInstructions: analyzedInstructions
    }
}
/**
 * create new recipe
 * @param {*} user_id logged in user
 * @param {*} recipe_name recipe name 
 * @param {*} query_params all the details of the recipe
 */
async function createRecipe(user_id, recipe_name, query_params){
    let { 
        readyInMinutes,
        image,
        aggregateLikes, 
        vegan, 
        vegetarian, 
        glutenFree, 
        instructions,
        ingredients, 
        servings } = query_params;

    // size_table = recipeId of the new recipe we created
    let size_table = await DButils.execQuery("SELECT count(*) as count FROM recipes");
    await DButils.execQuery(`insert into recipes values ('${user_id}' ,'${size_table[0].count}' ,'${recipe_name}', '${readyInMinutes}', '${image}', '${aggregateLikes}', '${vegan}', '${vegetarian}', '${glutenFree}', '${instructions}', '${servings}')`);
    // ingredients = list : [dict(name : ingredientName_1, amout: amount_1), dict(name: ingredientName_2, amout: amount_2), ...]
    ingredients.map(async (data) => {
        await DButils.execQuery(`insert into ingredients values ('${size_table[0].count}', '${data.name}', '${data.amount}', '${data.units}')`);
    });
}

/**
 * get list of all my recipes for My Recipes Page , seif 11
 * @param {*} user_id 
 */
async function getMyRecipes(user_id){
    let all_my_recipes = await DButils.execQuery(`select * from recipes where userId = '${user_id}'`);
    let extract_details = all_my_recipes.map((recipe) => {
        let { recipeName, recipeId, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree } = recipe;
        if (vegan == "true") vegan=true;
        else vegan=false;
        if (vegetarian == "true") vegetarian=true;
        else vegetarian=false;
        if (glutenFree == "true") glutenFree=true;
        else glutenFree=false;
        return {
            title: recipeName,
            id: recipeId,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: popularity,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            seen: true,
            favorite: true
        }
    });

    return extract_details;
}

/**
 * function for review of a specific recipe from My Recipes Page
 */
async function getMySpecificRecipe(user_id, recipe_id){
    let my_recipe = await DButils.execQuery(`select * from recipes where userId = '${user_id}' AND recipeId = '${recipe_id}'`);
    if (my_recipe.length == 0)
        return {};
    let ingredients = await DButils.execQuery(`select ingredientName, amount, units from ingredients where recipeId = '${recipe_id}'`);
    let { recipeName, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, instructions, servings } = my_recipe[0];
    if (vegan == "true") vegan=true;
    else vegan=false;
    if (vegetarian == "true") vegetarian=true;
    else vegetarian=false;
    if (glutenFree == "true") glutenFree=true;
    else glutenFree=false;
    return {
        title: recipeName,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        seen: true,
        favorite: true,
        instructions: instructions,
        servings: servings,
        ingredients: ingredients
    }
}

async function getMyLastRecipes(user_id){
    let my_last_recipes = await DButils.execQuery(`select recipeId from seenrecipes where userId = '${user_id}'`);
    let promises = [];
    my_last_recipes.slice(-3).map((recipeId) => {
        promises.push(getPreviews(user_id, [recipeId.recipeId]));
    });
    let info_res = await Promise.all(promises);
    let tmp_arr = info_res.map((arr) => {return arr[0]})
    return tmp_arr;
}

exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.searchRecipes= searchRecipes;
exports.getRecipeReview = getRecipeReview;
exports.createRecipe = createRecipe;
exports.getMyRecipes = getMyRecipes;
exports.getMySpecificRecipe = getMySpecificRecipe;
exports.getMyLastRecipes = getMyLastRecipes;
exports.getPreviews = getPreviews;