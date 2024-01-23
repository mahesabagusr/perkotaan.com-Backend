import supabase from '../config/supabaseConfig.js';

export const postComment = async (req, res) => {
  try {
    const { body, userId } = req.body
    const { projectId } = req.params

    const { data: comment, error } = await supabase
      .from('comment')
      .insert({ body: body, user_id: userId, project_id: projectId })
      .select()

    return res.status(200).json({
      status: 'success',
      message: 'Comment uploaded successfully',
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }
}

export const getCommentByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params

    const { data: comment, error } = await supabase
      .from('comment')
      .select('body, users(first_name, last_name, username, image_url)')
      .eq('project_id', projectId)

    const formattedData = comment.map(comment => ({
      body: comment.body,
      first_name: comment.users.first_name,
      last_name: comment.users.last_name,
      username: comment.users.username,
      image_url: comment.users.image_url
    }));

    return res.status(200).json({
      status: 'success',
      data: formattedData,
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: `Internal Server Error: ${err.message}`
    });
  }

}