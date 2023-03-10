const express = require('express')
const router = express.Router()
const axios = require('axios');
require('dotenv').config();
const { Recipe, Diet } = require('../db');
const {API_KEY, API_URL} = process.env;

//!                   1

const getApiInfo = async () => {
    try
    {
        const resAxios = await axios.get(`${API_URL}/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`);
        const { results } = resAxios.data ;
        // const {status} = resAxios.data;
        // const {code} = resAxios.data
                // console.log("AAAAAAAAAAXXXXXXXXXXXXIIIIIIIIIIOOOOOOOOOOSSSSSSS ",resAxios)
                // console.log("AAAAAAAAAAXXXXXXXXXXXXIIIIIIIIIIOOOOOOOOOOSSSSSSS DATA",resAxios.data)
                // console.log("RESULTADOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO352253524342 RESULTS", results)
                // console.log("RESULTADOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO352253524342 STATUS", status)
                // console.log("RESULTADOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO352253524342 CODE", code)
        console.log(results.length)
            if (results.length > 0) {
                
    
                let respuesta = await results?.map((result) => {
                    return {
                        name: result.title,
                        vegetarian: result.vegetarian,
                        vegan: result.vegan,
                        glutenFree: result.glutenFree,
                        dairyFree: result.dairyFree, 
                        image: result.image, 
                        idApi: result.id, 
                        score: result.spoonacularScore,
                        healthScore: result.healthScore,
                        types: result.dishTypes?.map(element => element),  
                        diets: result.diets?.map(element => element), 
                        summary:result.summary, 
                        steps: (result.analyzedInstructions[0] && result.analyzedInstructions[0].steps?result.analyzedInstructions[0].steps.map(item=>item.step).join(" \n"):'')
                    }        
                })
            
            
            
                // console.log("RESPUESTAAAA",response)
                return respuesta;
        } 
            

    }catch (error) {
        console.error("ERROR",error.response.data.message);
        // console.log(error)
        // alert(error)
        // return("LA CONEXION CON LA API FALL??")
        // return ([])
        // res.status(404).json({error: error.response.data.message})
        return error
    }
}

//!                   2

const getDBInfo = async () => {
        try{
            const dataDB =  await Recipe.findAll({ 
                include:{
                    model: Diet,
                    attributes: ['name'],
                    through:{
                        attributes: []
                    }
                }
            })
            let response = await dataDB?.map(recipe => {
                    return {
                        id: recipe.id,
                        name: recipe.name,
                        summary: recipe.summary,
                        score: recipe.score,
                        healthScore: recipe.healthScore,
                        image: recipe.image,
                        steps: recipe.steps,
                        diets: recipe.diets?.map(diet => diet.name),
                    }
                });
            return response;
        }catch (error) {
            console.error("ERROR getDBInfo",error);
        }
    }



    const getAllInfo = async () => {
            try{
                const apiInfo = await getApiInfo();
                const bdInfo = await getDBInfo();
                const infoTotal = apiInfo.concat(bdInfo);
                return infoTotal;
            }catch (error) {
                console.error("ERROR getAllInfo",error);

            }
        }




const getApiByName = async (name) => {

            try{
                const resAxios = await axios.get(`${API_URL}/recipes/complexSearch?query=${name}&addRecipeInformation=true&number=100&apiKey=${API_KEY}`);
                const {results}  = resAxios.data;
                if(results.length > 0){
                    let response = results?.map((result) => {
                        return {
                            name: result.title,
                            vegetarian: result.vegetarian,
                            vegan: result.vegan,
                            glutenFree: result.glutenFree,
                            dairyFree: result.dairyFree, 
                            image: result.image, 
                            idApi: result.id, 
                            score: result.spoonacularScore,
                            healthScore: result.healthScore,
                            types: result.dishTypes?.map(element => element),  
                            diets: result.diets?.map(element => element), 
                            summary:result.summary, 
                            steps: (result.analyzedInstructions[0] && result.analyzedInstructions[0].steps?result.analyzedInstructions[0].steps.map(item=>item.step).join(" \n"):'')
                        }
                    })
                return response           
            }

            else{
                console.log("NO hay coincidencia en la API");
                //return ('error');
            }

            }catch (error) {
                
                return (console.log("ERROR getApiByName",error))
            }
        }


        const getDBByName = async (name) => {
            try{
                const DBInfo = await getDBInfo();
                const filtByName = DBInfo.filter(recipe => recipe.name.includes(name));

                return filtByName;
            }catch (error) {
                return (console.log(error))
            } 
        }

        const getInfoByName = async (name) => {
            try{
                const apiByName = await getApiByName(name)
                const DBByName = await getDBByName(name)
                const infoTotal = apiByName.concat(DBByName)
                return infoTotal
            }catch (error) {
                return ( "ERROR getInfoByName",console.log(error))
            }
        }     

