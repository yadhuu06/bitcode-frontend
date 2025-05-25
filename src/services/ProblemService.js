import axios from 'axios';
import store from '../store';
import api from '../api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createQuestion=async(questionData)=>{
    try{
        const response = await api.post(`/problems/create/`, questionData);

    return response.data
    }
    catch(error){
        throw error;
    }
   
}


export const fetchQuestions=async()=>{
    try{
    const response=await api.get('/problems')
    return response.data;

        
    }
    catch(error)
  {
    console.log("eroor",error)
    throw error
  }

}