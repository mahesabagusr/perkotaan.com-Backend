import fileUpload from 'express-fileupload';
import supabase from '../config/supabaseConfig.js';
import { uploadProjectSchema } from '../models/model.js';
import { submissionProjectSchema } from '../models/projectModel.js';
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

    const { data: projects, error: err } = await supabase
      .from('project')
      .select('id,project_name, description,budget,width,height,target_time,start_time,image_url ,city (name, province(name))')
      .eq('id', id)

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      width: project.width,
      height: project.height,
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
      .select('id,project_name, description,budget,width,height,target_time,start_time,image_url ,city (name, province(name))')

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      width: project.width,
      height: project.height,
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
    if (!req.files.image || !req.files.proposal) {
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

    const { image, report } = req.files;
    const { projectName, description, budget, targetTime, width, height, startTime, cityId } = req.body

    const imageUrl = await imageUpload('public', 'project_images', image)
    const reportUrl = await imageUpload('public', 'project_report', report)

    const { data: project, error: err } = await supabase
      .from('project')
      .insert({ project_name: projectName, description: description, budget: budget, target_time: targetTime, width: width, height: height, start_time: startTime, image_url: imageUrl, report_url: reportUrl, city_id: cityId })
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
      .select('id,project_name, description,budget,width,height,target_time,start_time,image_url ,city (name, province(name))')
      .eq('city_id', id)

    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }

    const formattedData = projects.map(project => ({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      budget: project.budget,
      width: project.width,
      height: project.height,
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
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}

export const projectSubmission = async (req, res) => {
  try {
    if (!req.files.image || !req.files.proposal) {
      res.status(422).json({
        status: 'fail',
        message: 'Image atau Proposal harus di upload'
      })
    }

    const { error, value } = submissionProjectSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Upload Gagal, ${error.message}`
      })
      return response
    }

    const { name, address, nik, width, height, city_id } = req.body;
    const { id } = req.params
    const { image } = req.files

    const imageUrl = await imageUpload('public', 'submission_images', image)

    const { data: submission, error: err } = await supabase
      .from('project_submission')
      .insert({ name: name, address: address, nik: nik, width: width, height: height, image_url: imageUrl, user_id: id, city_id: city_id })
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
      data: submission
    })

  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}

export const projectSubmissionHistoryById = async (req, res) => {
  try {

    const { id } = req.params

    const { data, error } = await supabase
      .from('project_submission')
      .select('name,address,nik,price,width,height,image_url,user_id, city(name, province(name))')
      .eq('user_id', id)

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Get Gagal, ${error.message}`
      })
      return response
    }

    const formattedData = data.map(project => ({
      name: project.name,
      address: project.address,
      nik: project.nik,
      price: project.price,
      width: project.width,
      height: project.height,
      image_url: project.image_url,
      user_id: project.user_id,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.status(200).json({
      status: 'success',
      data: formattedData,
    })

  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}

export const projectSubmissionHistory = async (req, res) => {
  try {

    const { id } = req.params

    const { data, error } = await supabase
      .from('project_submission')
      .select('name,address,nik,price,width,height,image_url,user_id, city(name, province(name))')

    if (error) {
      const response = res.status(400).json({
        status: 'fail',
        message: `Get Gagal, ${error.message}`
      })
      return response
    }

    const formattedData = data.map(project => ({
      name: project.name,
      address: project.address,
      nik: project.nik,
      price: project.price,
      width: project.width,
      height: project.height,
      image_url: project.image_url,
      user_id: project.user_id,
      city: project.city.name,
      province: project.city.province.name
    }));

    return res.status(200).json({
      status: 'success',
      data: formattedData,
    })

  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}

// export const projectSubmissionHistory = async (req, res) => {
//   try {

//     const { data, error } = await supabase
//       .from('project_submission')
//       .select('name,address,nik,price,width,height,image_url,user_id, city(name, province(name))')

//     if (error) {
//       const response = res.status(400).json({
//         status: 'fail',
//         message: `Get Gagal, ${error.message}`
//       })
//       return response
//     }

//     const formattedData = data.map(project => ({
//       name: project.name,
//       address: project.address,
//       nik: project.nik,
//       price: project.price,
//       width: project.width,
//       height: project.height,
//       image_url: project.image_url,
//       user_id: project.user_id,
//       city: project.city.name,
//       province: project.city.province.name
//     }));

//     return res.status(200).json({
//       status: 'success',
//       data: data,
//     })

//   } catch (err) {
//     return res.status(500).json({ status: 'error', error: err.message });
//   }
// }