router.get('/', async (req, res) => {
    
        const { name } = req.query
    
        if (name) {
            const infoByName = await getInfoByName(name);
            if (infoByName !== 'error'){
                console.log("Se encontro coincidencia con name")
                console.log(infoByName)
                infoByName.length > 0 ? res.json(infoByName) : res.status(400).json({ name:'not found any recipes'});
            }else{
                console.log("Error")
                res.status(404).json([{ name: 'Error'}])
            }
    
        }else{
           // para no confundir a home, si no hay un name de busqueda muestra toda la info.
            const allDate = await getAllInfo() 
            if (allDate !== 'error'){  
                res.json(allDate);
            }else{
                res.status(404).json({message:'Error en la b??squeda de datos'})
            }
        }
            // try {
            //     const allDate = await getAllInfo() 
            //     if (allDate !== 'error'){  
            //         res.status(200).json(allDate, "HOLAA");
            //     }    
            // } catch (error) {
                
            //     res.status(404).json({message:'Error en la b??squeda de datos'})
            // }
            
            // }
    
        
    });




    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        
        try{
            if (id.length > 12){
                const dataDB = await Recipe.findByPk(id,{
                    include: {
                    model: Diet,
                    atributes: ["name"],
                    through: {
                        attributes: [],
                        },
                    },
                });
                if(dataDB){
                const obj = {
                    id: dataDB.id,
                    name: dataDB.name,
                    summary: dataDB.summary,
                    score: dataDB.score,
                    healthScore: dataDB.healthScore,
                    image: dataDB.image,
                    steps: dataDB.steps,
                    diets: dataDB.diets?.map(diet => diet.name)
                }
                    res.json(obj)
                }else{
                    console.log('bd')
                    const objerr = {
                        name: 'Recipe not Found',
                        summary: 'None',
                        score: 0,
                        healthScore: 0,
                        image: 'https://www.knownhost.com/blog/wp-content/uploads/2017/11/404-Error-Message.jpg',
                        steps: 'none',
                        diets: []
                    }
                    res.json(objerr)
                }
            }else{
    
                const resAxios = await axios.get(`${API_URL}/recipes/${id}/information?apiKey=${API_KEY}`);
                // console.log("RESAXIOS", resAxios)
                // console.log("RESAXIOS.DATA.RESULT", resAxios.data)
                const result = resAxios.data;
                // console.log("HOOAOASODOSDOADODOSA", result)
                let obj = {};
    
                obj = {
                    name: result.title, 
                    vegetarian: result.vegetarian,
                    vegan: result.vegan,
                    glutenFree: result.glutenFree,
                    dairyFree: result.dairyFree,
                    image: result.image, 
                    idApi: result.id, 
                    score: result.spoonacularScore, 
                    healthScore: result.healthScore, 
                    diets: result.diets?.map(element => element),types: result.dishTypes?.map(element => element), 
                    summary:result.summary, 
                    steps: result.instructions
                    }
                console.log(obj)
                if (obj){
                    res.json(obj);
                }else{
    
                    let objerrors
    
                    objerrors = {
                        name: 'Recipe not Found', 
                        image: 'https://www.knownhost.com/blog/wp-content/uploads/2017/11/404-Error-Message.jpg',  
                        score: 0, 
                        healthScore: 0, 
                        diets: [], 
                        summary:'none', 
                        steps: 'none'}
    
                    res.json(objerrors)
                }
            }
        }catch(e){
            let objerr
        
            objerr = {name: 'only enter numbers less than 100000 or UUID code', 
            image: 'https://www.knownhost.com/blog/wp-content/uploads/2017/11/404-Error-Message.jpg',  
            score: 0, 
            healthScore: 0, 
            diets: [], 
            summary:'none', 
            steps: 'none'}
    
        res.status(404).json(objerr)
        }
    })
    

module.exports = router