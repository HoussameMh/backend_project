const Project=require('../models/Project')
const {StatusCodes}=require('http-status-codes')
const {BadRequestError,NotFoundError}=require('../errors')

const getAllProjects = async (req, res) => {
  const { title, category, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (title) {
    queryObject.title = { $regex: title, $options: 'i' };
  }
  if (category) {
    queryObject.category = category;
  }
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );

    const options = ['goalAmount', 'currentAmount', 'minAmount','backersCount'];
    
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Project.find(queryObject);

  if (sort) {
    const sortList = sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('-createdAt');
  }

  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const projects = await result;
  res.status(200).json({ projects, count: projects.length });
};


const  getProject=async (req,res)=>{
  const {params:{id:projectId}}=req
  const project = await Project.findOne({
    _id:projectId
  }).populate('createdBy','name') 
    .populate('rewards'); 
  if(!project){
    throw new NotFoundError(`no project with id ${projectId}`)
  }
  res.status(StatusCodes.OK).json({project})
}

const  createProject=async (req,res)=>{
  req.body.createdBy =req.user.userId
  
  const project=await Project.create(req.body)
  res.status(StatusCodes.CREATED).json({project})

}
const  updateProject=async (req,res)=>{
  const {
    body:{title,description},
    user:{userId},
    params:{id:projectId}
  }=req

  if(title==='' || description===''){
    throw new BadRequestError('title and description can not be empty')
  }
  const project= await Project.findOneAndUpdate({_id:projectId, createdBy:userId},req.body,
    {new:true,runValidators:true})
  if(!project){
    throw new NotFoundError(`no project with id ${projectId} or it's not yours`)
  }
  
  res.status(StatusCodes.OK).json({project})
}


const  deleteProject=async (req,res)=>{
  const {user:{userId},params:{id:projectId}}=req
  const project = await Project.findOneAndDelete({
    _id:projectId,createdBy:userId
  })
  if(!project){
    throw new NotFoundError(`no project with id ${projectId} or it's not yours`)
  }
  
  res.status(StatusCodes.OK).send()
}

const postUpdate = async (req, res) => {
  const {
    body: { title, content }, 
    user: { userId },
    params: { id: projectId }
  } = req

  if (!title || !content) {
    throw new BadRequestError('News title and content cannot be empty')
  }

  const project = await Project.findOneAndUpdate(
    { _id: projectId, createdBy: userId }, 
    { 
      $push: { 
        updates: { title, content } 
      } 
    },
    { new: true, runValidators: true }
  )

  if (!project) {
    throw new NotFoundError(`No project with id ${projectId}  or not yours`)
  }
  
  res.status(StatusCodes.OK).json({ updates: project.updates })
}

const getProjectBackers = async (req, res) => {
  const { id: projectId } = req.params;

  const project = await Project.findOne({ _id: projectId })
    .populate('backers', 'name email'); 

  if (!project) {
    throw new NotFoundError(`Pas de projet avec l'id ${projectId}`);
  }

  res.status(StatusCodes.OK).json({ 
    backers: project.backers, 
    count: project.backers.length 
  });
};


module.exports={
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  postUpdate,
  getProjectBackers
}





