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

async function getRecipesPreview(recipes_ids_list){
    let promises = [];
    recipes_ids_list.map((id) => {
        promises.push(getRecipeInformation(id.id));
    });
    let info_res = await Promise.all(promises);
    return extractPreviewRecipeDetails(info_res);
    // return extractPreviewRecipeDetails(promises);
}


// preview information
async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}

/**
 * extract the specifics details for preview recipe
 * @param {*} recipes_info 
 * @returns list of recipes with preview data
 */
function extractPreviewRecipeDetails(recipes_info){

    return recipes_info.map((recipe_info) => {

        let data = recipe_info;
        if (recipe_info.data){
            data = recipe_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
        } = data;
        return {
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
        }
    });
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

async function getRandomThreeRecipes(){
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.title))
    if (filtered_random_pool < 3)
        return getRandomThreeRecipes();
    return extractPreviewRecipeDetails([filtered_random_pool[0],filtered_random_pool[1],filtered_random_pool[2]])
}

async function searchRecipes(query_params, query){
    const {
        number,
        cuisine,
        diet,
        intolerance
    } = query_params;
    // if (query_params.number)
    //     number = query_params.number
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey,
            query: query,
            instructionsRequired: true,
            cuisine: cuisine,
            diet: diet,
            intolerance: intolerance
        }
    });

    let extract_ids = response.data.results.map((recipe_info) => {
        
        let data = recipe_info;
        if (recipe_info.results){
            data = recipe_info.results;
        }
        const id = data.id;
        
        return {
            id: id
        }
    });

    return getRecipesPreview(extract_ids)
}

/**
 * function for seif 7 
 */
async function getRecipeReview(recipe_id){
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, servings, extendedIngredients } = recipe_info.data;
    extendedIngredients = extendedIngredients.map((ingredient) => {
        return {
            ingredientName: ingredient.name,
            amout: ingredient.amount
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
        instructions: instructions,
        servings: servings,
        ingredients: extendedIngredients
    }

}
/**
 * create new recipe
 * @param {*} user_id logged in user
 * @param {*} recipe_name recipe name 
 * @param {*} query_params all the details of the recipe
 * TODO: add Ingredients
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
    await DButils.execQuery(`insert into recipes values ('${user_id}' ,'${size_table[0].count}' ,'${recipe_name}', ${readyInMinutes}, ${image}, ${aggregateLikes}, '${vegan}', '${vegetarian}', '${glutenFree}', '${instructions}', '${servings}')`);
    // ingredients = list : [dict(name : ingredientName_1, amout: amount_1), dict(name: ingredientName_2, amout: amount_2), ...]
    ingredients.map(async (data) => {
        await DButils.execQuery(`insert into ingredients values ('${size_table[0].count}', '${data.name}', '${data.amout}')`);
    });
}

/**
 * get list of all my recipes for My Recipes Page , seif 11
 * @param {*} user_id 
 */
async function getMyRecipes(user_id){
    let all_my_recipes = await DButils.execQuery(`select * from recipes where userId = '${user_id}'`);
    let extract_details = all_my_recipes.map((recipe) => {
        let { recipeName, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree } = recipe;
        return {
            recipeName: recipeName,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: popularity,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
        }
    });

    return extract_details;
}

/**
 * function for review of a specific recipe from My Recipes Page
 */
async function getMySpecificRecipe(user_id, recipe_name){
    let my_recipe = await DButils.execQuery(`select * from recipes where userId = '${user_id}' AND recipeName = '${recipe_name}'`);
    let ingredients = await DButils.execQuery(`select ingredientName, amount from ingredients where recipeId = '${my_recipe[0].recipeId}'`);
    let { recipeName, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, instructions, servings } = my_recipe[0];
    return {
        recipeName: recipeName,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        instructions: instructions,
        servings: servings,
        ingredients: ingredients
    }
}



exports.getRecipeDetails = getRecipeDetails;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipes= searchRecipes;
exports.getRecipeReview = getRecipeReview;
exports.createRecipe = createRecipe;
exports.getMyRecipes = getMyRecipes;
exports.getMySpecificRecipe = getMySpecificRecipe;
