import bcrypt from 'bcrypt'
import store from 'store'
import { nanoid } from 'nanoid'
import supabase from '../config/supabaseConfig.js';
import { fileTypeFromStream } from 'file-type';

export const imageUpload = async (image) => {
  try {

    const getFileExtension = filename => filename.includes('.') ? filename.split('.').pop() : null;
    const imagePath = `project_image${nanoid(10)}.${getFileExtension(image.name)}`

    const { data: imageData, error } = await supabase
      .storage
      .from('project_images')
      .upload(`public/${imagePath}`, image.data, {
        upsert: false,
        request: {
          duplex: true,
        },
      });

    if (error) {
      throw new Error(error)
    }

    const { data: imageUrl } = supabase
      .storage
      .from('project_images')
      .getPublicUrl(`public/${imagePath}`)

    console.log(imageUrl)

    return imageUrl.publicUrl;

  } catch (err) {
    // throw new Error(err.message);
  }
};
