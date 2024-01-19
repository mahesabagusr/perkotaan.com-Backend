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
      .select('*')

    const spreadProvince = await provinces.map(c => { return { id: c.id, name: c.name } })

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
      .select('*')

    const spreadCity = city.map(c => { return { id: c.id, name: c.name } })

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

export const getCityByProvinceId = async (req, res) => {
  try {
    const { id } = req.params

    const { data: city, error } = await supabase
      .from('city')
      .select('*')
      .eq('province_id', id)

    const spreadCity = city.map(c => { return { id: c.id, name: c.name } })

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

}

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params

    const { data: city } = await supabase
      .from('city')
      .select('*')
      .eq('id', id)

    const spreadCity = city.map(c => { return { id: c.id, name: c.name } })

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
}

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params

    const { data: project, error } = await supabase
      .from('project')
      .select(`id,project_name, description,budget,target_time,start_time,image_url ,city (name, province(name))`)
      .eq('id', id)

    if (error) {
      return res.status(500).json({ status: 'error', error: error.message });
    }

    const formattedData = project.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      target_time: project.target_time,
      start_time: project.start_time,
      image_url: project.image_url,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.json({
      status: 'success',
      data: formattedData
    })

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
      .select('id,project_name, description,budget,target_time,start_time,image_url ,city(name, province(name))')
      .range(offset, pageSize - 1)
      .order('id', { ascending: true });

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      target_time: project.target_time,
      start_time: project.start_time,
      image_url: project.image_url,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.json({
      status: 'success', data: formattedData
    });

  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }

}

export const searchProjects = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toLowerCase();

    const { data, error } = await supabase
      .from('project')
      .select('id, project_name, description, budget, target_time, start_time, image_url, city (name, province(name))')
      .ilike('project_name', `%${searchTerm}%`);

    const formattedData = data.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      target_time: project.target_time,
      start_time: project.start_time,
      image_url: project.image_url,
      city: project.city.name,
      province: project.city.province.name
    }));

    const response = res.status(200).json({
      status: 'success',
      data: formattedData,
    });

    return response

  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }
}

export const getAllProjects = async (req, res) => {
  try {
    const { data: projects, error: err } = await supabase
      .from('project')
      .select('id,project_name, description,budget,target_time,start_time,image_url ,city (name, province(name))')

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      target_time: project.target_time,
      start_time: project.start_time,
      image_url: project.image_url,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.json({
      status: 'success',
      data: formattedData,

    });
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

  
    const imageUrl = await imageUpload('public', 'project_images', image)

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
export const getProjectByCityId = async (req, res) => {
  try {
    const { id } = req.params
    const { data: projects, error: err } = await supabase
      .from('project')
      .select('id,project_name, description,budget,target_time,start_time,image_url ,city (name, province(name))')
      .eq('city_id', id)

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      target_time: project.target_time,
      start_time: project.start_time,
      image_url: project.image_url,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.json({
      status: 'success',
      data: formattedData,

    });
  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }

}
