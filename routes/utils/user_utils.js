const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}','${recipe_id}')`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from favoriterecipes where userId='${user_id}'`);
    return recipes_id;
}

async function markAsSeen(user_id, recipe_id){
  
    await DButils.execQuery(`delete from seenrecipes where userId = '${user_id}' AND recipeId = '${recipe_id}'`);

    await DButils.execQuery(`insert into seenrecipes values ('${user_id}','${recipe_id}')`);
}

async function getFamilyRecipes(user_id){ // the family recipes are with popularity = -1
    let recipes = await DButils.execQuery(`select * from recipes where userId = '${user_id}' AND popularity = '-1'`);
    recipes = recipes.map(async (recipe) => {
        let { recipeId, recipeName, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, instructions, servings } = recipe;
        if (vegan == "true") vegan=true;
        else vegan=false;
        if (vegetarian == "true") vegetarian=true;
        else vegetarian=false;
        if (glutenFree == "true") glutenFree=true;
        else glutenFree=false;
        let ingredients = await DButils.execQuery(`select ingredientName, amount, units from ingredients where recipeId = '${recipeId}'`);
        return {
            recipeId : recipeId,
            title : recipeName,
            readyInMinutes : readyInMinutes,
            image : image, 
            popularity : popularity,
            vegan : vegan,
            vegetarian : vegetarian,
            glutenFree : glutenFree,
            instructions : instructions, 
            servings : servings,
            ingredients : ingredients
        }
    });
    let results = await Promise.all(recipes);
    return results;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markAsSeen = markAsSeen;
exports.getFamilyRecipes = getFamilyRecipes;
