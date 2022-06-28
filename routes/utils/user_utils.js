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

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markAsSeen = markAsSeen;
