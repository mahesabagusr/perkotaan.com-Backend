import bcrypt from 'bcrypt'
import store from 'store'
import { nanoid } from 'nanoid'
import supabase from '../config/supabaseConfig.js';
import { uploadProjectSchema } from '../models/model.js';
import { imageUpload } from '../services/projectService.js';

export const searchProvince = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toUpperCase();

    const { data: search, error } = await supabase
      .from('province')
      .select('*')
      .like('name', `%${searchTerm}%`);

    if (error) {
      throw error;
    }

    const response = res.status(200).json({
      status: 'success',
      data: search
    });

    return response;
  } catch (err) {

    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }
};


export const searchCity = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toUpperCase();

    const { data: search, error } = await supabase
      .from('city')
      .select('*')
      .like('name', `%${searchTerm}%`);

    if (error) {
      throw error;
    }

    const response = res.status(200).json({
      status: 'success',
      data: search
    });

    return response;
  } catch (err) {

    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });

  }
};

export const getProvince = async (req, res) => {
  try {
    const { data: provinces } = await supabase
      .from('province')
      .select('name')

    const spreadProvince = provinces.map(c => c.name)

    res.status(200).json({
      status: 'success',
      data: spreadProvince
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }
};

export const getCity = async (req, res) => {
  try {
    const { data: city } = await supabase
      .from('city')
      .select('name')

    const spreadCity = city.map(c => c.name)

    res.status(200).json({
      status: 'success',
      data: spreadCity
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }
};

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params

    const { data: city } = await supabase
      .from('city')
      .select('name')
      .eq('id', id)

    res.status(200).json({
      status: 'success',
      data: city
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }
}

export const getProjectByUid = async (req, res) => {
  try {
    const { uid } = req.params

    const { data: project, error } = await supabase
      .from('project')
      .select(`  project_name, description,budget,target_time,start_time,image_url ,city (name, province(name))`)
      .eq('uid', uid)

    return res.json({
      project_name: project[0].project_name,
      description: project[0].description,
      budget: project[0].budget,
      target_time: project[0].target_time,
      start_time: project[0].start_time,
      image_url: project[0].image_url,
      city: project[0].city.name,
      province: project[0].city.province.name
    }
    )
  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }
}

export const getProjectWithPagination = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.params;
    const offset = (page - 1) * pageSize;

    const { data: projects, error: err } = await supabase
      .from('project')
      .select('*')
      .range(offset, pageSize - 1)
      .order('id', { ascending: true });

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    return res.json({ status: 'success', data: projects });

  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }

}

export const postProject = async (req, res) => {
  try {

    if (!req.files.image) {
      res.status(422).json({
        status: 'fail',
        message: 'Image harus di upload'
      })
    }

    const { error, value } = uploadProjectSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${error.message}`
      })
      return response
    }

    const image = req.files.image;
    const { projectName, description, budget, targetTime, startTime, cityId } = req.body


    const imageUrl = await imageUpload(image)

    const { data: project, error: err } = await supabase
      .from('project')
      .insert({ project_name: projectName, description: description, budget: budget, target_time: targetTime, start_time: startTime, image_url: imageUrl, city_id: cityId })
      .select()

    if (err) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${err.message}`
      })
      return response
    }

    return res.status(200).json({
      status: 'success',
      message: 'file uploaded successfully',
      data: project
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }

}