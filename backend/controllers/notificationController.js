import { Notification } from '../models/index.js';
export async function list(req,res,next){try{res.json(await Notification.find({recipient:req.user._id}).populate('actor','name email').sort({createdAt:-1}));}catch(e){next(e)}}
export async function remove(req,res,next){try{const item=await Notification.findOneAndDelete({_id:req.params.id,recipient:req.user._id});if(!item)return res.status(404).json({message:'Notification not found.'});res.json({message:'Notification removed.'});}catch(e){next(e)}}
